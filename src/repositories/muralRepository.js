import prisma from '../models/prisma.js';

export async function listPosts() {
  return prisma.post.findMany({
    orderBy: { created_at: 'desc' },
    include: { comments: { orderBy: { created_at: 'asc' } } },
  });
}

export async function createPost(authorId, authorRole, text, imageUrl = null) {
  return prisma.post.create({
    data: {
      author_id: authorId,
      author_role: authorRole,
      text,
      image_url: imageUrl,
    },
    include: { comments: true },
  });
}

export async function toggleLike(postId, increment) {
  return prisma.post.update({
    where: { id: postId },
    data: { likes: { [increment ? 'increment' : 'decrement']: 1 } },
  });
}

export async function addComment(postId, authorId, authorRole, text) {
  return prisma.comment.create({
    data: {
      post_id: postId,
      author_id: authorId,
      author_role: authorRole,
      text,
    },
  });
}
