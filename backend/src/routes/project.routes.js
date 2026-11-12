import { Router } from 'express';
import * as projectController from '../controllers/project.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
  updateMemberRoleSchema,
  projectIdParamSchema,
  memberIdParamSchema,
} from '../validators/project.validator.js';

const router = Router();

// All project routes require authentication
router.use(authenticate);

// Collection operations
router.get('/', projectController.getProjects);
router.post('/', validate(createProjectSchema, 'body'), projectController.createProject);

// Single project operations
router.get('/:id', validate(projectIdParamSchema, 'params'), projectController.getProjectById);
router.patch(
  '/:id',
  validate(projectIdParamSchema, 'params'),
  validate(updateProjectSchema, 'body'),
  projectController.updateProject
);
router.delete('/:id', validate(projectIdParamSchema, 'params'), projectController.deleteProject);

// Project statistics
router.get('/:id/stats', validate(projectIdParamSchema, 'params'), projectController.getProjectStats);

// Project member management
router.post(
  '/:id/members',
  validate(projectIdParamSchema, 'params'),
  validate(addMemberSchema, 'body'),
  projectController.addProjectMember
);
router.patch(
  '/:id/members/:userId',
  validate(memberIdParamSchema, 'params'),
  validate(updateMemberRoleSchema, 'body'),
  projectController.updateProjectMemberRole
);
router.delete(
  '/:id/members/:userId',
  validate(memberIdParamSchema, 'params'),
  projectController.removeProjectMember
);

export default router;
