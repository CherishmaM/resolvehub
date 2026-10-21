import * as activityService from '../services/activity.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getActivities = async (req, res, next) => {
  try {
    const activities = await activityService.getIssueActivities(req.params.id);
    return res
      .status(200)
      .json(ApiResponse.success(activities, 'Issue activities retrieved'));
  } catch (error) {
    next(error);
  }
};
