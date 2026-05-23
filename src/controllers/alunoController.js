import * as alunoService from '../services/alunoService.js';
import * as turmaService from '../services/turmaService.js';
import { assertEmail, assertNonEmptyString, assertPassword } from '../utils/validation.js';
import { issueToken } from '../utils/jwtTokens.js';
import { refreshAccessToken } from '../utils/jwtTokens.js';
import { sendAlunoPasswordResetEmail } from '../utils/email.js';

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
  const email = assertEmail(req.body?.email);
  const nucleo_id = Number(req.body?.nucleo_id);
  const escola_id = Number(req.body?.escola_id);
  const bairro = assertNonEmptyString(req.body?.bairro, 'bairro');

  if (!nucleo_id || isNaN(nucleo_id)) {
    return res.status(400).json({ status: 400, message: 'nucleo_id é obrigatório' });
  }
  if (!escola_id || isNaN(escola_id)) {
    return res.status(400).json({ status: 400, message: 'escola_id é obrigatório' });
  }

  const idade = req.body?.idade != null ? Number(req.body.idade) : undefined;
  await alunoService.register({
    nome,
    matricula,
    email,
    nucleo_id,
    bairro,
    escola_id,
    turma_id,
    idade: idade && !isNaN(idade) ? idade : undefined,
    telefone_aluna: req.body?.telefone_aluna?.trim() || null,
    nome_responsavel: req.body?.nome_responsavel?.trim() || null,
    telefone_responsavel: req.body?.telefone_responsavel?.trim() || null,
  });
  res.status(201).json({ status: 201, message: 'Cadastro registrado. E-mail enviado para a aluna definir a senha.' });
}

export async function setPassword(req, res) {
  const token = assertNonEmptyString(req.body?.token, 'token');
  const password = assertPassword(req.body?.password);
  const aluno = await alunoService.findByResetToken(token);
  if (!aluno) {
    return res.status(400).json({ status: 400, message: 'Token inválido ou expirado' });
  }
  await alunoService.activatePassword(aluno.id, password);
  res.json({ status: 200, message: 'Senha definida com sucesso. Você já pode fazer login.' });
}

export async function forgotPassword(req, res) {
  const email = assertEmail(req.body?.email);
  const token = await alunoService.requestPasswordReset(email);
  if (token) {
    await sendAlunoPasswordResetEmail(email, token);
  }
  res.json({ status: 200, message: 'Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.' });
}

export async function resetPassword(req, res) {
  const token = assertNonEmptyString(req.body?.token, 'token');
  const password = assertPassword(req.body?.password);
  const ok = await alunoService.resetPassword(token, password);
  if (!ok) {
    return res.status(400).json({ status: 400, message: 'Token inválido ou expirado' });
  }
  res.json({ status: 200, message: 'Senha redefinida com sucesso. Você já pode fazer login.' });
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
  const password = assertNonEmptyString(req.body?.password, 'password');
  const result = await alunoService.login(matricula, password);
  if (!result) {
    return res.status(401).json({ status: 401, message: 'Matrícula ou senha inválida' });
  }
  if (result.error) {
    return res.status(403).json({ status: 403, message: result.error });
  }
  const token = issueToken({ id: result.id, role: 'aluno' });
  res.json({ status: 200, token, aluno: { id: result.id, nome: result.nome, matricula: result.matricula } });
}

export async function me(req, res) {
  if (req.user?.role !== 'aluno') {
    return res.status(403).json({ status: 403, message: 'Acesso restrito a alunas' });
  }
  const aluno = await alunoService.getProfile(req.user.id);
  if (!aluno) {
    return res.status(404).json({ status: 404, message: 'Aluna não encontrada' });
  }
  res.json({ status: 200, aluno });
}

export async function jornada(req, res) {
  if (req.user?.role !== 'aluno') {
    return res.status(403).json({ status: 403, message: 'Acesso restrito a alunas' });
  }
  const data = await alunoService.getJornada(req.user.id);
  if (!data) {
    return res.status(404).json({ status: 404, message: 'Aluna não encontrada' });
  }
  res.json({ status: 200, ...data });
}

export async function refresh(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ status: 401, message: 'Token não fornecido' });
  try {
    const newToken = refreshAccessToken(token);
    res.json({ status: 200, token: newToken });
  } catch (err) {
    res.status(err.status || 403).json({ status: err.status || 403, message: err.message });
  }
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
