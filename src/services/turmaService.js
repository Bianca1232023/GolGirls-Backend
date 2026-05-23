import * as turmaRepo from '../repositories/turmaRepository.js';
import prisma from '../models/prisma.js';

export async function create({ nome, escola_id, nucleo_id, capacidade }) {
  return turmaRepo.create({ nome, escola_id, nucleo_id, capacidade });
}

export async function listVinculos() {
  return turmaRepo.listVinculos();
}

export async function linkProfessor(professorId, turmaId) {
  return turmaRepo.linkProfessor(professorId, turmaId);
}

export async function findByProfessor(professorId) {
  return turmaRepo.findByProfessor(professorId);
}

export async function professorOwnsTurma(professorId, turmaId) {
  return turmaRepo.professorOwnsTurma(professorId, turmaId);
}

export async function getById(id) {
  return turmaRepo.findById(id);
}

export async function getAll() {
  return turmaRepo.findAll();
}

export async function remove(id) {
  const numId = Number(id);
  await prisma.aluno.updateMany({ where: { turma_id: numId }, data: { turma_id: null } });
  return turmaRepo.remove(numId);
}
