import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { updateRoleSchema, userIdParamSchema } from '../validators/user.validator.js';

const router = Router();

router.use(authenticate);

// All authenticated users can view active team members (for issue assignments & collaboration)
router.get('/', userController.getUsers);

// Only administrators can change roles
router.patch(
  '/:id/role',
  authorize('admin'),
  validate(userIdParamSchema, 'params'),
  validate(updateRoleSchema, 'body'),
  userController.updateRole
);

export default router;
