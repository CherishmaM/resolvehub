import { Issue } from '../models/Issue.js';
import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { Comment } from '../models/Comment.js';
import { Activity } from '../models/Activity.js';
import { Notification } from '../models/Notification.js';
import { ApiError } from '../utils/apiError.js';
import { logActivity } from './activity.service.js';
import { notifyIssueCreated, notifyTaskAssigned } from './notification.service.js';
import { hasProjectAccess, hasProjectAdminAccess } from './project.service.js';

const POPULATE_FIELDS = 'name email avatar role jobTitle';
const POPULATE_PROJECT = 'name key status';

export const createIssue = async ({
  title,
  description,
  category,
  priority = 'Medium',
  assignedTo = null,
  imageUrl = null,
  projectId = null,
  user,
}) => {
  // 1. Resolve target project
  let targetProjectId = projectId;
  if (!targetProjectId) {
    const defaultProject =
      (await Project.findOne(user.role === 'admin' ? {} : { 'members.user': user._id })) ||
      (await Project.findOne());
    if (!defaultProject) {
      throw ApiError.badRequest('No project available to assign this issue to.');
    }
    targetProjectId = defaultProject._id;
  }

  const project = await Project.findById(targetProjectId);
  if (!project) {
    throw ApiError.notFound('Project not found');
  }

  // Access check: User must be assigned to this project (or organization admin)
  if (!hasProjectAccess(project, user)) {
    throw ApiError.forbidden('Access denied. You are not a member of this project.');
  }

  let assigneeUser = null;
  if (assignedTo) {
    assigneeUser = await User.findById(assignedTo);
    if (!assigneeUser || !assigneeUser.isActive) {
      throw ApiError.badRequest('Assigned user does not exist or is inactive');
    }
    // Verify assignee is also a member of this project (or organization admin)
    if (!hasProjectAccess(project, assigneeUser)) {
      throw ApiError.badRequest(`User '${assigneeUser.name}' is not assigned to project '${project.name}'.`);
    }
  }

  const issue = await Issue.create({
    title,
    description,
    category,
    priority,
    status: 'Open',
    projectId: project._id,
    createdBy: user._id,
    assignedTo: assigneeUser ? assigneeUser._id : null,
    imageUrl,
    resolvedAt: null,
  });

  await logActivity({
    issueId: issue._id,
    actorId: user._id,
    action: 'Created',
    details: {
      title: issue.title,
      category: issue.category,
      priority: issue.priority,
      status: issue.status,
      projectName: project.name,
      projectKey: project.key,
      assignedToName: assigneeUser ? assigneeUser.name : null,
    },
  });

  await notifyIssueCreated({ issue, actorId: user._id });

  return Issue.findById(issue._id)
    .populate('projectId', POPULATE_PROJECT)
    .populate('createdBy', POPULATE_FIELDS)
    .populate('assignedTo', POPULATE_FIELDS);
};

export const getIssues = async ({
  page = 1,
  limit = 10,
  search = '',
  status,
  priority,
  category,
  assignedTo,
  projectId,
  sortBy = 'createdAt',
  sortOrder = 'desc',
  user,
}) => {
  const filter = {};

  // Project-based access control enforcement
  if (user && user.role !== 'admin') {
    const userProjects = await Project.find({ 'members.user': user._id }, { _id: 1 });
    const userProjectIds = userProjects.map((p) => p._id);

    if (projectId) {
      const isMember = userProjectIds.some((pId) => pId.toString() === projectId.toString());
      if (!isMember) {
        throw ApiError.forbidden('Access denied. You are not a member of this project.');
      }
      filter.projectId = projectId;
    } else {
      filter.projectId = { $in: userProjectIds };
    }
  } else if (projectId) {
    filter.projectId = projectId;
  }

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (category) filter.category = category;

  if (assignedTo) {
    if (assignedTo === 'unassigned') {
      filter.assignedTo = null;
    } else {
      filter.assignedTo = assignedTo;
    }
  }

  if (search) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { title: { $regex: escapedSearch, $options: 'i' } },
      { description: { $regex: escapedSearch, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [issues, total] = await Promise.all([
    Issue.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('projectId', POPULATE_PROJECT)
      .populate('createdBy', POPULATE_FIELDS)
      .populate('assignedTo', POPULATE_FIELDS),
    Issue.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    issues,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

export const getIssueById = async (id, user) => {
  const issue = await Issue.findById(id)
    .populate('projectId', 'name key status description members createdBy')
    .populate('createdBy', POPULATE_FIELDS)
    .populate('assignedTo', POPULATE_FIELDS);

  if (!issue) {
    throw ApiError.notFound('Issue not found');
  }

  // Access control: verify user has access to issue's project
  if (user && issue.projectId) {
    const project = issue.projectId;
    if (!hasProjectAccess(project, user)) {
      throw ApiError.forbidden('Access denied. You are not a member of this project.');
    }
  }

  return issue;
};

export const updateIssue = async ({ id, updates, user }) => {
  const issue = await Issue.findById(id).populate('projectId');
  if (!issue) {
    throw ApiError.notFound('Issue not found');
  }

  const project = issue.projectId;
  if (project && !hasProjectAccess(project, user)) {
    throw ApiError.forbidden('Access denied. You are not a member of this project.');
  }

  const isOrgAdmin = user.role === 'admin';
  const isProjAdmin = project ? hasProjectAdminAccess(project, user) : false;
  const isCreator = issue.createdBy.toString() === user._id.toString();

  if (!isOrgAdmin && !isProjAdmin && !isCreator) {
    throw ApiError.forbidden('You do not have permission to edit this issue');
  }

  const changes = [];

  if (updates.priority && updates.priority !== issue.priority) {
    const oldPriority = issue.priority;
    issue.priority = updates.priority;
    changes.push({ action: 'Priority Changed', details: { fromPriority: oldPriority, toPriority: updates.priority } });
  }

  if (updates.title && updates.title !== issue.title) {
    issue.title = updates.title;
    changes.push({ action: 'Updated', details: { field: 'title', newTitle: updates.title } });
  }

  if (updates.description && updates.description !== issue.description) {
    issue.description = updates.description;
    changes.push({ action: 'Updated', details: { field: 'description' } });
  }

  if (updates.category && updates.category !== issue.category) {
    issue.category = updates.category;
    changes.push({ action: 'Updated', details: { field: 'category', newCategory: updates.category } });
  }

  if (updates.imageUrl !== undefined && updates.imageUrl !== issue.imageUrl) {
    issue.imageUrl = updates.imageUrl;
    changes.push({ action: 'Updated', details: { field: 'imageUrl' } });
  }

  // Optional project transfer (Org Admin or Project Admin only)
  if (updates.projectId && updates.projectId.toString() !== (project?._id || '').toString()) {
    if (!isOrgAdmin && !isProjAdmin) {
      throw ApiError.forbidden('Only administrators can move an issue to another project.');
    }
    const newProject = await Project.findById(updates.projectId);
    if (!newProject) {
      throw ApiError.notFound('Target destination project not found');
    }
    if (!hasProjectAccess(newProject, user)) {
      throw ApiError.forbidden('Access denied to destination project.');
    }
    issue.projectId = newProject._id;
    changes.push({
      action: 'Updated',
      details: { field: 'project', fromProject: project?.name, toProject: newProject.name },
    });
  }

  if (updates.assignedTo !== undefined) {
    const targetAssigneeId = updates.assignedTo ? updates.assignedTo.toString() : null;
    const previousAssigneeId = issue.assignedTo ? issue.assignedTo.toString() : null;

    if (targetAssigneeId !== previousAssigneeId) {
      let newAssigneeUser = null;
      if (updates.assignedTo) {
        newAssigneeUser = await User.findById(updates.assignedTo);
        if (!newAssigneeUser || !newAssigneeUser.isActive) {
          throw ApiError.badRequest('Assigned user does not exist or is inactive');
        }
        // Verify assignee is member of project
        const currentProj = updates.projectId ? await Project.findById(updates.projectId) : project;
        if (currentProj && !hasProjectAccess(currentProj, newAssigneeUser)) {
          throw ApiError.badRequest(`User '${newAssigneeUser.name}' is not assigned to this project.`);
        }
      }

      const previousAssigneeUser = issue.assignedTo
        ? await User.findById(issue.assignedTo)
        : null;

      const newAssigneeId = newAssigneeUser ? newAssigneeUser._id.toString() : null;

      issue.assignedTo = newAssigneeUser ? newAssigneeUser._id : null;
      changes.push({
        action: 'Assigned',
        details: {
          fromAssignee: previousAssigneeUser ? previousAssigneeUser.name : 'Unassigned',
          toAssignee: newAssigneeUser ? newAssigneeUser.name : 'Unassigned',
        },
      });

      if (newAssigneeId && newAssigneeId !== previousAssigneeId) {
        await notifyTaskAssigned({
          issue,
          assigneeId: newAssigneeUser._id,
          actorId: user._id,
        });
      }
    }
  }

  await issue.save();

  // Log all recorded changes to activity feed
  for (const change of changes) {
    await logActivity({
      issueId: issue._id,
      actorId: user._id,
      action: change.action,
      details: change.details,
    });
  }

  return Issue.findById(issue._id)
    .populate('projectId', POPULATE_PROJECT)
    .populate('createdBy', POPULATE_FIELDS)
    .populate('assignedTo', POPULATE_FIELDS);
};

export const updateStatus = async ({ id, status, user }) => {
  const issue = await Issue.findById(id).populate('projectId');
  if (!issue) {
    throw ApiError.notFound('Issue not found');
  }

  const project = issue.projectId;
  if (project && !hasProjectAccess(project, user)) {
    throw ApiError.forbidden('Access denied. You are not a member of this project.');
  }

  if (issue.status === status) {
    return Issue.findById(issue._id)
      .populate('projectId', POPULATE_PROJECT)
      .populate('createdBy', POPULATE_FIELDS)
      .populate('assignedTo', POPULATE_FIELDS);
  }

  const fromStatus = issue.status;
  issue.status = status;

  if (status === 'Resolved') {
    issue.resolvedAt = new Date();
  } else {
    issue.resolvedAt = null;
  }

  await issue.save();

  await logActivity({
    issueId: issue._id,
    actorId: user._id,
    action: 'Status Changed',
    details: {
      fromStatus,
      toStatus: status,
    },
  });

  return Issue.findById(issue._id)
    .populate('projectId', POPULATE_PROJECT)
    .populate('createdBy', POPULATE_FIELDS)
    .populate('assignedTo', POPULATE_FIELDS);
};

export const assignIssue = async ({ id, assignedTo, user }) => {
  const issue = await Issue.findById(id).populate('projectId');
  if (!issue) {
    throw ApiError.notFound('Issue not found');
  }

  const project = issue.projectId;
  if (project && !hasProjectAccess(project, user)) {
    throw ApiError.forbidden('Access denied. You are not a member of this project.');
  }

  const isOrgAdmin = user.role === 'admin';
  const isProjAdmin = project ? hasProjectAdminAccess(project, user) : false;

  if (!isOrgAdmin && !isProjAdmin) {
    throw ApiError.forbidden('Only administrators can assign issues');
  }

  let newAssigneeUser = null;
  if (assignedTo) {
    newAssigneeUser = await User.findById(assignedTo);
    if (!newAssigneeUser || !newAssigneeUser.isActive) {
      throw ApiError.badRequest('Assigned user does not exist or is inactive');
    }
    if (project && !hasProjectAccess(project, newAssigneeUser)) {
      throw ApiError.badRequest(`User '${newAssigneeUser.name}' is not assigned to project '${project.name}'.`);
    }
  }

  const previousAssigneeUser = issue.assignedTo
    ? await User.findById(issue.assignedTo)
    : null;

  const previousAssigneeId = issue.assignedTo ? issue.assignedTo.toString() : null;
  const newAssigneeId = newAssigneeUser ? newAssigneeUser._id.toString() : null;

  issue.assignedTo = newAssigneeUser ? newAssigneeUser._id : null;
  await issue.save();

  await logActivity({
    issueId: issue._id,
    actorId: user._id,
    action: 'Assigned',
    details: {
      fromAssignee: previousAssigneeUser ? previousAssigneeUser.name : 'Unassigned',
      toAssignee: newAssigneeUser ? newAssigneeUser.name : 'Unassigned',
    },
  });

  if (newAssigneeId && newAssigneeId !== previousAssigneeId) {
    await notifyTaskAssigned({
      issue,
      assigneeId: newAssigneeUser._id,
      actorId: user._id,
    });
  }

  return Issue.findById(issue._id)
    .populate('projectId', POPULATE_PROJECT)
    .populate('createdBy', POPULATE_FIELDS)
    .populate('assignedTo', POPULATE_FIELDS);
};

export const deleteIssue = async ({ id, user }) => {
  const issue = await Issue.findById(id).populate('projectId');
  if (!issue) {
    throw ApiError.notFound('Issue not found');
  }

  const project = issue.projectId;
  if (project && !hasProjectAccess(project, user)) {
    throw ApiError.forbidden('Access denied. You are not a member of this project.');
  }

  const isOrgAdmin = user.role === 'admin';
  const isProjAdmin = project ? hasProjectAdminAccess(project, user) : false;

  if (!isOrgAdmin && !isProjAdmin) {
    throw ApiError.forbidden('Only administrators are allowed to delete issues');
  }

  await Issue.findByIdAndDelete(id);

  // Clean up associated comments, activities, and notifications
  await Promise.all([
    Comment.deleteMany({ issueId: id }),
    Activity.deleteMany({ issueId: id }),
    Notification.deleteMany({ issueId: id }),
  ]);

  return { message: 'Issue and associated history deleted successfully' };
};
