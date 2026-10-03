import prisma from "../models/prisma.js";

export async function createTable() {
  // no-op: schema gerenciado por `npx prisma migrate dev`
}

export async function createTableProfessorTurmas() {
  // no-op: schema gerenciado por `npx prisma migrate dev`
}

export async function create({ nome, escola_id, nucleo_id, capacidade }) {
  return prisma.turma.create({
    data: {
      nome,
      escola_id: escola_id || null,
      nucleo_id: nucleo_id || null,
      capacidade: capacidade || null,
    },
    select: { id: true, nome: true },
  });
}

export async function linkProfessor(professorId, turmaId) {
  await prisma.professorTurma.create({
    data: { professor_id: professorId, turma_id: turmaId },
  });
}

export async function findByProfessor(professorId) {
  const vinculos = await prisma.professorTurma.findMany({
    where: { professor_id: professorId },
    include: {
      turma: {
        select: {
          id: true,
          nome: true,
          capacidade: true,
          escola: { select: { id: true, nome: true, endereco: true } },
          nucleo: { select: { id: true, nome: true, localizacao: true } },
        },
      },
    },
    orderBy: { turma: { id: "asc" } },
  });
  if (vinculos.length === 0) {
    return findAll();
  }
  return vinculos.map((v) => ({
    id: v.turma.id,
    nome: v.turma.nome,
    capacidade: v.turma.capacidade,
    escola_id: v.turma.escola?.id ?? null,
    escola_nome: v.turma.escola?.nome ?? null,
    escola_endereco: v.turma.escola?.endereco ?? null,
    nucleo_id: v.turma.nucleo?.id ?? null,
    nucleo_nome: v.turma.nucleo?.nome ?? null,
    nucleo_localizacao: v.turma.nucleo?.localizacao ?? null,
  }));
}

export async function professorOwnsTurma(professorId, turmaId) {
  const count = await prisma.professorTurma.count({
    where: { professor_id: professorId },
  });
  if (count === 0) return true;
  const row = await prisma.professorTurma.findUnique({
    where: {
      professor_id_turma_id: { professor_id: professorId, turma_id: turmaId },
    },
  });
  return row !== null;
}

export async function findById(id) {
  return prisma.turma.findUnique({
    where: { id },
    select: { id: true, nome: true, nucleo_id: true },
  });
}

export async function findAll() {
  const turmas = await prisma.turma.findMany({
    include: {
      escola: { select: { id: true, nome: true, endereco: true } },
      nucleo: { select: { id: true, nome: true, localizacao: true } },
      professores: { include: { professor: { select: { name: true } } } },
    },
    orderBy: { id: "asc" },
  });
  return turmas.map((t) => ({
    id: t.id,
    nome: t.nome,
    capacidade: t.capacidade,
    escola_id: t.escola?.id ?? null,
    escola_nome: t.escola?.nome ?? null,
    escola_endereco: t.escola?.endereco ?? null,
    nucleo_id: t.nucleo?.id ?? null,
    nucleo_nome: t.nucleo?.nome ?? null,
    nucleo_localizacao: t.nucleo?.localizacao ?? null,
    professores:
      t.professores
        .map((pt) => pt.professor.name)
        .filter(Boolean)
        .join(", ") || null,
  }));
}

export async function listVinculos() {
  const vinculos = await prisma.professorTurma.findMany({
    include: {
      professor: { select: { name: true } },
      turma: { select: { nome: true } },
    },
    orderBy: [{ turma: { nome: "asc" } }, { professor: { name: "asc" } }],
  });
  return vinculos.map((v) => ({
    professor_id: v.professor_id,
    professor_nome: v.professor.name,
    turma_id: v.turma_id,
    turma_nome: v.turma.nome,
  }));
}

export async function remove(id) {
  return prisma.turma.delete({ where: { id } });
}
