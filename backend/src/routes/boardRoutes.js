import express from 'express';
import Joi from 'joi';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import {
  listBoardsController,
  createBoardController,
  getBoardController,
  createListController,
  createCardController,
  moveCardController,
  updateBoardController,
  archiveBoardController
} from '../controllers/boardController.js';

export const boardRouter = express.Router();

boardRouter.use(authenticate);

boardRouter.get('/', listBoardsController);
boardRouter.get('/:id', getBoardController);

const createBoardSchema = Joi.object({
  workspaceId: Joi.number().integer().required(),
  name: Joi.string().min(2).max(255).required(),
  description: Joi.string().max(2000).allow('', null)
});

boardRouter.post('/', validateBody(createBoardSchema), createBoardController);

const createListSchema = Joi.object({
  boardId: Joi.number().integer().required(),
  title: Joi.string().min(1).max(255).required(),
  position: Joi.number().integer().optional()
});

boardRouter.post('/lists', validateBody(createListSchema), createListController);

const createCardSchema = Joi.object({
  boardId: Joi.number().integer().required(),
  listId: Joi.number().integer().required(),
  title: Joi.string().min(1).max(255).required(),
  description: Joi.string().allow('', null).optional(),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'CRITICAL').default('MEDIUM'),
  dueDate: Joi.date().iso().allow(null).optional(),
  assigneeId: Joi.number().integer().allow(null).optional(),
  position: Joi.number().integer().optional()
});

boardRouter.post('/cards', validateBody(createCardSchema), createCardController);

const moveCardSchema = Joi.object({
  boardId: Joi.number().integer().required(),
  cardId: Joi.number().integer().required(),
  toListId: Joi.number().integer().required(),
  position: Joi.number().integer().required()
});

boardRouter.post('/cards/move', validateBody(moveCardSchema), moveCardController);

const updateBoardSchema = Joi.object({
  name: Joi.string().min(2).max(255).optional(),
  description: Joi.string().max(2000).allow('', null).optional()
});

boardRouter.patch('/:id', validateBody(updateBoardSchema), updateBoardController);
boardRouter.delete('/:id', archiveBoardController);


