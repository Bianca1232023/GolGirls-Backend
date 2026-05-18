import { Router } from 'express';
import authenticateToken from '../middleware/auth.js';
import * as ctrl from '../controllers/inviteController.js';
import * as professorCtrl from '../controllers/professorController.js';
import * as professorService from '../services/professorService.js';

const router = Router();

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

// Convites
router.post('/send-invite', authenticateToken, asyncHandler(ctrl.sendInvite));
router.get('/invites', authenticateToken, asyncHandler(ctrl.listAll));

// Corpo docente
router.get('/team', authenticateToken, asyncHandler(ctrl.listTeam));

// Criar professor (convite por admin)
router.post('/createprofessor', authenticateToken, asyncHandler(professorCtrl.createProfessor));

// Deletar professor
router.delete('/professors/:id', authenticateToken, asyncHandler(professorCtrl.remove));

// Listar professores (para selects no frontend)
router.get('/professors', authenticateToken, asyncHandler(async (req, res) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ status: 403, message: 'Acesso restrito a administradores' });
  }
  const professors = await professorService.getAll();
  res.json({ status: 200, professors });
}));

export default router;
