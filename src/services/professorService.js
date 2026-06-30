import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import * as professorRepo from '../repositories/professorRepository.js';

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 12;

function stripPassword(row) {
  if (!row) return null;
  const { password: _p, ...rest } = row;
  return rest;
}

export async function register({ name, email, password }) {
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  return professorRepo.create({ name, email, passwordHash });
}

export async function login(email, password) {
  const row = await professorRepo.findByEmail(email);
  if (!row) return null;
  if (!row.ativo) return { error: 'Conta ainda não ativada. Verifique seu e-mail para definir sua senha.' };
  const ok = await bcrypt.compare(password, row.password);
  return ok ? stripPassword(row) : null;
}

export async function invite(email) {
  const token = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return professorRepo.createInvite(email, token, expires);
}

export async function findByResetToken(token) {
  return professorRepo.findByResetToken(token);
}

export async function activate(id, name, password) {
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  return professorRepo.activate(id, name, passwordHash);
}

export async function requestPasswordReset(email) {
  const professor = await professorRepo.findActiveByEmail(email);
  if (!professor) return null;
  const token = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000);
  await professorRepo.setResetToken(professor.id, token, expires);
  return token;
}

export async function resetPassword(token, password) {
  const professor = await professorRepo.findByResetTokenForReset(token);
  if (!professor) return false;
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  await professorRepo.updatePassword(professor.id, passwordHash);
  return true;
}

export async function emailTaken(email) {
  return professorRepo.emailTaken(email);
}

export async function getById(id) {
  return professorRepo.findById(id);
}

export async function updateSelf(id, { name, email }) {
  const data = {};
  if (name !== undefined) data.name = name;
  if (email !== undefined) data.email = email;
  return professorRepo.updateById(id, data);
}

export async function getAll(id) {
  return professorRepo.findAll(id);
}

export async function remove(id) {
  return professorRepo.remove(id);
}
