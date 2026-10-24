import { verifyToken, COOKIE_NAME } from '../utils/jwt.js';
import { ApiError } from '../utils/apiError.js';
import { User } from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check Authorization: Bearer <token> header first (critical for mobile Safari & cross-origin SPAs)
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    // 2. Fallback to HttpOnly cookie
    else if (req.cookies && req.cookies[COOKIE_NAME]) {
      token = req.cookies[COOKIE_NAME];
    }

    if (!token) {
      throw ApiError.unauthorized('Authentication required. Please log in.');
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      throw ApiError.unauthorized('Invalid or expired authentication session.');
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      throw ApiError.unauthorized('User associated with this token no longer exists.');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Your account has been deactivated. Please contact an administrator.');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
