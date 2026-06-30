import prisma from '../models/prisma.js';

export async function createChamada(turmaId, data = new Date()) {
  return prisma.chamada.create({
    data: {
      turma_id: turmaId,
      data,
    },
  });
}

export async function addRegistro(chamadaId, alunoId, presente) {
  return prisma.registro.create({
    data: {
      chamada_id: chamadaId,
      aluno_id: alunoId,
      presente,
    },
  });
}

export async function getChamadaByTurmaAndDate(turmaId, data) {
  return prisma.chamada.findFirst({
    where: {
      turma_id: turmaId,
      data: {
        gte: new Date(new Date(data).setHours(0, 0, 0, 0)),
        lt: new Date(new Date(data).setHours(23, 59, 59, 999)),
      },
    },
    include: {
      registros: true,
    },
  });
}

export async function getChamadaById(chamadaId) {
  return prisma.chamada.findUnique({
    where: { id: chamadaId },
    include: {
      registros: true,
    },
  });
}

export async function updateRegistro(registroId, presente) {
  return prisma.registro.update({
    where: { id: registroId },
    data: { presente },
  });
}

export async function getChamadasByTurma(turmaId) {
  return prisma.chamada.findMany({
    where: { turma_id: turmaId },
    include: {
      registros: true,
    },
    orderBy: {
      data: 'desc',
    },
  });
}

export async function getRelatorioByProfessor(professorId) {
  // 1. Busca turmas do professor com seus alunos
  const professorTurmas = await prisma.professorTurma.findMany({
    where: { professor_id: professorId },
    include: {
      turma: {
        select: {
          id: true,
          nome: true,
          alunos: { select: { id: true, nome: true, matricula: true } },
        },
      },
    },
  });

  if (!professorTurmas.length) return [];

  // 2. Monta mapa de todos os alunos das turmas (base para o relatório)
  const alunoMap = new Map();
  for (const pt of professorTurmas) {
    for (const aluno of pt.turma.alunos) {
      if (!alunoMap.has(aluno.id)) {
        alunoMap.set(aluno.id, {
          aluno_id: aluno.id,
          nome: aluno.nome,
          matricula: aluno.matricula,
          turma_nome: pt.turma.nome,
          total_aulas: 0,
          presentes: 0,
          faltas: 0,
        });
      }
    }
  }

  // 3. Busca chamadas com registros para acumular presença/falta
  const turmaIds = professorTurmas.map((pt) => pt.turma_id);
  const chamadas = await prisma.chamada.findMany({
    where: { turma_id: { in: turmaIds } },
    include: { registros: true },
  });

  for (const chamada of chamadas) {
    for (const r of chamada.registros) {
      // Ignora registros órfãos (aluno deletado)
      if (!alunoMap.has(r.aluno_id)) continue;
      const entry = alunoMap.get(r.aluno_id);
      entry.total_aulas += 1;
      if (r.presente) entry.presentes += 1;
      else entry.faltas += 1;
    }
  }

  return Array.from(alunoMap.values())
    .map((entry) => ({
      ...entry,
      percentual: entry.total_aulas > 0
        ? Math.round((entry.presentes / entry.total_aulas) * 100)
        : 0,
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome));
}
