import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';

export const createNotification = async ({
  recipientId,
  actorId,
  issueId,
  type,
  message,
  issueTitle,
  allowSelfNotify = false,
}) => {
  if (!recipientId || !actorId || !issueId) return null;
  // Guard: Never notify the actor themselves unless explicitly permitted (e.g., self-assignment)
  if (!allowSelfNotify && recipientId.toString() === actorId.toString()) return null;

  try {
    // Duplicate prevention: avoid inserting duplicate notification within 60s for task_assigned / issue_created, or 2s for discussion
    const dedupeWindowMs = type === 'discussion_created' ? 2000 : 60000;
    const windowStart = new Date(Date.now() - dedupeWindowMs);
    const existing = await Notification.findOne({
      recipientId,
      issueId,
      type,
      read: false,
      createdAt: { $gte: windowStart },
    });

    if (existing) {
      return existing;
    }

    return await Notification.create({
      recipientId,
      actorId,
      issueId,
      type,
      message,
      issueTitle,
      read: false,
    });
  } catch (err) {
    console.error('Error creating notification:', err);
    return null;
  }
};

/**
 * Event 1: New issue raised
 * Suggested message: "New issue raised: [Issue title]"
 * Also handles initial assignment if assignedTo is provided upon issue creation:
 * - Assigned user receives: "A task has been assigned to you: [Issue title]"
 * - Other active users (excluding creator and assignee) receive: "New issue raised: [Issue title]"
 */
export const notifyIssueCreated = async ({ issue, actorId }) => {
  try {
    const activeUsers = await User.find({ isActive: true }).select('_id');
    const assignedUserId = issue.assignedTo?._id?.toString() || issue.assignedTo?.toString();

    // 1. If assigned upon creation, send task assignment notification to the assignee
    if (assignedUserId) {
      await createNotification({
        recipientId: assignedUserId,
        actorId,
        issueId: issue._id,
        type: 'task_assigned',
        message: `A task has been assigned to you: ${issue.title}`,
        issueTitle: issue.title,
        allowSelfNotify: true,
      });
    }

    // 2. Notify other active users with "New issue raised"
    const promises = activeUsers.map((user) => {
      const userIdStr = user._id.toString();
      // Skip the creator
      if (userIdStr === actorId.toString()) return null;
      // Skip the assignee who already received the task assignment notification
      if (assignedUserId && userIdStr === assignedUserId) return null;

      return createNotification({
        recipientId: user._id,
        actorId,
        issueId: issue._id,
        type: 'issue_created',
        message: `New issue raised: ${issue.title}`,
        issueTitle: issue.title,
      });
    });

    await Promise.all(promises);
  } catch (err) {
    console.error('Error in notifyIssueCreated:', err);
  }
};

/**
 * Event 3: Task assigned to me
 * Message: "A task has been assigned to you: [Task title]"
 */
export const notifyTaskAssigned = async ({ issue, assigneeId, actorId }) => {
  try {
    if (!assigneeId) return null;

    return await createNotification({
      recipientId: assigneeId,
      actorId,
      issueId: issue._id,
      type: 'task_assigned',
      message: `A task has been assigned to you: ${issue.title}`,
      issueTitle: issue.title,
      allowSelfNotify: true,
    });
  } catch (err) {
    console.error('Error in notifyTaskAssigned:', err);
    return null;
  }
};

/**
 * Event 2: New discussion
 * Message: "New discussion: [Issue title]"
 * Notifies all active users across the workspace (except the author of the comment).
 */
export const notifyDiscussionAdded = async ({ issue, actorId }) => {
  try {
    const activeUsers = await User.find({
      isActive: true,
      _id: { $ne: actorId },
    }).select('_id');

    const promises = activeUsers.map((user) =>
      createNotification({
        recipientId: user._id,
        actorId,
        issueId: issue._id,
        type: 'discussion_created',
        message: `New discussion: ${issue.title}`,
        issueTitle: issue.title,
      })
    );

    await Promise.all(promises);
  } catch (err) {
    console.error('Error in notifyDiscussionAdded:', err);
  }
};

// Backwards-compatible alias for comment service
export const notifyCommentAdded = notifyDiscussionAdded;

export const getNotifications = async (userId, limit = 20) => {
  const [notifications, unreadCount] = await Promise.all([
    Notification.find({ recipientId: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('actorId', 'name email avatar jobTitle'),
    Notification.countDocuments({ recipientId: userId, read: false }),
  ]);

  return { notifications, unreadCount };
};

export const markNotificationAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipientId: userId },
    { read: true },
    { new: true }
  ).populate('actorId', 'name email avatar jobTitle');

  const unreadCount = await Notification.countDocuments({
    recipientId: userId,
    read: false,
  });

  return { notification, unreadCount };
};

export const markAllNotificationsAsRead = async (userId) => {
  await Notification.updateMany(
    { recipientId: userId, read: false },
    { read: true }
  );

  return { success: true, unreadCount: 0 };
};
