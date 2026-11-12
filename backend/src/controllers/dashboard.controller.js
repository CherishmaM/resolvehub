import * as dashboardService from '../services/dashboard.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getDashboardStats(req.user, req.query.projectId);
    return res
      .status(200)
      .json(ApiResponse.success(stats, 'Dashboard statistics retrieved'));
  } catch (error) {
    next(error);
  }
};
