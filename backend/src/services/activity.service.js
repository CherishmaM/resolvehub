import { Activity } from '../models/Activity.js';
import { Issue } from '../models/Issue.js';
import { ApiError } from '../utils/apiError.js';
import { hasProjectAccess } from './project.service.js';

export const logActivity = async ({ issueId, actorId, action, details = {} }) => {
  try {
    return await Activity.create({
      issueId,
      actorId,
      action,
      details,
    });
  } catch (error) {
    console.error(`[ACTIVITY LOG ERROR] Failed to record activity: ${error.message}`);
    // Non-blocking
    return null;
  }
};

export const getIssueActivities = async (issueId, user) => {
  const issue = await Issue.findById(issueId).populate('projectId');
  if (!issue) {
    throw ApiError.notFound('Issue not found');
  }

  // Enforce project membership
  if (user && issue.projectId && !hasProjectAccess(issue.projectId, user)) {
    throw ApiError.forbidden('Access denied. You are not a member of this project.');
  }

  return Activity.find({ issueId })
    .sort({ createdAt: -1 })
    .populate('actorId', 'name email avatar role jobTitle');
};
