import * as escolaRepo from '../repositories/escolaRepository.js';

export async function create(nome) {
  return escolaRepo.create(nome);
}

export async function getAll() {
  return escolaRepo.findAll();
}

export async function remove(id) {
  return escolaRepo.remove(id);
}
