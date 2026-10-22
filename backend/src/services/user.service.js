import { User } from '../models/User.js';
import { Issue } from '../models/Issue.js';
import { ApiError } from '../utils/apiError.js';

export const getAllUsers = async () => {
  return User.find({ isActive: true })
    .select('name email role jobTitle avatar isActive createdAt')
    .sort({ role: 1, name: 1 });
};

export const createUser = async ({ name, email, role = 'member', jobTitle = 'Software Engineer', password = 'Welcome@123' }) => {
  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    throw ApiError.conflict('A user with this email address already exists');
  }

  const passwordHash = await User.hashPassword(password);
  const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`;

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash,
    role,
    jobTitle: jobTitle.trim(),
    avatar,
    isActive: true,
  });

  return User.findById(user._id).select('name email role jobTitle avatar isActive createdAt');
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

export const deleteUser = async ({ targetUserId, currentAdminUser }) => {
  if (targetUserId === currentAdminUser._id.toString()) {
    throw ApiError.badRequest('Administrators cannot remove their own account to prevent lockout.');
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    throw ApiError.notFound('Target user not found');
  }

  // Unassign any issues currently assigned to this user
  await Issue.updateMany({ assignedTo: targetUserId }, { $set: { assignedTo: null } });

  await User.findByIdAndDelete(targetUserId);

  return { message: `User ${targetUser.name} was successfully removed.` };
};
