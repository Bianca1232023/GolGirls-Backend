import jwt from 'jsonwebtoken';
import * as adminService from '../services/adminService.js';
import { assertEmail, assertNonEmptyString, assertPassword } from '../utils/validation.js';
import { sendAdminSetupEmail, sendPasswordResetEmail } from '../utils/email.js';

function signToken(admin) {
  return jwt.sign({ id: admin.id, role: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });
}

export async function invite(req, res) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ status: 403, message: 'Acesso restrito a administradores' });
  }
  const email = assertEmail(req.body?.email);
  if (await adminService.emailTaken(email)) {
    const err = new Error('Email já cadastrado');
    err.status = 409;
    throw err;
  }
  const { token } = await adminService.invite(email);
  await sendAdminSetupEmail(email, token);
  res.status(201).json({ status: 201, message: 'Administrador convidado com sucesso. E-mail enviado.' });
}

export async function forgotPassword(req, res) {
  const email = assertEmail(req.body?.email);
  const token = await adminService.requestPasswordReset(email);
  if (token) {
    await sendPasswordResetEmail(email, token, 'admin');
  }
  res.json({ status: 200, message: 'Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.' });
}

export async function resetPassword(req, res) {
  const token = assertNonEmptyString(req.body?.token, 'token');
  const password = assertPassword(req.body?.password);
  const ok = await adminService.resetPassword(token, password);
  if (!ok) {
    return res.status(400).json({ status: 400, message: 'Token inválido ou expirado' });
  }
  res.json({ status: 200, message: 'Senha redefinida com sucesso. Você já pode fazer login.' });
}

export async function setPassword(req, res) {
  const token = assertNonEmptyString(req.body?.token, 'token');
  const name = assertNonEmptyString(req.body?.name, 'name');
  const password = assertPassword(req.body?.password);
  const admin = await adminService.findByResetToken(token);
  if (!admin) {
    return res.status(400).json({ status: 400, message: 'Token inválido ou expirado' });
  }
  await adminService.activate(admin.id, name, password);
  res.json({ status: 200, message: 'Senha definida com sucesso. Você já pode fazer login.' });
}

export async function register(req, res) {
  const name = assertNonEmptyString(req.body?.name, 'name');
  const email = assertEmail(req.body?.email);
  const password = assertPassword(req.body?.password);
  if (await adminService.emailTaken(email)) {
    const err = new Error('Email já cadastrado');
    err.status = 409;
    throw err;
  }
  await adminService.register({ name, email, password });
  res.status(201).json({ status: 201, message: 'Admin registrado com sucesso' });
}

export async function login(req, res) {
  const email = assertEmail(req.body?.email);
  const password = assertNonEmptyString(req.body?.password, 'password');
  const admin = await adminService.login(email, password);
  if (!admin) {
    return res.status(401).json({ status: 401, message: 'Email ou senha inválidos' });
  }
  if (admin.error) {
    return res.status(403).json({ status: 403, message: admin.error });
  }
  const token = signToken(admin);
  res.json({ status: 200, token });
}

export async function getAll(req, res) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ status: 403, message: 'Acesso restrito a administradores' });
  }
  const { id } = req.query;
  const admins = await adminService.getAll(id);
  res.json({ status: 200, admins });
}

export async function update(req, res) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ status: 403, message: 'Acesso restrito a administradores' });
  }
  const { id } = req.params;
  const name = assertNonEmptyString(req.body?.name, 'name');
  const email = assertEmail(req.body?.email);
  const password = assertPassword(req.body?.password);
  await adminService.update(id, { name, email, password });
  res.json({ status: 200, message: 'Admin atualizado com sucesso' });
}

export async function updatePartial(req, res) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ status: 403, message: 'Acesso restrito a administradores' });
  }
  const { id } = req.params;
  const result = await adminService.updatePartial(id, req.body);
  if (result?.error) {
    return res.status(400).json({ status: 400, message: result.error });
  }
  res.json({ status: 200, message: 'Admin atualizado com sucesso' });
}

export async function remove(req, res) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ status: 403, message: 'Acesso restrito a administradores' });
  }
  const { id } = req.params;
  await adminService.remove(id);
  res.json({ status: 200, message: 'Admin removido com sucesso' });
}
