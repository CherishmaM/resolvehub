import * as commentService from '../services/comment.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    const comment = await commentService.addComment({
      issueId: req.params.id,
      userId: req.user._id,
      text,
    });
    return res
      .status(201)
      .json(ApiResponse.created(comment, 'Comment added successfully'));
  } catch (error) {
    next(error);
  }
};

export const getComments = async (req, res, next) => {
  try {
    const comments = await commentService.getCommentsByIssue(req.params.id);
    return res
      .status(200)
      .json(ApiResponse.success(comments, 'Comments retrieved'));
  } catch (error) {
    next(error);
  }
};
