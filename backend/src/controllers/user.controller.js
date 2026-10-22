import * as userService from '../services/user.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    return res
      .status(200)
      .json(ApiResponse.success(users, 'Team members retrieved'));
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, role, jobTitle, password } = req.body;
    const user = await userService.createUser({
      name,
      email,
      role,
      jobTitle,
      password,
    });
    return res
      .status(201)
      .json(ApiResponse.created(user, 'Team member added successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await userService.updateUserRole({
      targetUserId: req.params.id,
      newRole: role,
      currentAdminUser: req.user,
    });
    return res
      .status(200)
      .json(ApiResponse.success(user, 'User role updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const result = await userService.deleteUser({
      targetUserId: req.params.id,
      currentAdminUser: req.user,
    });
    return res
      .status(200)
      .json(ApiResponse.success(null, result.message));
  } catch (error) {
    next(error);
  }
};
