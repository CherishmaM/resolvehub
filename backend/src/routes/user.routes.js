import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import {
  createUserSchema,
  updateRoleSchema,
  userIdParamSchema,
} from '../validators/user.validator.js';

const router = Router();

router.use(authenticate);

// All authenticated users can view active team members (for issue assignments & collaboration)
router.get('/', userController.getUsers);

// Administrator: manually add a new team member
router.post(
  '/',
  authorize('admin'),
  validate(createUserSchema, 'body'),
  userController.createUser
);

// Administrator: change user role
router.patch(
  '/:id/role',
  authorize('admin'),
  validate(userIdParamSchema, 'params'),
  validate(updateRoleSchema, 'body'),
  userController.updateRole
);

// Administrator: remove a team member
router.delete(
  '/:id',
  authorize('admin'),
  validate(userIdParamSchema, 'params'),
  userController.deleteUser
);

export default router;
