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
router.get('/', authenticateToken, asyncHandler(ctrl.listAlunos));

export default router;
