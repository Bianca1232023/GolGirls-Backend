import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import * as alunoRepo from '../repositories/alunoRepository.js';
import { sendAlunoSetupEmail, sendAlunoPasswordResetEmail } from '../utils/email.js';

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 12;

export async function register(data) {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48h
  const aluno = await alunoRepo.create({
    ...data,
    set_password_token: token,
    set_password_token_expires: expires,
  });
  if (data.email) {
    await sendAlunoSetupEmail(data.email, token);
  }
  return aluno;
}

export async function login(matricula, password) {
  const aluno = await alunoRepo.findByMatricula(matricula)
    || (await alunoRepo.findByEmail(matricula));
  if (!aluno) return null;
  if (!aluno.password) return null; // conta sem senha definida
  const ok = await bcrypt.compare(password, aluno.password);
  return ok ? aluno : null;
}

export async function setPassword(token, password) {
  const aluno = await alunoRepo.findBySetPasswordToken(token);
  if (!aluno) return { error: 'Token inválido' };
  if (aluno.set_password_token_expires < new Date()) return { error: 'Token expirado' };
  const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  await alunoRepo.updateById(aluno.id, {
    password: hash,
    set_password_token: null,
    set_password_token_expires: null,
    ativo: true,
  });
  return { ok: true };
}

export async function forgotPassword(email) {
  const aluno = await alunoRepo.findByEmail(email);
  if (!aluno) return; // silently ignore
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1h
  await alunoRepo.updateById(aluno.id, { reset_token: token, reset_token_expires: expires });
  await sendAlunoPasswordResetEmail(email, token);
}

export async function resetPassword(token, password) {
  const aluno = await alunoRepo.findByResetToken(token);
  if (!aluno) return { error: 'Token inválido' };
  if (aluno.reset_token_expires < new Date()) return { error: 'Token expirado' };
  const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  await alunoRepo.updateById(aluno.id, { password: hash, reset_token: null, reset_token_expires: null });
  return { ok: true };
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

export async function getById(id) {
  return alunoRepo.findById(id);
}

export async function updateSelf(id, data) {
  return alunoRepo.updateById(id, data);
}

export async function remove(id) {
  return alunoRepo.remove(id);
}
