import jwt from 'jsonwebtoken';
import * as alunoService from '../services/alunoService.js';
import * as turmaService from '../services/turmaService.js';
import { assertNonEmptyString } from '../utils/validation.js';

function signToken(aluno) {
  return jwt.sign({ id: aluno.id, role: 'aluno' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });
}

export async function create(req, res) {
  if (req.user?.role !== 'professor') {
    return res.status(403).json({ status: 403, message: 'Acesso restrito a professores' });
  }

  const turma_id = Number(req.body?.turma_id);
  if (!turma_id || isNaN(turma_id)) {
    return res.status(400).json({ status: 400, message: 'turma_id é obrigatório' });
  }

  const owns = await turmaService.professorOwnsTurma(req.user.id, turma_id);
  if (!owns) {
    return res.status(403).json({ status: 403, message: 'Turma não pertence a este professor' });
  }

  const nome = assertNonEmptyString(req.body?.nome, 'nome');
  const matricula = assertNonEmptyString(req.body?.matricula, 'matricula');
  const nucleo_id = Number(req.body?.nucleo_id);
  const escola_id = Number(req.body?.escola_id);
  const bairro = assertNonEmptyString(req.body?.bairro, 'bairro');
  const email = req.body?.email?.trim() || null;

  if (!nucleo_id || isNaN(nucleo_id)) {
    return res.status(400).json({ status: 400, message: 'nucleo_id é obrigatório' });
  }
  if (!escola_id || isNaN(escola_id)) {
    return res.status(400).json({ status: 400, message: 'escola_id é obrigatório' });
  }

  await alunoService.register({ nome, matricula, email, nucleo_id, bairro, escola_id, turma_id });
  const msg = email
    ? 'Aluna cadastrada! Um e-mail com o link para definir a senha foi enviado.'
    : 'Cadastro do aluno registrado com sucesso';
  res.status(201).json({ status: 201, message: msg });
}

export async function setPassword(req, res) {
  const token = req.body?.token;
  const password = req.body?.password;
  if (!token || !password) {
    return res.status(400).json({ status: 400, message: 'token e password são obrigatórios' });
  }
  const result = await alunoService.setPassword(token, password);
  if (result.error) return res.status(400).json({ status: 400, message: result.error });
  res.json({ status: 200, message: 'Senha definida com sucesso' });
}

export async function forgotPassword(req, res) {
  const email = req.body?.email?.trim();
  if (!email) return res.status(400).json({ status: 400, message: 'E-mail é obrigatório' });
  await alunoService.forgotPassword(email);
  res.json({ status: 200, message: 'Se o e-mail existir, um link será enviado.' });
}

export async function resetPassword(req, res) {
  const { token, password } = req.body ?? {};
  if (!token || !password) {
    return res.status(400).json({ status: 400, message: 'token e password são obrigatórios' });
  }
  const result = await alunoService.resetPassword(token, password);
  if (result.error) return res.status(400).json({ status: 400, message: result.error });
  res.json({ status: 200, message: 'Senha redefinida com sucesso' });
}

export async function remove(req, res) {
  if (req.user?.role !== 'professor' && req.user?.role !== 'admin') {
    return res.status(403).json({ status: 403, message: 'Acesso restrito' });
  }
  const id = Number(req.params.id);
  if (!id || isNaN(id)) return res.status(400).json({ status: 400, message: 'ID inválido' });
  await alunoService.remove(id);
  res.json({ status: 200, message: 'Aluna removida com sucesso' });
}

export async function updateTurma(req, res) {
  if (req.user?.role !== 'professor') {
    return res.status(403).json({ status: 403, message: 'Acesso restrito a professores' });
  }

  const alunoId = Number(req.params.id);
  const turma_id = Number(req.body?.turma_id);

  if (!turma_id || isNaN(turma_id)) {
    return res.status(400).json({ status: 400, message: 'turma_id é obrigatório' });
  }

  const owns = await turmaService.professorOwnsTurma(req.user.id, turma_id);
  if (!owns) {
    return res.status(403).json({ status: 403, message: 'Turma não pertence a este professor' });
  }

  await alunoService.updateTurma(alunoId, turma_id);
  res.json({ status: 200, message: 'Aluno movido para a turma com sucesso' });
}

export async function login(req, res) {
  const value = assertNonEmptyString(req.body?.matricula, 'matricula');
  const password = req.body?.password;
  const aluno = await alunoService.login(value, password);
  if (!aluno) {
    return res.status(401).json({ status: 401, message: 'Credenciais inválidas' });
  }
  const token = signToken(aluno);
  res.json({ status: 200, token });
}

export async function listAlunos(req, res) {
  if (req.user?.role !== 'professor' && req.user?.role !== 'admin') {
    return res.status(403).json({ status: 403, message: 'Acesso restrito a professores e administradores' });
  }

  if (req.user?.role === 'professor') {
    const { turma_id, nucleo_id, escola_id, bairro } = req.query;
    const alunos = await alunoService.getWithFilters(req.user.id, { turma_id, nucleo_id, escola_id, bairro });
    return res.json({ status: 200, alunos });
  }

  const rows = await alunoService.getAll();
  res.json({ status: 200, alunos: rows });
}

export async function getMe(req, res) {
  if (req.user?.role !== 'aluno') {
    return res.status(403).json({ status: 403, message: 'Acesso restrito a alunos' });
  }
  const aluno = await alunoService.getById(req.user.id);
  if (!aluno) return res.status(404).json({ status: 404, message: 'Perfil não encontrado' });
  res.json({ status: 200, aluno });
}

export async function updateMe(req, res) {
  if (req.user?.role !== 'aluno') {
    return res.status(403).json({ status: 403, message: 'Acesso restrito a alunos' });
  }
  const data = {};
  if (req.body?.nome) data.nome = assertNonEmptyString(req.body.nome, 'nome');
  if (req.body?.bairro) data.bairro = assertNonEmptyString(req.body.bairro, 'bairro');
  if (Object.keys(data).length === 0) {
    return res.status(400).json({ status: 400, message: 'Nenhum campo válido para atualizar' });
  }
  await alunoService.updateSelf(req.user.id, data);
  res.json({ status: 200, message: 'Perfil atualizado com sucesso' });
}
