import * as issueService from '../services/issue.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const createIssue = async (req, res, next) => {
  try {
    const { title, description, category, priority, assignedTo } = req.body;
    const issue = await issueService.createIssue({
      title,
      description,
      category,
      priority,
      assignedTo,
      user: req.user,
    });

    return res
      .status(201)
      .json(ApiResponse.created(issue, 'Issue created successfully'));
  } catch (error) {
    next(error);
  }
};

export const getIssues = async (req, res, next) => {
  try {
    const result = await issueService.getIssues(req.query);
    return res
      .status(200)
      .json(ApiResponse.paginated(result.issues, result.pagination, 'Issues retrieved'));
  } catch (error) {
    next(error);
  }
};

export const getIssueById = async (req, res, next) => {
  try {
    const issue = await issueService.getIssueById(req.params.id);
    return res
      .status(200)
      .json(ApiResponse.success(issue, 'Issue details retrieved'));
  } catch (error) {
    next(error);
  }
};

export const updateIssue = async (req, res, next) => {
  try {
    const issue = await issueService.updateIssue({
      id: req.params.id,
      updates: req.body,
      user: req.user,
    });
    return res
      .status(200)
      .json(ApiResponse.success(issue, 'Issue updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const issue = await issueService.updateStatus({
      id: req.params.id,
      status,
      user: req.user,
    });
    return res
      .status(200)
      .json(ApiResponse.success(issue, 'Issue status updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const assignIssue = async (req, res, next) => {
  try {
    const { assignedTo } = req.body;
    const issue = await issueService.assignIssue({
      id: req.params.id,
      assignedTo,
      user: req.user,
    });
    return res
      .status(200)
      .json(ApiResponse.success(issue, 'Issue assignment updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteIssue = async (req, res, next) => {
  try {
    const result = await issueService.deleteIssue({
      id: req.params.id,
      user: req.user,
    });
    return res
      .status(200)
      .json(ApiResponse.success(null, result.message));
  } catch (error) {
    next(error);
  }
};
