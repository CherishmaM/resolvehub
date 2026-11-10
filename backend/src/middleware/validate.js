import { ApiError } from '../utils/apiError.js';

export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err.errors) {
        const formattedErrors = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        const detailedMessage =
          formattedErrors.map((e) => e.message).join('. ') || 'Validation failed';
        return next(ApiError.badRequest(detailedMessage, formattedErrors));
      }
      next(err);
    }
  };
};
