import prisma from '../models/prisma.js';

// ── Criação / migrações (gerenciada pelo Prisma Migrate) ─────────────────────

export async function createTable() {
  // no-op: schema gerenciado por `npx prisma migrate dev`
}

// ── Queries ──────────────────────────────────────────────────────────────────

export async function findByEmail(email) {
  return prisma.professor.findUnique({ where: { email } });
}

export async function emailTaken(email) {
  return prisma.professor.findUnique({ where: { email }, select: { id: true } });
}

export async function create({ name, email, passwordHash }) {
  return prisma.professor.create({ data: { name, email, password: passwordHash } });
}

export async function createInvite(email, token, expires) {
  const professor = await prisma.professor.create({
    data: { email, reset_token: token, reset_token_expires: expires, ativo: false },
  });
  return { id: professor.id, token };
}

export async function findByResetToken(token) {
  return prisma.professor.findFirst({
    where: { reset_token: token, reset_token_expires: { gt: new Date() } },
    select: { id: true, email: true },
  });
}

export async function activate(id, name, passwordHash) {
  await prisma.professor.update({
    where: { id },
    data: { name, password: passwordHash, reset_token: null, reset_token_expires: null, ativo: true },
  });
}

export async function findActiveByEmail(email) {
  return prisma.professor.findFirst({ where: { email, ativo: true }, select: { id: true } });
}

export async function setResetToken(id, token, expires) {
  await prisma.professor.update({ where: { id }, data: { reset_token: token, reset_token_expires: expires } });
}

export async function findByResetTokenForReset(token) {
  return prisma.professor.findFirst({
    where: { reset_token: token, reset_token_expires: { gt: new Date() } },
    select: { id: true },
  });
}

export async function updatePassword(id, passwordHash) {
  await prisma.professor.update({
    where: { id },
    data: { password: passwordHash, reset_token: null, reset_token_expires: null },
  });
}

export async function findById(id) {
  return prisma.professor.findUnique({ where: { id }, select: { id: true, name: true, email: true } });
}

function formatProfessor(p) {
  return {
    id: p.id,
    name: p.name,
    email: p.email,
    turmas: p.turmas.map((pt) => pt.turma.nome).filter(Boolean).join(', ') || null,
  };
}

export async function findAll(id) {
  if (id != null && String(id).trim() !== '') {
    const professor = await prisma.professor.findUnique({
      where: { id: Number(id) },
      include: { turmas: { include: { turma: { select: { nome: true } } } } },
    });
    return professor ? [formatProfessor(professor)] : [];
  }
  const professors = await prisma.professor.findMany({
    include: { turmas: { include: { turma: { select: { nome: true } } } } },
    orderBy: { id: 'asc' },
  });
  return professors.map(formatProfessor);
}

export async function findAllWithStatus() {
  const rows = await prisma.professor.findMany({
    select: { id: true, name: true, email: true, ativo: true },
    orderBy: { id: 'asc' },
  });
  return rows.map((r) => ({ ...r, name: r.name ?? r.email, role: 'professor' }));
}

export async function updateById(id, data) {
  return prisma.professor.update({ where: { id }, data });
}

export async function remove(id) {
  return prisma.professor.delete({ where: { id } });
}

