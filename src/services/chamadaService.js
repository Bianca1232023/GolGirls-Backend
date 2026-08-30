import * as chamadaRepo from '../repositories/chamadaRepository.js';
import * as alunoRepo from '../repositories/alunoRepository.js';

export async function criarChamada(turmaId) {
  return chamadaRepo.createChamada(turmaId);
}

export async function iniciarChamada(turmaId, data = new Date()) {
  const chamada = await chamadaRepo.getChamadaByTurmaAndDate(turmaId, data);
  
  if (chamada) {
    return chamada;
  }

  return chamadaRepo.createChamada(turmaId, data);
}

export async function registrarPresenca(chamadaId, alunoId, presente) {
  const chamada = await chamadaRepo.getChamadaById(chamadaId);
  
  if (!chamada) {
    throw new Error('Chamada não encontrada');
  }

  const registroExistente = chamada.registros.find(r => r.aluno_id === alunoId);
  
  if (registroExistente) {
    return chamadaRepo.updateRegistro(registroExistente.id, presente);
  }

  return chamadaRepo.addRegistro(chamadaId, alunoId, presente);
}

export async function getChamadasTurma(turmaId) {
  return chamadaRepo.getChamadasByTurma(turmaId);
}

export async function getChamadaDetalhes(chamadaId) {
  const chamada = await chamadaRepo.getChamadaById(chamadaId);
  
  if (!chamada) {
    throw new Error('Chamada não encontrada');
  }

  return chamada;
}

// função pra buscar o relatório filtrando pela turma
export async function getRelatorioPorTurma(idDaTurma) {
  return chamadaRepo.getRelatorioCompletoDaTurma(idDaTurma);
}