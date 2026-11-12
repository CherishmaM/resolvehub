import { Project } from '../models/Project.js';
import { User } from '../models/User.js';
import { Issue, ISSUE_PRIORITIES, ISSUE_CATEGORIES } from '../models/Issue.js';
import { ApiError } from '../utils/apiError.js';

const POPULATE_FIELDS = 'name email avatar role jobTitle';

/**
 * Checks if a user has admin privileges over a specific project.
 * An organization admin has full control over all projects.
 * A project admin has administrative control within their assigned project.
 */
export const hasProjectAdminAccess = (project, user) => {
  if (!user) return false;
  if (user.role === 'admin') return true;

  return project.members.some(
    (m) =>
      m.user._id?.toString() === user._id?.toString() ||
      m.user?.toString() === user._id?.toString()
  ) && project.members.some(
    (m) =>
      (m.user._id?.toString() === user._id?.toString() ||
        m.user?.toString() === user._id?.toString()) &&
      m.role === 'project_admin'
  );
};

/**
 * Checks if a user is a member of a project (or an organization admin).
 */
export const hasProjectAccess = (project, user) => {
  if (!user) return false;
  if (user.role === 'admin') return true;

  return project.members.some(
    (m) =>
      m.user._id?.toString() === user._id?.toString() ||
      m.user?.toString() === user._id?.toString()
  );
};

export const getProjects = async (user) => {
  const filter = {};
  if (user.role !== 'admin') {
    filter['members.user'] = user._id;
  }

  const projects = await Project.find(filter)
    .sort({ createdAt: -1 })
    .populate('createdBy', POPULATE_FIELDS)
    .populate('members.user', POPULATE_FIELDS);

  // Attach quick issue stats for each project
  const projectIds = projects.map((p) => p._id);
  const issueCounts = await Issue.aggregate([
    { $match: { projectId: { $in: projectIds } } },
    {
      $group: {
        _id: { projectId: '$projectId', status: '$status' },
        count: { $sum: 1 },
      },
    },
  ]);

  const statsMap = {};
  issueCounts.forEach((item) => {
    const pId = item._id.projectId.toString();
    const status = item._id.status;
    if (!statsMap[pId]) {
      statsMap[pId] = { total: 0, open: 0, inProgress: 0, resolved: 0 };
    }
    statsMap[pId].total += item.count;
    if (status === 'Open') statsMap[pId].open += item.count;
    if (status === 'In Progress') statsMap[pId].inProgress += item.count;
    if (status === 'Resolved') statsMap[pId].resolved += item.count;
  });

  return projects.map((p) => {
    const pObj = p.toJSON();
    const stats = statsMap[p._id.toString()] || { total: 0, open: 0, inProgress: 0, resolved: 0 };
    return {
      ...pObj,
      issueStats: stats,
      memberCount: p.members?.length || 0,
      currentUserRole: user.role === 'admin'
        ? 'org_admin'
        : p.members.find((m) => (m.user?._id || m.user).toString() === user._id.toString())?.role || null,
    };
  });
};

export const getProjectById = async (id, user) => {
  const project = await Project.findById(id)
    .populate('createdBy', POPULATE_FIELDS)
    .populate('members.user', POPULATE_FIELDS);

  if (!project) {
    throw ApiError.notFound('Project not found');
  }

  if (!hasProjectAccess(project, user)) {
    throw ApiError.forbidden('Access denied. You are not a member of this project.');
  }

  const pObj = project.toJSON();
  const currentUserRole = user.role === 'admin'
    ? 'org_admin'
    : project.members.find((m) => (m.user?._id || m.user).toString() === user._id.toString())?.role || null;

  return {
    ...pObj,
    currentUserRole,
    isProjectAdmin: user.role === 'admin' || currentUserRole === 'project_admin',
  };
};

export const createProject = async ({ name, key, description, status = 'Active', initialMemberIds = [] }, user) => {
  // Only organization admin can create new projects
  if (user.role !== 'admin') {
    throw ApiError.forbidden('Only organization administrators can create new projects.');
  }

  const normalizedKey = key.trim().toUpperCase();
  const existingKey = await Project.findOne({ key: normalizedKey });
  if (existingKey) {
    throw ApiError.conflict(`A project with key '${normalizedKey}' already exists.`);
  }

  const members = [
    {
      user: user._id,
      role: 'project_admin',
      joinedAt: new Date(),
    },
  ];

  if (Array.isArray(initialMemberIds) && initialMemberIds.length > 0) {
    const validUsers = await User.find({ _id: { $in: initialMemberIds }, isActive: true });
    for (const validUser of validUsers) {
      if (validUser._id.toString() !== user._id.toString()) {
        members.push({
          user: validUser._id,
          role: validUser.role === 'admin' ? 'project_admin' : 'project_member',
          joinedAt: new Date(),
        });
      }
    }
  }

  const project = await Project.create({
    name: name.trim(),
    key: normalizedKey,
    description: description ? description.trim() : '',
    status,
    createdBy: user._id,
    members,
  });

  return getProjectById(project._id, user);
};

export const updateProject = async (id, updates, user) => {
  const project = await Project.findById(id);
  if (!project) {
    throw ApiError.notFound('Project not found');
  }

  if (!hasProjectAdminAccess(project, user)) {
    throw ApiError.forbidden('Only project administrators can modify project settings.');
  }

  if (updates.name) project.name = updates.name.trim();
  if (updates.description !== undefined) project.description = updates.description.trim();
  if (updates.status) project.status = updates.status;

  await project.save();
  return getProjectById(project._id, user);
};

export const deleteProject = async (id, user) => {
  const project = await Project.findById(id);
  if (!project) {
    throw ApiError.notFound('Project not found');
  }

  if (user.role !== 'admin') {
    throw ApiError.forbidden('Only organization administrators can delete projects.');
  }

  const totalProjects = await Project.countDocuments();
  if (totalProjects <= 1) {
    throw ApiError.badRequest('Cannot delete the only existing project in the organization.');
  }

  // Delete all issues in this project
  await Issue.deleteMany({ projectId: project._id });
  await Project.findByIdAndDelete(project._id);

  return { message: `Project '${project.name}' and all associated tickets have been deleted.` };
};

export const addProjectMember = async (id, { userId, role = 'project_member' }, user) => {
  const project = await Project.findById(id);
  if (!project) {
    throw ApiError.notFound('Project not found');
  }

  if (!hasProjectAdminAccess(project, user)) {
    throw ApiError.forbidden('Only project administrators can add members to this project.');
  }

  const targetUser = await User.findById(userId);
  if (!targetUser || !targetUser.isActive) {
    throw ApiError.badRequest('Target user does not exist or is inactive.');
  }

  const alreadyMember = project.members.some(
    (m) => m.user.toString() === targetUser._id.toString()
  );
  if (alreadyMember) {
    throw ApiError.conflict('This user is already a member of the project.');
  }

  project.members.push({
    user: targetUser._id,
    role,
    joinedAt: new Date(),
  });

  await project.save();
  return getProjectById(project._id, user);
};

export const updateProjectMemberRole = async (id, targetUserId, newRole, user) => {
  const project = await Project.findById(id);
  if (!project) {
    throw ApiError.notFound('Project not found');
  }

  if (!hasProjectAdminAccess(project, user)) {
    throw ApiError.forbidden('Only project administrators can change member roles.');
  }

  const member = project.members.find(
    (m) => m.user.toString() === targetUserId.toString()
  );
  if (!member) {
    throw ApiError.notFound('User is not a member of this project.');
  }

  member.role = newRole;
  await project.save();
  return getProjectById(project._id, user);
};

export const removeProjectMember = async (id, targetUserId, user) => {
  const project = await Project.findById(id);
  if (!project) {
    throw ApiError.notFound('Project not found');
  }

  if (!hasProjectAdminAccess(project, user)) {
    throw ApiError.forbidden('Only project administrators can remove members from this project.');
  }

  const memberIndex = project.members.findIndex(
    (m) => m.user.toString() === targetUserId.toString()
  );
  if (memberIndex === -1) {
    throw ApiError.notFound('User is not a member of this project.');
  }

  project.members.splice(memberIndex, 1);
  await project.save();
  return getProjectById(project._id, user);
};

export const getProjectStats = async (id, user) => {
  const project = await Project.findById(id);
  if (!project) {
    throw ApiError.notFound('Project not found');
  }

  if (!hasProjectAccess(project, user)) {
    throw ApiError.forbidden('Access denied. You are not a member of this project.');
  }

  const [
    totalIssues,
    openIssues,
    inProgressIssues,
    resolvedIssues,
    priorityAgg,
    categoryAgg,
    recentIssues,
  ] = await Promise.all([
    Issue.countDocuments({ projectId: project._id }),
    Issue.countDocuments({ projectId: project._id, status: 'Open' }),
    Issue.countDocuments({ projectId: project._id, status: 'In Progress' }),
    Issue.countDocuments({ projectId: project._id, status: 'Resolved' }),
    Issue.aggregate([
      { $match: { projectId: project._id } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]),
    Issue.aggregate([
      { $match: { projectId: project._id } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]),
    Issue.find({ projectId: project._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('createdBy', POPULATE_FIELDS)
      .populate('assignedTo', POPULATE_FIELDS),
  ]);

  const priorityMap = priorityAgg.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  const categoryMap = categoryAgg.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  return {
    totals: {
      total: totalIssues,
      open: openIssues,
      inProgress: inProgressIssues,
      resolved: resolvedIssues,
      memberCount: project.members.length,
    },
    priorityDistribution: ISSUE_PRIORITIES.map((p) => ({
      name: p,
      count: priorityMap[p] || 0,
    })),
    categoryDistribution: ISSUE_CATEGORIES.map((c) => ({
      name: c,
      count: categoryMap[c] || 0,
    })),
    recentIssues,
  };
};
