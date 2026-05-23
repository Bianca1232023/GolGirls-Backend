import * as nucleoRepo from '../repositories/nucleoRepository.js';
import prisma from '../models/prisma.js';

export async function create(nome, localizacao) {
  return nucleoRepo.create(nome, localizacao);
}

export async function getAll() {
  return nucleoRepo.findAll();
}

export async function remove(id) {
  const numId = Number(id);
  await prisma.$transaction([
    prisma.turma.updateMany({ where: { nucleo_id: numId }, data: { nucleo_id: null } }),
    prisma.aluno.updateMany({ where: { nucleo_id: numId }, data: { nucleo_id: null } }),
  ]);
  return nucleoRepo.remove(numId);
}
