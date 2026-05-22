import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import authenticateToken from '../middleware/auth.js';
import * as ctrl from '../controllers/adminController.js';
import { refresh } from '../controllers/authRefreshController.js';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { status: 429, message: 'Muitas tentativas. Tente novamente mais tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

// /admin/* — auth routes
export const adminAuthRouter = Router();
adminAuthRouter.post('/invite', authenticateToken, asyncHandler(ctrl.invite));
adminAuthRouter.post('/forgot-password', authLimiter, asyncHandler(ctrl.forgotPassword));
adminAuthRouter.post('/reset-password', authLimiter, asyncHandler(ctrl.resetPassword));
adminAuthRouter.post('/set-password', authLimiter, asyncHandler(ctrl.setPassword));
adminAuthRouter.post('/register', authLimiter, asyncHandler(ctrl.register));
adminAuthRouter.post('/login', authLimiter, asyncHandler(ctrl.login));
adminAuthRouter.post('/refresh', asyncHandler(refresh));

// /admins/* — CRUD routes
export const adminCrudRouter = Router();
adminCrudRouter.get('/', authenticateToken, asyncHandler(ctrl.getAll));
adminCrudRouter.put('/:id', authenticateToken, asyncHandler(ctrl.update));
adminCrudRouter.patch('/:id', authenticateToken, asyncHandler(ctrl.updatePartial));
adminCrudRouter.delete('/:id', authenticateToken, asyncHandler(ctrl.remove));
