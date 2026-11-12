import { Issue, ISSUE_STATUSES, ISSUE_PRIORITIES } from '../models/Issue.js';
import { Project } from '../models/Project.js';
import { ApiError } from '../utils/apiError.js';

export const getDashboardStats = async (currentUser, projectId = null) => {
  const matchFilter = {};

  if (currentUser && currentUser.role !== 'admin') {
    const userProjects = await Project.find({ 'members.user': currentUser._id }, { _id: 1 });
    const userProjectIds = userProjects.map((p) => p._id);

    if (projectId) {
      const isMember = userProjectIds.some((pId) => pId.toString() === projectId.toString());
      if (!isMember) {
        throw ApiError.forbidden('Access denied. You are not a member of this project.');
      }
      matchFilter.projectId = projectId;
    } else {
      matchFilter.projectId = { $in: userProjectIds };
    }
  } else if (projectId) {
    matchFilter.projectId = projectId;
  }

  const [
    totalIssues,
    openIssues,
    inProgressIssues,
    resolvedIssues,
    statusAgg,
    priorityAgg,
    recentIssues,
    assignedToMeCount,
  ] = await Promise.all([
    Issue.countDocuments(matchFilter),
    Issue.countDocuments({ ...matchFilter, status: 'Open' }),
    Issue.countDocuments({ ...matchFilter, status: 'In Progress' }),
    Issue.countDocuments({ ...matchFilter, status: 'Resolved' }),
    Issue.aggregate([
      { $match: matchFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Issue.aggregate([
      { $match: matchFilter },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]),
    Issue.find(matchFilter)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('projectId', 'name key status')
      .populate('createdBy', 'name email avatar role jobTitle')
      .populate('assignedTo', 'name email avatar role jobTitle'),
    currentUser
      ? Issue.countDocuments({
          ...matchFilter,
          assignedTo: currentUser._id,
          status: { $ne: 'Resolved' },
        })
      : 0,
  ]);

  // Normalize status distribution map ensuring all statuses are represented
  const statusCountsMap = statusAgg.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  const statusDistribution = ISSUE_STATUSES.map((status) => ({
    name: status,
    count: statusCountsMap[status] || 0,
  }));

  // Normalize priority distribution map ensuring all priorities are represented
  const priorityCountsMap = priorityAgg.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  const priorityDistribution = ISSUE_PRIORITIES.map((priority) => ({
    name: priority,
    count: priorityCountsMap[priority] || 0,
  }));

  return {
    totals: {
      total: totalIssues,
      open: openIssues,
      inProgress: inProgressIssues,
      resolved: resolvedIssues,
      assignedToMe: assignedToMeCount,
    },
    statusDistribution,
    priorityDistribution,
    recentIssues,
  };
};
