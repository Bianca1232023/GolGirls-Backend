import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import * as adminRepo from '../repositories/adminRepository.js';

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 12;

function stripPassword(row) {
  if (!row) return null;
  const { password: _p, ...rest } = row;
  return rest;
}

export async function register({ name, email, password }) {
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  return adminRepo.create({ name, email, passwordHash });
}

export async function login(email, password) {
  const row = await adminRepo.findByEmail(email);
  if (!row) return null;
  if (!row.ativo) return { error: 'Conta ainda não ativada. Verifique seu e-mail para definir sua senha.' };
  const ok = await bcrypt.compare(password, row.password);
  return ok ? stripPassword(row) : null;
}

export async function invite(email) {
  const token = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return adminRepo.createInvite(email, token, expires);
}

export async function findByResetToken(token) {
  return adminRepo.findByResetToken(token);
}

export async function activate(id, name, password) {
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  return adminRepo.activate(id, name, passwordHash);
}

export async function requestPasswordReset(email) {
  const admin = await adminRepo.findActiveByEmail(email);
  if (!admin) return null;
  const token = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000);
  await adminRepo.setResetToken(admin.id, token, expires);
  return token;
}

export async function resetPassword(token, password) {
  const admin = await adminRepo.findByResetTokenForReset(token);
  if (!admin) return false;
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  await adminRepo.updatePassword(admin.id, passwordHash);
  return true;
}

export async function emailTaken(email) {
  return adminRepo.emailTaken(email);
}

export async function getAll(id) {
  return adminRepo.findAll(id);
}

export async function update(id, { name, email, password }) {
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  return adminRepo.update(id, { name, email, passwordHash });
}

export async function updatePartial(id, body) {
  const allowed = ['name', 'email', 'password'];
  const updates = [];
  const values = [];
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(body, key) && body[key] != null) {
      updates.push(`${key} = ?`);
      if (key === 'password') {
        const p = String(body[key]);
        if (p.length < 8) return { error: 'password deve ter no mínimo 8 caracteres' };
        values.push(await bcrypt.hash(p, BCRYPT_ROUNDS));
      } else {
        values.push(String(body[key]));
      }
    }
  }
  if (updates.length === 0) return { error: 'Nenhum campo válido para atualizar' };
  return adminRepo.updatePartial(id, updates, values);
}

export async function remove(id) {
  return adminRepo.remove(id);
}
