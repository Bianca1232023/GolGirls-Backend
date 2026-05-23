import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import * as alunoRepo from '../repositories/alunoRepository.js';
import * as presencaRepo from '../repositories/presencaRepository.js';
import { sendAlunoSetupEmail, sendAlunoPasswordResetEmail } from '../utils/email.js';

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 12;

export async function register(data) {
  const emailTaken = data.email ? await alunoRepo.emailTaken(data.email) : null;
  if (emailTaken) {
    const err = new Error('E-mail já cadastrado para outra aluna');
    err.status = 409;
    throw err;
  }

  const token = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const aluno = await alunoRepo.create({
    ...data,
    reset_token: token,
    reset_token_expires: expires,
    senha_ativa: false,
  });

  if (data.email) {
    await sendAlunoSetupEmail(data.email, token, data.nome);
  }

  return aluno;
}

export async function login(matricula, password) {
  const row = await alunoRepo.findByMatriculaWithPassword(matricula);
  if (!row) return null;
  if (!row.senha_ativa || !row.password) {
    return { error: 'Acesso ainda não ativado. Verifique seu e-mail para definir a senha.' };
  }
  const ok = await bcrypt.compare(password, row.password);
  if (!ok) return null;
  return { id: row.id, nome: row.nome, matricula: row.matricula };
}

export async function findByResetToken(token) {
  return alunoRepo.findByResetToken(token);
}

export async function activatePassword(id, password) {
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  return alunoRepo.activatePassword(id, passwordHash);
}

export async function requestPasswordReset(email) {
  const aluno = await alunoRepo.findByEmail(email);
  if (!aluno || !aluno.senha_ativa) return null;
  const token = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000);
  await alunoRepo.setResetToken(aluno.id, token, expires);
  return token;
}

export async function resetPassword(token, password) {
  const aluno = await alunoRepo.findByResetToken(token);
  if (!aluno) return false;
  await activatePassword(aluno.id, password);
  return true;
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

export async function getProfile(alunoId) {
  return alunoRepo.findById(alunoId);
}

export async function getJornada(alunoId) {
  const aluno = await alunoRepo.findById(alunoId);
  if (!aluno) return null;
  const total_presencas = await presencaRepo.countByAluno(alunoId);
  const historico = await presencaRepo.listByAluno(alunoId, 8);
  return {
    aluno,
    stats: {
      total_presencas,
      turma: aluno.turma_nome,
      nucleo: aluno.nucleo,
      ativo: aluno.ativo,
    },
    historico_presenca: historico.map((p) => ({
      data: p.data_aula,
      presente: p.presente,
    })),
    conquistas: buildConquistas(total_presencas),
  };
}

function buildConquistas(total) {
  const list = [];
  if (total >= 1) list.push({ id: 'primeira_aula', titulo: 'Primeira presença', descricao: 'Você começou sua jornada!' });
  if (total >= 5) list.push({ id: 'constante', titulo: 'Presença constante', descricao: '5 ou mais aulas registradas' });
  if (total >= 10) list.push({ id: 'dedicada', titulo: 'Aluna dedicada', descricao: '10 ou mais presenças' });
  return list;
}
