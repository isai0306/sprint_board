import express from 'express';
import Joi from 'joi';
import {
  registerController,
  loginController,
  verifyEmailController,
  requestPasswordResetController,
  resetPasswordController,
  meController,
  updateProfileController
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

export const authRouter = express.Router();

// Validation schemas for auth endpoints
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(150).required(),
  email: Joi.string().email().max(255).required(),
  password: Joi.string().min(8).max(128).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().max(255).required(),
  password: Joi.string().min(8).max(128).required()
});

const verifyEmailSchema = Joi.object({
  token: Joi.string().length(64).required()
});

const requestResetSchema = Joi.object({
  email: Joi.string().email().max(255).required()
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().length(64).required(),
  newPassword: Joi.string().min(8).max(128).required()
});

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(150).optional(),
  avatarUrl: Joi.string().uri().max(500).allow(null, '').optional(),
  currentPassword: Joi.string().min(8).max(128).optional(),
  newPassword: Joi.string().min(8).max(128).optional()
}).with('newPassword', 'currentPassword');

// Public auth routes
authRouter.post('/register', validateBody(registerSchema), registerController);
authRouter.post('/login', validateBody(loginSchema), loginController);
authRouter.post('/verify-email', validateBody(verifyEmailSchema), verifyEmailController);
authRouter.post(
  '/forgot-password',
  validateBody(requestResetSchema),
  requestPasswordResetController
);
authRouter.post('/reset-password', validateBody(resetPasswordSchema), resetPasswordController);

// Authenticated profile routes
authRouter.get('/me', authenticate, meController);
authRouter.put('/me', authenticate, validateBody(updateProfileSchema), updateProfileController);

