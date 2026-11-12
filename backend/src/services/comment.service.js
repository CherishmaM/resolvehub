import { Comment } from '../models/Comment.js';
import { Issue } from '../models/Issue.js';
import { ApiError } from '../utils/apiError.js';
import { logActivity } from './activity.service.js';
import { notifyDiscussionAdded } from './notification.service.js';
import { hasProjectAccess } from './project.service.js';

export const addComment = async ({ issueId, userId, text, user }) => {
  const issue = await Issue.findById(issueId).populate('projectId');
  if (!issue) {
    throw ApiError.notFound('Issue not found');
  }

  // Enforce project membership
  if (user && issue.projectId && !hasProjectAccess(issue.projectId, user)) {
    throw ApiError.forbidden('Access denied. You are not a member of this project.');
  }

  const comment = await Comment.create({
    issueId,
    userId,
    text,
  });

  await logActivity({
    issueId,
    actorId: userId,
    action: 'Comment Added',
    details: {
      commentId: comment._id,
    },
  });

  await notifyDiscussionAdded({ issue, actorId: userId });

  return comment.populate('userId', 'name email avatar role jobTitle');
};

export const getCommentsByIssue = async (issueId, user) => {
  const issue = await Issue.findById(issueId).populate('projectId');
  if (!issue) {
    throw ApiError.notFound('Issue not found');
  }

  // Enforce project membership
  if (user && issue.projectId && !hasProjectAccess(issue.projectId, user)) {
    throw ApiError.forbidden('Access denied. You are not a member of this project.');
  }

  return Comment.find({ issueId })
    .sort({ createdAt: 1 })
    .populate('userId', 'name email avatar role jobTitle');
};
