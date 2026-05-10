import { Router } from 'express';
import authenticateToken from '../middleware/auth.js';
import * as ctrl from '../controllers/inviteController.js';
import * as professorCtrl from '../controllers/professorController.js';

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

// Turmas (visão admin)
// Montada em turmaRoutes -> /admin/turmas via app.js

// Nucleos (admin)
// Montadas em nucleoRoutes -> /admin/nucleos via app.js

// Escolas (admin)
// Montadas em escolaRoutes -> /admin/escolas via app.js

// Deletar professor
router.delete('/professors/:id', authenticateToken, asyncHandler(professorCtrl.remove));

export default router;
