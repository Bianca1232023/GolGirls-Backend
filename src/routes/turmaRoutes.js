import { Router } from 'express';
import authenticateToken from '../middleware/auth.js';
import * as ctrl from '../controllers/turmaController.js';

const router = Router();

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

router.get('/', authenticateToken, asyncHandler(ctrl.listAll));
router.get('/:id/alunos', authenticateToken, asyncHandler(ctrl.getAlunosByTurma));

export default router;
