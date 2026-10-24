import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { generateToken } from '../utils/jwt.js';

export const registerUser = async ({ name, email, password, jobTitle, avatar, role }) => {
  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const passwordHash = await User.hashPassword(password);

  // Allow selecting role during registration: admin (Team Lead) or member
  const assignedRole = role === 'admin' ? 'admin' : 'member';

  const user = await User.create({
    name,
    email: email.toLowerCase().trim(),
    passwordHash,
    role: assignedRole,
    jobTitle: jobTitle || (assignedRole === 'admin' ? 'Team Lead' : 'Software Engineer'),
    avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    isActive: true,
  });

  const token = generateToken(user);
  return { user, token };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (!user.isActive) {
    throw ApiError.forbidden('Your account has been deactivated. Please contact an administrator.');
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const token = generateToken(user);
  return { user, token };
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return user;
};

export const updateUserProfile = async (userId, { name, jobTitle, avatar }) => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (name !== undefined && name !== null) {
    user.name = name.trim();
  }

  if (jobTitle !== undefined && jobTitle !== null) {
    user.jobTitle = jobTitle.trim();
  }

  if (avatar !== undefined && avatar !== null) {
    user.avatar = avatar.trim();
  }

  await user.save();
  return user;
};
