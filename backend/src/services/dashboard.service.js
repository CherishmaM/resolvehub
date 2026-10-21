import { Issue, ISSUE_STATUSES, ISSUE_PRIORITIES } from '../models/Issue.js';

export const getDashboardStats = async (currentUser) => {
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
    Issue.countDocuments(),
    Issue.countDocuments({ status: 'Open' }),
    Issue.countDocuments({ status: 'In Progress' }),
    Issue.countDocuments({ status: 'Resolved' }),
    Issue.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Issue.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]),
    Issue.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('createdBy', 'name email avatar role')
      .populate('assignedTo', 'name email avatar role'),
    currentUser ? Issue.countDocuments({ assignedTo: currentUser._id, status: { $ne: 'Resolved' } }) : 0,
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
