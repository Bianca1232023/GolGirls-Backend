import * as turmaService from '../services/turmaService.js';
import { assertNonEmptyString } from '../utils/validation.js';

export async function create(req, res) {
  if (req.user?.role !== 'professor') {
    return res.status(403).json({ status: 403, message: 'Acesso restrito a professores' });
  }
  const nome = assertNonEmptyString(req.body?.nome, 'nome');
  const turma = await turmaService.create(nome);
  await turmaService.linkProfessor(req.user.id, turma.id);
  res.status(201).json({ status: 201, turma });
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
