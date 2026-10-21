import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const COOKIE_NAME = 'fixflow_token';

export const generateToken = (user) => {
  const payload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.name,
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const setAuthCookie = (res, token) => {
  const isProduction = env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  };

  if (env.COOKIE_DOMAIN) {
    cookieOptions.domain = env.COOKIE_DOMAIN;
  }

  res.cookie(COOKIE_NAME, token, cookieOptions);
};

export const clearAuthCookie = (res) => {
  const isProduction = env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  };

  if (env.COOKIE_DOMAIN) {
    cookieOptions.domain = env.COOKIE_DOMAIN;
  }

  res.clearCookie(COOKIE_NAME, cookieOptions);
};
