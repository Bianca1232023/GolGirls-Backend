import { Router } from 'express';
import authenticateToken from '../middleware/auth.js';
import * as ctrl from '../controllers/muralController.js';

const router = Router();

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

router.get('/', authenticateToken, asyncHandler(ctrl.listPosts));
router.post('/', authenticateToken, asyncHandler(ctrl.createPost));
router.patch('/:id/like', authenticateToken, asyncHandler(ctrl.toggleLike));
router.post('/:id/comment', authenticateToken, asyncHandler(ctrl.addComment));
router.delete('/:id', authenticateToken, asyncHandler(ctrl.deletePost));

export default router;
