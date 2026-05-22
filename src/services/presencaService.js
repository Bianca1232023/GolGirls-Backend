import * as presencaRepo from '../repositories/presencaRepository.js';
import * as alunoRepo from '../repositories/alunoRepository.js';
import * as turmaService from './turmaService.js';

export async function registrarChamada(professorId, turmaId, dataAula, registros) {
  const owns = await turmaService.professorOwnsTurma(professorId, turmaId);
  if (!owns) {
    const err = new Error('Turma não pertence a este professor');
    err.status = 403;
    throw err;
  }
  for (const r of registros) {
    const aluno = await alunoRepo.findById(r.aluno_id);
    if (!aluno || aluno.turma_id !== turmaId) {
      const err = new Error(`Aluna ${r.aluno_id} não pertence à turma`);
      err.status = 400;
      throw err;
    }
  }
  return presencaRepo.upsertMany(professorId, turmaId, dataAula, registros);
}

export async function relatoriosProfessor(professorId, turmaId) {
  if (turmaId) {
    const owns = await turmaService.professorOwnsTurma(professorId, Number(turmaId));
    if (!owns) {
      const err = new Error('Turma não pertence a este professor');
      err.status = 403;
      throw err;
    }
    const stats = await presencaRepo.statsByTurma(Number(turmaId));
    const alunos = await alunoRepo.findByTurma(Number(turmaId));
    return { turma_id: Number(turmaId), alunos_total: alunos.length, ...stats };
  }
  const turmas = await turmaService.findByProfessor(professorId);
  const porTurma = await Promise.all(
    turmas.map(async (t) => {
      const stats = await presencaRepo.statsByTurma(t.id);
      const alunos = await alunoRepo.findByTurma(t.id);
      return { turma_id: t.id, turma_nome: t.nome, alunos_total: alunos.length, ...stats };
    })
  );
  return { turmas: porTurma };
}

export async function relatoriosAdmin() {
  return presencaRepo.statsGlobal();
}
