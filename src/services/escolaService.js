import * as escolaRepo from '../repositories/escolaRepository.js';
import prisma from '../models/prisma.js';

export async function create(nome, endereco) {
  return escolaRepo.create(nome, endereco);
}

export async function getAll() {
  return escolaRepo.findAll();
}

export async function remove(id) {
  const numId = Number(id);
  await prisma.$transaction([
    prisma.turma.updateMany({ where: { escola_id: numId }, data: { escola_id: null } }),
    prisma.aluno.updateMany({ where: { escola_id: numId }, data: { escola_id: null } }),
  ]);
  return escolaRepo.remove(numId);
}
