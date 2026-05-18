import bcrypt from 'bcryptjs';
import * as alunoRepo from '../repositories/alunoRepository.js';

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 12;

export async function register(data) {
  return alunoRepo.create(data);
}

export async function login(matricula) {
  return alunoRepo.findByMatricula(matricula);
}

export async function getByTurma(turmaId) {
  return alunoRepo.findByTurma(turmaId);
}

export async function getAll() {
  return alunoRepo.findAll();
}

export async function getWithFilters(professorId, filters) {
  return alunoRepo.findWithFilters(professorId, filters);
}

export async function updateTurma(alunoId, turmaId) {
  return alunoRepo.updateTurma(alunoId, turmaId);
}
