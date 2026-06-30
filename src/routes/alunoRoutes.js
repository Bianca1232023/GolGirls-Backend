import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import authenticateToken from '../middleware/auth.js';
import * as ctrl from '../controllers/alunoController.js';

const router = Router();

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

router.post('/login', authLimiter, asyncHandler(ctrl.login));
router.post('/set-password', asyncHandler(ctrl.setPassword));
router.post('/forgot-password', authLimiter, asyncHandler(ctrl.forgotPassword));
router.post('/reset-password', asyncHandler(ctrl.resetPassword));
router.get('/me', authenticateToken, asyncHandler(ctrl.getMe));
router.patch('/me', authenticateToken, asyncHandler(ctrl.updateMe));
router.post('/', authenticateToken, asyncHandler(ctrl.create));
router.delete('/:id', authenticateToken, asyncHandler(ctrl.remove));
router.get('/', authenticateToken, asyncHandler(ctrl.listAlunos));

export default router;
