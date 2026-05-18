import { Router } from 'express';
import authenticateToken from '../middleware/auth.js';
import * as ctrl from '../controllers/escolaController.js';

const router = Router();

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

router.post('/', authenticateToken, asyncHandler(ctrl.create));
router.get('/', authenticateToken, asyncHandler(ctrl.listAll));
router.delete('/:id', authenticateToken, asyncHandler(ctrl.remove));

export default router;
