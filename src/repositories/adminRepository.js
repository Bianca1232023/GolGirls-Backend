import prisma from '../models/prisma.js';

// ── Criação / migrações (gerenciada pelo Prisma Migrate) ─────────────────────

export async function createTable() {
  // no-op: schema gerenciado por `npx prisma migrate dev`
}

// ── Queries ──────────────────────────────────────────────────────────────────

export async function findByEmail(email) {
  return prisma.admin.findUnique({ where: { email } });
}

export async function emailTaken(email) {
  return prisma.admin.findUnique({ where: { email }, select: { id: true } });
}

export async function create({ name, email, passwordHash, ativo = true }) {
  return prisma.admin.create({ data: { name, email, password: passwordHash, ativo } });
}

export async function createInvite(email, token, expires) {
  const admin = await prisma.admin.create({
    data: { email, reset_token: token, reset_token_expires: expires, ativo: false },
  });
  return { id: admin.id, token };
}

export async function findByResetToken(token) {
  return prisma.admin.findFirst({
    where: { reset_token: token, reset_token_expires: { gt: new Date() } },
    select: { id: true, email: true },
  });
}

export async function activate(id, name, passwordHash) {
  await prisma.admin.update({
    where: { id },
    data: { name, password: passwordHash, reset_token: null, reset_token_expires: null, ativo: true },
  });
}

export async function findActiveByEmail(email) {
  return prisma.admin.findFirst({ where: { email, ativo: true }, select: { id: true } });
}

export async function setResetToken(id, token, expires) {
  await prisma.admin.update({ where: { id }, data: { reset_token: token, reset_token_expires: expires } });
}

export async function findByResetTokenForReset(token) {
  return prisma.admin.findFirst({
    where: { reset_token: token, reset_token_expires: { gt: new Date() } },
    select: { id: true },
  });
}

export async function updatePassword(id, passwordHash) {
  await prisma.admin.update({
    where: { id },
    data: { password: passwordHash, reset_token: null, reset_token_expires: null },
  });
}

export async function countActive() {
  return prisma.admin.count({ where: { ativo: true } });
}

export async function findAll(id) {
  if (id != null && String(id).trim() !== '') {
    const row = await prisma.admin.findUnique({ where: { id: Number(id) }, select: { id: true, name: true, email: true } });
    return row ? [row] : [];
  }
  return prisma.admin.findMany({ select: { id: true, name: true, email: true }, orderBy: { id: 'asc' } });
}

export async function findAllWithStatus() {
  const rows = await prisma.admin.findMany({
    select: { id: true, name: true, email: true, ativo: true },
    orderBy: { id: 'asc' },
  });
  return rows.map((r) => ({ ...r, name: r.name ?? r.email, role: 'admin' }));
}

export async function update(id, { name, email, passwordHash }) {
  return prisma.admin.update({ where: { id }, data: { name, email, password: passwordHash } });
}

export async function updatePartial(id, data) {
  return prisma.admin.update({ where: { id }, data });
}

export async function remove(id) {
  return prisma.admin.delete({ where: { id } });
}
