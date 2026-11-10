import { Router } from 'express';
import * as ideaController from '../controllers/idea.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import {
  createIdeaSchema,
  updateIdeaSchema,
  updateStageSchema,
  addIdeaCommentSchema,
  ideaQuerySchema,
  ideaIdParamSchema,
  commentIdParamSchema,
} from '../validators/idea.validator.js';

const router = Router();

// All idea routes require authentication
router.use(authenticate);

// Idea collection routes
router.get('/', validate(ideaQuerySchema, 'query'), ideaController.getIdeas);
router.get('/stats', ideaController.getIdeaStats);
router.post('/', validate(createIdeaSchema, 'body'), ideaController.createIdea);

// Single idea operations
router.get('/:id', validate(ideaIdParamSchema, 'params'), ideaController.getIdeaById);
router.patch(
  '/:id',
  validate(ideaIdParamSchema, 'params'),
  validate(updateIdeaSchema, 'body'),
  ideaController.updateIdea
);
router.delete('/:id', validate(ideaIdParamSchema, 'params'), ideaController.deleteIdea);

// Upvote toggle
router.patch(
  '/:id/upvote',
  validate(ideaIdParamSchema, 'params'),
  ideaController.toggleUpvote
);

// Stage transition
router.patch(
  '/:id/stage',
  validate(ideaIdParamSchema, 'params'),
  validate(updateStageSchema, 'body'),
  ideaController.updateStage
);

// Convert to Issue in Bug Tracker
router.post(
  '/:id/convert',
  validate(ideaIdParamSchema, 'params'),
  ideaController.convertToIssue
);

// Discussion comments
router.post(
  '/:id/comments',
  validate(ideaIdParamSchema, 'params'),
  validate(addIdeaCommentSchema, 'body'),
  ideaController.addComment
);

router.delete(
  '/:id/comments/:commentId',
  validate(commentIdParamSchema, 'params'),
  ideaController.deleteComment
);

export default router;
