import * as repo from '../repositories/muralRepository.js';

export async function listPosts(req, res) {
  const posts = await repo.listPosts();
  res.json({ status: 200, posts });
}

export async function createPost(req, res) {
  const text = String(req.body?.text ?? '').trim();
  if (!text) return res.status(400).json({ status: 400, message: 'text é obrigatório' });

  const post = await repo.createPost(
    req.user.id,
    req.user.role,
    text,
    req.body?.image_url ?? null,
  );
  res.status(201).json({ status: 201, post });
}

export async function toggleLike(req, res) {
  const postId = Number(req.params.id);
  if (!postId) return res.status(400).json({ status: 400, message: 'id inválido' });
  const increment = req.body?.increment !== false;
  const post = await repo.toggleLike(postId, increment);
  res.json({ status: 200, post });
}

export async function addComment(req, res) {
  const postId = Number(req.params.id);
  const text = String(req.body?.text ?? '').trim();
  if (!postId || !text) {
    return res.status(400).json({ status: 400, message: 'post_id e text são obrigatórios' });
  }
  const comment = await repo.addComment(postId, req.user.id, req.user.role, text);
  res.status(201).json({ status: 201, comment });
}
