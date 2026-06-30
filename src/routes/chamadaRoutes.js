import { Router } from 'express';
import authenticateToken from '../middleware/auth.js';
import * as ctrl from '../controllers/chamadaController.js';

const router = Router();

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

router.post('/iniciar', authenticateToken, asyncHandler(ctrl.iniciarChamada));
router.post('/registrar', authenticateToken, asyncHandler(ctrl.registrarPresenca));
router.get('/turma/:turma_id', authenticateToken, asyncHandler(ctrl.getChamadasTurma));
router.get('/:chamada_id', authenticateToken, asyncHandler(ctrl.getChamadaDetalhes));

export default router;
