import * as notificationService from '../services/notification.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getNotifications = async (req, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
    const result = await notificationService.getNotifications(
      req.user._id,
      limit
    );
    return res
      .status(200)
      .json(ApiResponse.success(result, 'Notifications retrieved'));
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const result = await notificationService.markNotificationAsRead(
      req.params.id,
      req.user._id
    );
    return res
      .status(200)
      .json(ApiResponse.success(result, 'Notification marked as read'));
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAllNotificationsAsRead(
      req.user._id
    );
    return res
      .status(200)
      .json(ApiResponse.success(result, 'All notifications marked as read'));
  } catch (error) {
    next(error);
  }
};
