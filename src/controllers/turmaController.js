import * as turmaService from '../services/turmaService.js';
import { assertNonEmptyString } from '../utils/validation.js';

export async function create(req, res) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ status: 403, message: 'Acesso restrito a administradores' });
  }
  const nome = assertNonEmptyString(req.body?.nome, 'nome');
  const escola_id = req.body?.escola_id ? Number(req.body.escola_id) : undefined;
  const nucleo_id = req.body?.nucleo_id ? Number(req.body.nucleo_id) : undefined;
  const capacidade = req.body?.capacidade ? Number(req.body.capacidade) : undefined;
  const turma = await turmaService.create({ nome, escola_id, nucleo_id, capacidade });
  res.status(201).json({ status: 201, turma });
}

export async function linkProfessorToTurma(req, res) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ status: 403, message: 'Acesso restrito a administradores' });
  }
  const turmaId = Number(req.params.id);
  const professorId = Number(req.body?.professor_id);
  if (!professorId || isNaN(professorId)) {
    return res.status(400).json({ status: 400, message: 'professor_id é obrigatório' });
  }
  await turmaService.linkProfessor(professorId, turmaId);
  res.json({ status: 200, message: 'Professor vinculado à turma com sucesso' });
}

export async function remove(req, res) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ status: 403, message: 'Acesso restrito a administradores' });
  }
  await turmaService.remove(Number(req.params.id));
  res.json({ status: 200, message: 'Turma removida com sucesso' });
}

export async function listVinculos(req, res) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ status: 403, message: 'Acesso restrito a administradores' });
  }
  const vinculos = await turmaService.listVinculos();
  res.json({ status: 200, vinculos });
}

export async function listByProfessor(req, res) {
  if (req.user?.role !== 'professor') {
    return res.status(403).json({ status: 403, message: 'Acesso restrito a professores' });
  }
  const turmas = await turmaService.findByProfessor(req.user.id);
  res.json({ status: 200, turmas });
}

export async function listAll(req, res) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ status: 403, message: 'Acesso restrito a administradores' });
  }
  const turmas = await turmaService.getAll();
  res.json({ status: 200, turmas });
}

export async function getAlunosByTurma(req, res) {
  if (req.user?.role !== 'admin' && req.user?.role !== 'professor') {
    return res.status(403).json({ status: 403, message: 'Acesso restrito a administradores e professores' });
  }
  const { id } = req.params;
  const alunoService = await import('../services/alunoService.js');
  const alunos = await alunoService.getByTurma(id);
  res.json({ status: 200, alunos });
}


