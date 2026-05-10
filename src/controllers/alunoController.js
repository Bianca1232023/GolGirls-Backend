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

  if (!nucleo_id || isNaN(nucleo_id)) {
    return res.status(400).json({ status: 400, message: 'nucleo_id é obrigatório' });
  }
  if (!escola_id || isNaN(escola_id)) {
    return res.status(400).json({ status: 400, message: 'escola_id é obrigatório' });
  }

  await alunoService.register({ nome, matricula, nucleo_id, bairro, escola_id, turma_id });
  res.status(201).json({ status: 201, message: 'Cadastro do aluno registrado com sucesso' });
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
  const matricula = assertNonEmptyString(req.body?.matricula, 'matricula');
  const aluno = await alunoService.login(matricula);
  if (!aluno) {
    return res.status(401).json({ status: 401, message: 'Matrícula inválida' });
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
