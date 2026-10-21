import { Router } from 'express';
import * as issueController from '../controllers/issue.controller.js';
import * as commentController from '../controllers/comment.controller.js';
import * as activityController from '../controllers/activity.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import {
  createIssueSchema,
  updateIssueSchema,
  updateStatusSchema,
  assignIssueSchema,
  issueQuerySchema,
  issueIdParamSchema,
} from '../validators/issue.validator.js';
import { createCommentSchema } from '../validators/comment.validator.js';

const router = Router();

// All issue routes require authentication
router.use(authenticate);

// Issue collection routes
router.get('/', validate(issueQuerySchema, 'query'), issueController.getIssues);
router.post('/', validate(createIssueSchema, 'body'), issueController.createIssue);

// Single issue routes
router.get('/:id', validate(issueIdParamSchema, 'params'), issueController.getIssueById);
router.patch(
  '/:id',
  validate(issueIdParamSchema, 'params'),
  validate(updateIssueSchema, 'body'),
  issueController.updateIssue
);
router.patch(
  '/:id/status',
  validate(issueIdParamSchema, 'params'),
  validate(updateStatusSchema, 'body'),
  issueController.updateStatus
);
router.patch(
  '/:id/assign',
  authorize('admin'),
  validate(issueIdParamSchema, 'params'),
  validate(assignIssueSchema, 'body'),
  issueController.assignIssue
);
router.delete(
  '/:id',
  authorize('admin'),
  validate(issueIdParamSchema, 'params'),
  issueController.deleteIssue
);

// Comments sub-resource
router.get(
  '/:id/comments',
  validate(issueIdParamSchema, 'params'),
  commentController.getComments
);
router.post(
  '/:id/comments',
  validate(issueIdParamSchema, 'params'),
  validate(createCommentSchema, 'body'),
  commentController.addComment
);

// Activity timeline sub-resource
router.get(
  '/:id/activities',
  validate(issueIdParamSchema, 'params'),
  activityController.getActivities
);

export default router;
