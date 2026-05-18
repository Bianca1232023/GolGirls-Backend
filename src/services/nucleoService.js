import * as nucleoRepo from '../repositories/nucleoRepository.js';

export async function create(nome, localizacao) {
  return nucleoRepo.create(nome, localizacao);
}

export async function getAll() {
  return nucleoRepo.findAll();
}

export async function remove(id) {
  return nucleoRepo.remove(id);
}
