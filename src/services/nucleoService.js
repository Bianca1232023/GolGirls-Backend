import * as nucleoRepo from '../repositories/nucleoRepository.js';

export async function create(nome) {
  return nucleoRepo.create(nome);
}

export async function getAll() {
  return nucleoRepo.findAll();
}

export async function remove(id) {
  return nucleoRepo.remove(id);
}
