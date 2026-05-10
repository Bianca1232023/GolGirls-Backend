import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import authenticateToken from '../middleware/auth.js';
import * as ctrl from '../controllers/professorController.js';
import * as turmaCtrl from '../controllers/turmaController.js';
import * as alunoCtrl from '../controllers/alunoController.js';

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
router.post('/forgot-password', authLimiter, asyncHandler(ctrl.forgotPassword));
router.post('/reset-password', authLimiter, asyncHandler(ctrl.resetPassword));
router.post('/set-password', authLimiter, asyncHandler(ctrl.setPassword));

router.post('/createturma', authenticateToken, asyncHandler(turmaCtrl.create));
router.get('/turmas', authenticateToken, asyncHandler(turmaCtrl.listByProfessor));

router.post('/createaluno', authenticateToken, asyncHandler(alunoCtrl.create));
router.patch('/alunos/:id/turma', authenticateToken, asyncHandler(alunoCtrl.updateTurma));

export default router;
