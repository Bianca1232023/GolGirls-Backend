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

// NOVA FUNÇÃO: Filtrando o relatório apenas pela turma selecionada
export async function getRelatorioCompletoDaTurma(idDaTurma) {
  // 1. Pega os dados da turma e os alunos que estão nela
  const turma = await prisma.turma.findUnique({
    where: { id: idDaTurma },
    include: {
      alunos: {
        select: { id: true, nome: true, matricula: true }
      }
    }
  });

  if (!turma) {
    return [];
  }

  // 2. Pega todas as chamadas dessa turma específica
  const chamadasDaTurma = await prisma.chamada.findMany({
    where: { turma_id: idDaTurma },
    include: { registros: true },
  });

  let relatorioFinal = [];
  let totalDeAulas = chamadasDaTurma.length;

  // 3. Monta os dados de presenca aluno por aluno usando um laco de repeticao simples
  for (let i = 0; i < turma.alunos.length; i++) {
    let alunoAtual = turma.alunos[i];
    
    let totalPresente = 0;
    let totalFalta = 0;

    // Procura o aluno em cada chamada feita
    for (let j = 0; j < chamadasDaTurma.length; j++) {
      let chamada = chamadasDaTurma[j];
      
      for (let k = 0; k < chamada.registros.length; k++) {
        let registro = chamada.registros[k];
        
        if (registro.aluno_id === alunoAtual.id) {
          if (registro.presente === true) {
            totalPresente = totalPresente + 1;
          } else {
            totalFalta = totalFalta + 1;
          }
        }
      }
    }

    // % se teve aula
    let porcentagem = 0;
    if (totalDeAulas > 0) {
      porcentagem = Math.round((totalPresente / totalDeAulas) * 100);
    }

    // aluno na lista do relatório
    relatorioFinal.push({
      aluno_id: alunoAtual.id,
      nome: alunoAtual.nome,
      matricula: alunoAtual.matricula,
      turma_nome: turma.nome,
      total_aulas: totalDeAulas,
      presentes: totalPresente,
      faltas: totalFalta,
      percentual: porcentagem
    });
  }

  // ordem alfabetica
  relatorioFinal.sort(function(a, b) {
    if (a.nome < b.nome) return -1;
    if (a.nome > b.nome) return 1;
    return 0;
  });

  return relatorioFinal;
}