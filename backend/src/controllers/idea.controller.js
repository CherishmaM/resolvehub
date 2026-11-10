import * as ideaService from '../services/idea.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getIdeas = async (req, res, next) => {
  try {
    const { search, category, stage, sort, page, limit } = req.query;
    const result = await ideaService.getIdeas({
      search,
      category,
      stage,
      sort,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      currentUserId: req.user?._id,
    });

    return res
      .status(200)
      .json(ApiResponse.paginated(result.ideas, result.pagination, 'Ideas retrieved'));
  } catch (error) {
    next(error);
  }
};

export const getIdeaStats = async (req, res, next) => {
  try {
    const stats = await ideaService.getIdeaStats();
    return res
      .status(200)
      .json(ApiResponse.success(stats, 'Idea stats retrieved'));
  } catch (error) {
    next(error);
  }
};

export const createIdea = async (req, res, next) => {
  try {
    const { title, description, category, impact, tags } = req.body;
    const idea = await ideaService.createIdea({
      title,
      description,
      category,
      impact,
      tags,
      createdBy: req.user._id,
    });

    return res
      .status(201)
      .json(ApiResponse.created(idea, 'Brainstorming idea created successfully'));
  } catch (error) {
    next(error);
  }
};

export const getIdeaById = async (req, res, next) => {
  try {
    const idea = await ideaService.getIdeaById(req.params.id, req.user?._id);
    return res
      .status(200)
      .json(ApiResponse.success(idea, 'Idea retrieved'));
  } catch (error) {
    next(error);
  }
};

export const toggleUpvote = async (req, res, next) => {
  try {
    const result = await ideaService.toggleUpvote(req.params.id, req.user._id);
    return res
      .status(200)
      .json(ApiResponse.success(result, 'Upvote updated'));
  } catch (error) {
    next(error);
  }
};

export const updateStage = async (req, res, next) => {
  try {
    const idea = await ideaService.updateStage(
      req.params.id,
      req.body.stage,
      req.user
    );
    return res
      .status(200)
      .json(ApiResponse.success(idea, 'Idea stage updated'));
  } catch (error) {
    next(error);
  }
};

export const updateIdea = async (req, res, next) => {
  try {
    const idea = await ideaService.updateIdea(
      req.params.id,
      req.body,
      req.user
    );
    return res
      .status(200)
      .json(ApiResponse.success(idea, 'Idea updated'));
  } catch (error) {
    next(error);
  }
};

export const deleteIdea = async (req, res, next) => {
  try {
    const result = await ideaService.deleteIdea(req.params.id, req.user);
    return res
      .status(200)
      .json(ApiResponse.success(result, 'Idea deleted'));
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const comments = await ideaService.addComment(req.params.id, {
      userId: req.user._id,
      text: req.body.text,
    });
    return res
      .status(201)
      .json(ApiResponse.created(comments, 'Comment added to idea'));
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const result = await ideaService.deleteComment(
      req.params.id,
      req.params.commentId,
      req.user
    );
    return res
      .status(200)
      .json(ApiResponse.success(result, 'Comment deleted'));
  } catch (error) {
    next(error);
  }
};

export const convertToIssue = async (req, res, next) => {
  try {
    const result = await ideaService.convertToIssue(req.params.id, req.user);
    return res
      .status(201)
      .json(
        ApiResponse.created(
          result,
          'Idea successfully converted to an issue in the Bug Tracker'
        )
      );
  } catch (error) {
    next(error);
  }
};
