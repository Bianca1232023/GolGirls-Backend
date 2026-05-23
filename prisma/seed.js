import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const SENHA = 'SenhaTeste123';
const ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 12;

async function main() {
  const passwordHash = await bcrypt.hash(SENHA, ROUNDS);

  const admin = await prisma.admin.upsert({
    where: { email: 'admin.teste@gogirls.local' },
    update: { name: 'Marina Admin', password: passwordHash, ativo: true },
    create: {
      name: 'Marina Admin',
      email: 'admin.teste@gogirls.local',
      password: passwordHash,
      ativo: true,
    },
  });

  const professor = await prisma.professor.upsert({
    where: { email: 'prof.ana@gogirls.local' },
    update: { name: 'Ana Professora', password: passwordHash, ativo: true },
    create: {
      name: 'Ana Professora',
      email: 'prof.ana@gogirls.local',
      password: passwordHash,
      ativo: true,
    },
  });

  const nucleo = await prisma.nucleo.upsert({
    where: { nome: 'Núcleo Centro' },
    update: { localizacao: 'Av. Brasil, 500 — Rio de Janeiro' },
    create: { nome: 'Núcleo Centro', localizacao: 'Av. Brasil, 500 — Rio de Janeiro' },
  });

  const escola = await prisma.escola.upsert({
    where: { nome: 'EM GolGirls' },
    update: { endereco: 'Rua do Esporte, 42' },
    create: { nome: 'EM GolGirls', endereco: 'Rua do Esporte, 42' },
  });

  let turma = await prisma.turma.findFirst({
    where: { nome: 'Turma Futebol 2026' },
  });
  if (!turma) {
    turma = await prisma.turma.create({
      data: {
        nome: 'Turma Futebol 2026',
        nucleo_id: nucleo.id,
        escola_id: escola.id,
        capacidade: 25,
      },
    });
  } else {
    turma = await prisma.turma.update({
      where: { id: turma.id },
      data: { nucleo_id: nucleo.id, escola_id: escola.id, capacidade: 25 },
    });
  }

  await prisma.professorTurma.upsert({
    where: {
      professor_id_turma_id: {
        professor_id: professor.id,
        turma_id: turma.id,
      },
    },
    update: {},
    create: { professor_id: professor.id, turma_id: turma.id },
  });

  const alunosData = [
    {
      matricula: '2026001',
      nome: 'Julia Santos',
      email: 'julia.santos@gogirls.local',
      idade: 12,
      bairro: 'Centro',
      dia_aula: 'Terça e Quinta',
      telefone_aluna: '21990001001',
      nome_responsavel: 'Carla Santos',
      telefone_responsavel: '21990001002',
    },
    {
      matricula: '2026002',
      nome: 'Beatriz Oliveira',
      email: 'beatriz.oliveira@gogirls.local',
      idade: 13,
      bairro: 'Copacabana',
      dia_aula: 'Terça e Quinta',
      telefone_aluna: '21990002001',
      nome_responsavel: 'Paulo Oliveira',
      telefone_responsavel: '21990002002',
    },
    {
      matricula: '2026003',
      nome: 'Larissa Costa',
      email: 'larissa.costa@gogirls.local',
      idade: 11,
      bairro: 'Tijuca',
      dia_aula: 'Terça e Quinta',
      telefone_aluna: '21990003001',
      nome_responsavel: 'Fernanda Costa',
      telefone_responsavel: '21990003002',
    },
  ];

  const alunos = [];
  for (const a of alunosData) {
    const payload = {
      ...a,
      password: passwordHash,
      senha_ativa: true,
      turma_id: turma.id,
      nucleo_id: nucleo.id,
      escola_id: escola.id,
      ativo: true,
    };
    const existing = await prisma.aluno.findFirst({ where: { matricula: a.matricula } });
    const row = existing
      ? await prisma.aluno.update({ where: { id: existing.id }, data: payload })
      : await prisma.aluno.create({ data: payload });
    alunos.push(row);
  }

  const datasAula = ['2026-05-10', '2026-05-15', '2026-05-20'];
  for (const aluno of alunos) {
    for (let i = 0; i < datasAula.length; i++) {
      const presente = i < 2 || aluno.matricula !== '2026003';
      await prisma.presenca.upsert({
        where: {
          aluno_id_data_aula: {
            aluno_id: aluno.id,
            data_aula: new Date(datasAula[i]),
          },
        },
        update: { presente, turma_id: turma.id, professor_id: professor.id },
        create: {
          aluno_id: aluno.id,
          turma_id: turma.id,
          professor_id: professor.id,
          data_aula: new Date(datasAula[i]),
          presente,
        },
      });
    }
  }

  console.log('\n=== Dados fictícios GoLGirls (dev) ===\n');
  console.log('Senha (admin e professor):', SENHA);
  console.log('\n--- Admin ---');
  console.log('E-mail:', admin.email);
  console.log('\n--- Professor ---');
  console.log('E-mail:', professor.email);
  console.log('Turma:', turma.nome, `(id ${turma.id})`);
  console.log('\n--- Alunas (matrícula + senha) ---');
  console.log('Senha alunas:', SENHA);
  for (const a of alunos) {
    console.log(`  ${a.matricula} — ${a.nome}`);
  }
  console.log('\n--- Estrutura ---');
  console.log('Núcleo:', nucleo.nome);
  console.log('Escola:', escola.nome);
  console.log('\nFront: http://localhost:5173  |  API: http://localhost:3001\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
