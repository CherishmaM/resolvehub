import { Comment } from '../models/Comment.js';
import { Issue } from '../models/Issue.js';
import { ApiError } from '../utils/apiError.js';
import { logActivity } from './activity.service.js';

export const addComment = async ({ issueId, userId, text }) => {
  const issue = await Issue.findById(issueId);
  if (!issue) {
    throw ApiError.notFound('Issue not found');
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

  return comment.populate('userId', 'name email avatar role');
};

export const getCommentsByIssue = async (issueId) => {
  const issue = await Issue.findById(issueId);
  if (!issue) {
    throw ApiError.notFound('Issue not found');
  }

  return Comment.find({ issueId })
    .sort({ createdAt: 1 })
    .populate('userId', 'name email avatar role');
};
