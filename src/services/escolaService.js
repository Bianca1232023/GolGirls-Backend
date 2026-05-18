import * as escolaRepo from '../repositories/escolaRepository.js';

export async function create(nome, endereco) {
  return escolaRepo.create(nome, endereco);
}

export async function getAll() {
  return escolaRepo.findAll();
}

export async function remove(id) {
  return escolaRepo.remove(id);
}
