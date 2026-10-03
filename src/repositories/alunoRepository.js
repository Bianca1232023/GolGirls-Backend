import prisma from '../models/prisma.js';

export async function createTable() {
  // no-op: schema gerenciado por `npx prisma migrate dev`
}

export async function create(data) {
  return prisma.aluno.create({
    data: {
      nome: data.nome,
      matricula: data.matricula,
      email: data.email ?? null,
      set_password_token: data.set_password_token ?? null,
      set_password_token_expires: data.set_password_token_expires ?? null,
      nucleo_id: data.nucleo_id,
      idade: data.idade ?? null,
      ativo: data.ativo ?? true,
      dia_aula: data.dia_aula ?? null,
      bairro: data.bairro,
      turma_id: data.turma_id ?? null,
      escola_id: data.escola_id ?? null,
    },
  });
}

export async function findByMatricula(matricula) {
  return prisma.aluno.findFirst({
    where: { matricula },
  });
}

function formatAluno(a) {
  return {
    id: a.id,
    nome: a.nome,
    matricula: a.matricula,
    idade: a.idade,
    ativo: a.ativo,
    dia_aula: a.dia_aula,
    bairro: a.bairro,
    nucleo_id: a.nucleo?.id ?? null,
    nucleo: a.nucleo?.nome ?? null,
    escola_id: a.escola?.id ?? null,
    escola: a.escola?.nome ?? null,
    turma_id: a.turma?.id ?? null,
    turma_nome: a.turma?.nome ?? null,
  };
}

const alunoInclude = {
  nucleo: { select: { id: true, nome: true } },
  escola: { select: { id: true, nome: true } },
  turma: { select: { id: true, nome: true } },
};

export async function findByTurma(turmaId) {
  const rows = await prisma.aluno.findMany({
    where: { turma_id: turmaId },
    include: alunoInclude,
    orderBy: { id: 'asc' },
  });
  return rows.map(formatAluno);
}

export async function findAll() {
  const rows = await prisma.aluno.findMany({ include: alunoInclude, orderBy: { id: 'asc' } });
  return rows.map(formatAluno);
}

export async function findWithFilters(professorId, filters = {}) {
  const where = {
    turma: { professores: { some: { professor_id: professorId } } },
  };
  if (filters.turma_id) where.turma_id = Number(filters.turma_id);
  if (filters.nucleo_id) where.nucleo_id = Number(filters.nucleo_id);
  if (filters.escola_id) where.escola_id = Number(filters.escola_id);
  if (filters.bairro) where.bairro = { contains: filters.bairro };

  const rows = await prisma.aluno.findMany({ where, include: alunoInclude, orderBy: { id: 'asc' } });
  return rows.map(formatAluno);
}

export async function updateTurma(alunoId, turmaId) {
  return prisma.aluno.update({ where: { id: alunoId }, data: { turma_id: turmaId } });
}

export async function findById(id) {
  const a = await prisma.aluno.findUnique({ where: { id }, include: alunoInclude });
  return a ? formatAluno(a) : null;
}

export async function updateById(id, data) {
  return prisma.aluno.update({ where: { id }, data });
}

export async function findByEmail(email) {
  return prisma.aluno.findUnique({ where: { email } });
}

export async function findBySetPasswordToken(token) {
  return prisma.aluno.findFirst({ where: { set_password_token: token } });
}

export async function findByResetToken(token) {
  return prisma.aluno.findFirst({ where: { reset_token: token } });
}

export async function remove(id) {
  return prisma.aluno.delete({ where: { id } });
}
