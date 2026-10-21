import { Activity } from '../models/Activity.js';

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
    // Non-blocking: We don't want an activity log failure to break the primary operation if not using transactions
    return null;
  }
};

export const getIssueActivities = async (issueId) => {
  return Activity.find({ issueId })
    .sort({ createdAt: -1 })
    .populate('actorId', 'name email avatar role');
};
