import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { dashboardController } from '../controllers/dashboardController.js';

export const dashboardRouter = express.Router();

dashboardRouter.get('/', authenticate, dashboardController);

