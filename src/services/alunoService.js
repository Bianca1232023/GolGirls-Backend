import bcrypt from 'bcryptjs';
import * as alunoRepo from '../repositories/alunoRepository.js';
import * as presencaRepo from '../repositories/presencaRepository.js';

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 12;

export async function register(data) {
  return alunoRepo.create(data);
}

export async function login(matricula) {
  return alunoRepo.findByMatricula(matricula);
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
