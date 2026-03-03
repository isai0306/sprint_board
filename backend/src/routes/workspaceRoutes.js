import express from 'express';
import Joi from 'joi';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import {
  getMyWorkspacesController,
  createWorkspaceController,
  listMembersController,
  updateWorkspaceController,
  deleteWorkspaceController,
  inviteWorkspaceMemberController
} from '../controllers/workspaceController.js';
import { requireWorkspaceRole } from '../middleware/workspaceRoles.js';

export const workspaceRouter = express.Router();

const createWorkspaceSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  description: Joi.string().max(2000).allow('', null)
});

workspaceRouter.use(authenticate);

workspaceRouter.get('/', getMyWorkspacesController);

workspaceRouter.post(
  '/',
  validateBody(createWorkspaceSchema),
  createWorkspaceController
);

workspaceRouter.get(
  '/:id/members',
  requireWorkspaceRole('VIEWER'),
  listMembersController
);

const inviteMemberSchema = Joi.object({
  email: Joi.string().email().max(255).required(),
  role: Joi.string().valid('ADMIN', 'MEMBER', 'VIEWER').default('MEMBER')
});

workspaceRouter.post(
  '/:id/members/invite',
  requireWorkspaceRole('ADMIN'),
  validateBody(inviteMemberSchema),
  inviteWorkspaceMemberController
);

workspaceRouter.post(
  '/:id/invite',
  requireWorkspaceRole('ADMIN'),
  validateBody(inviteMemberSchema),
  inviteWorkspaceMemberController
);

const updateWorkspaceSchema = Joi.object({
  name: Joi.string().min(2).max(255).optional(),
  description: Joi.string().max(2000).allow('', null).optional()
});

workspaceRouter.patch(
  '/:id',
  validateBody(updateWorkspaceSchema),
  updateWorkspaceController
);

workspaceRouter.delete('/:id', deleteWorkspaceController);


