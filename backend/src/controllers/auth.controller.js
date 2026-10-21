import * as authService from '../services/auth.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { setAuthCookie, clearAuthCookie } from '../utils/jwt.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, avatar } = req.body;
    const { user, token } = await authService.registerUser({
      name,
      email,
      password,
      avatar,
    });

    setAuthCookie(res, token);
    return res
      .status(201)
      .json(
        ApiResponse.created(
          { user, token },
          'Account registered successfully'
        )
      );
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.loginUser({ email, password });

    setAuthCookie(res, token);
    return res
      .status(200)
      .json(
        ApiResponse.success(
          { user, token },
          'Logged in successfully'
        )
      );
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    clearAuthCookie(res);
    return res
      .status(200)
      .json(ApiResponse.success(null, 'Logged out successfully'));
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    return res
      .status(200)
      .json(ApiResponse.success(req.user, 'Current user retrieved'));
  } catch (error) {
    next(error);
  }
};
