import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';

export const getAllUsers = async () => {
  return User.find({ isActive: true })
    .select('name email role avatar isActive createdAt')
    .sort({ role: 1, name: 1 });
};

export const updateUserRole = async ({ targetUserId, newRole, currentAdminUser }) => {
  if (targetUserId === currentAdminUser._id.toString()) {
    throw ApiError.badRequest('Administrators cannot change their own role to prevent accidental lockout.');
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    throw ApiError.notFound('Target user not found');
  }

  targetUser.role = newRole;
  await targetUser.save();

  return targetUser;
};
