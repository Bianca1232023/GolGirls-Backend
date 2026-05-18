import prisma from '../models/prisma.js';

export async function createTable() {
  // no-op: schema gerenciado por `npx prisma migrate dev`
}

export async function create(nome, localizacao) {
  return prisma.nucleo.create({ data: { nome, localizacao: localizacao ?? null } });
}

export async function findAll() {
  return prisma.nucleo.findMany({ select: { id: true, nome: true }, orderBy: { nome: 'asc' } });
}

export async function remove(id) {
  return prisma.nucleo.delete({ where: { id } });
}
