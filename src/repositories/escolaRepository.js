import prisma from '../models/prisma.js';

export async function createTable() {
  // no-op: schema gerenciado por `npx prisma migrate dev`
}

export async function create(nome, endereco) {
  return prisma.escola.create({ data: { nome, endereco: endereco ?? null } });
}

export async function findAll() {
  return prisma.escola.findMany({ select: { id: true, nome: true }, orderBy: { nome: 'asc' } });
}

export async function remove(id) {
  return prisma.escola.delete({ where: { id } });
}
