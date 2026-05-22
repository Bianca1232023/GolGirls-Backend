import prisma from '../models/prisma.js';

export async function upsertMany(professorId, turmaId, dataAula, registros) {
  const date = new Date(dataAula);
  const results = [];
  for (const { aluno_id, presente } of registros) {
    const row = await prisma.presenca.upsert({
      where: {
        aluno_id_data_aula: { aluno_id, data_aula: date },
      },
      create: {
        aluno_id,
        turma_id: turmaId,
        professor_id: professorId,
        data_aula: date,
        presente: Boolean(presente),
      },
      update: {
        presente: Boolean(presente),
        professor_id: professorId,
        turma_id: turmaId,
      },
    });
    results.push(row);
  }
  return results;
}

export async function countByAluno(alunoId) {
  return prisma.presenca.count({
    where: { aluno_id: alunoId, presente: true },
  });
}

export async function listByAluno(alunoId, limit = 10) {
  return prisma.presenca.findMany({
    where: { aluno_id: alunoId },
    orderBy: { data_aula: 'desc' },
    take: limit,
    select: { data_aula: true, presente: true, turma_id: true },
  });
}

export async function statsByTurma(turmaId, fromDate) {
  const where = { turma_id: turmaId };
  if (fromDate) where.data_aula = { gte: new Date(fromDate) };
  const total = await prisma.presenca.count({ where });
  const presentes = await prisma.presenca.count({ where: { ...where, presente: true } });
  return { total_registros: total, total_presentes: presentes };
}

export async function statsGlobal() {
  const [alunos, turmas, presencas, presentes] = await Promise.all([
    prisma.aluno.count({ where: { ativo: true } }),
    prisma.turma.count(),
    prisma.presenca.count(),
    prisma.presenca.count({ where: { presente: true } }),
  ]);
  return { alunos_ativos: alunos, turmas: turmas, registros_presenca: presencas, total_presentes: presentes };
}
