import jwt from 'jsonwebtoken';
import * as professorService from '../services/professorService.js';
import { assertEmail, assertNonEmptyString, assertPassword } from '../utils/validation.js';
import { sendPasswordSetupEmail, sendPasswordResetEmail } from '../utils/email.js';

function signToken(prof) {
  return jwt.sign({ id: prof.id, role: 'professor' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });
}

export async function login(req, res) {
  const email = assertEmail(req.body?.email);
  const password = assertNonEmptyString(req.body?.password, 'password');
  const result = await professorService.login(email, password);
  if (!result) {
    return res.status(401).json({ status: 401, message: 'Email ou senha inválidos' });
  }
  if (result.error) {
    return res.status(403).json({ status: 403, message: result.error });
  }
  const token = signToken(result);
  res.json({ status: 200, token });
}

export async function forgotPassword(req, res) {
  const email = assertEmail(req.body?.email);
  const token = await professorService.requestPasswordReset(email);
  if (token) {
    await sendPasswordResetEmail(email, token, 'professor');
  }
  res.json({ status: 200, message: 'Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.' });
}

export async function resetPassword(req, res) {
  const token = assertNonEmptyString(req.body?.token, 'token');
  const password = assertPassword(req.body?.password);
  const ok = await professorService.resetPassword(token, password);
  if (!ok) {
    return res.status(400).json({ status: 400, message: 'Token inválido ou expirado' });
  }
  res.json({ status: 200, message: 'Senha redefinida com sucesso. Você já pode fazer login.' });
}

export async function setPassword(req, res) {
  const token = assertNonEmptyString(req.body?.token, 'token');
  const name = assertNonEmptyString(req.body?.name, 'name');
  const password = assertPassword(req.body?.password);
  const prof = await professorService.findByResetToken(token);
  if (!prof) {
    return res.status(400).json({ status: 400, message: 'Token inválido ou expirado' });
  }
  await professorService.activate(prof.id, name, password);
  res.json({ status: 200, message: 'Senha definida com sucesso. Você já pode fazer login.' });
}

export async function createProfessor(req, res) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ status: 403, message: 'Acesso restrito a administradores' });
  }
  const email = assertEmail(req.body?.email);
  if (await professorService.emailTaken(email)) {
    const err = new Error('Email já cadastrado');
    err.status = 409;
    throw err;
  }
  const { token } = await professorService.invite(email);
  await sendPasswordSetupEmail(email, token);
  res.status(201).json({ status: 201, message: 'Professor convidado com sucesso. E-mail enviado.' });
}

export async function remove(req, res) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ status: 403, message: 'Acesso restrito a administradores' });
  }
  await professorService.remove(req.params.id);
  res.json({ status: 200, message: 'Professor removido com sucesso' });
}
