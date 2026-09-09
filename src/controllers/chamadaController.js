import * as chamadaService from '../services/chamadaService.js';
import * as turmaService from '../services/turmaService.js';
import * as alunoService from '../services/alunoService.js';

export async function iniciarChamada(req, res) {
  try {
    if (req.user?.role !== 'professor') {
      return res.status(403).json({ status: 403, message: 'Acesso restrito a professores' });
    }

    const turmaId = Number(req.body?.turma_id);
    if (!turmaId || isNaN(turmaId)) {
      return res.status(400).json({ status: 400, message: 'turma_id é obrigatório' });
    }

    const owns = await turmaService.professorOwnsTurma(req.user.id, turmaId);
    if (!owns) {
      return res.status(403).json({ status: 403, message: 'Turma não pertence a este professor' });
    }

    const chamada = await chamadaService.iniciarChamada(turmaId);
    const alunos = await alunoService.getByTurma(turmaId);

    res.status(200).json({
      status: 200,
      data: {
        chamada_id: chamada.id,
        data: chamada.data,
        alunos: alunos || [],
      },
    });
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
}

export async function registrarPresenca(req, res) {
  try {
    if (req.user?.role !== 'professor') {
      return res.status(403).json({ status: 403, message: 'Acesso restrito a professores' });
    }

    const chamadaId = Number(req.body?.chamada_id);
    const alunoId = Number(req.body?.aluno_id);
    const presente = Boolean(req.body?.presente);

    if (!chamadaId || isNaN(chamadaId)) {
      return res.status(400).json({ status: 400, message: 'chamada_id é obrigatório' });
    }
    if (!alunoId || isNaN(alunoId)) {
      return res.status(400).json({ status: 400, message: 'aluno_id é obrigatório' });
    }

    const resultado = await chamadaService.registrarPresenca(chamadaId, alunoId, presente);

    res.status(200).json({
      status: 200,
      message: 'Presença registrada com sucesso',
      data: resultado,
    });
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
}

export async function registrarChamadaLote(req, res) {
  try {
    if (req.user?.role !== 'professor') {
      return res.status(403).json({ status: 403, message: 'Acesso restrito a professores' });
    }

    const turmaId = Number(req.body?.turma_id);
    if (!turmaId || isNaN(turmaId)) {
      return res.status(400).json({ status: 400, message: 'turma_id é obrigatório' });
    }

    const registros = Array.isArray(req.body?.registros) ? req.body.registros : [];
    if (!registros.length) {
      return res.status(400).json({ status: 400, message: 'registros é obrigatório' });
    }

    const owns = await turmaService.professorOwnsTurma(req.user.id, turmaId);
    if (!owns) {
      return res.status(403).json({ status: 403, message: 'Turma não pertence a este professor' });
    }

    const dataParam = req.body?.data ? new Date(req.body.data) : new Date();
    if (isNaN(dataParam.getTime())) {
      return res.status(400).json({ status: 400, message: 'data inválida' });
    }
    const chamada = await chamadaService.iniciarChamada(turmaId, dataParam);

    for (const r of registros) {
      const alunoId = Number(r?.aluno_id);
      if (!alunoId || isNaN(alunoId)) continue;
      await chamadaService.registrarPresenca(chamada.id, alunoId, Boolean(r?.presente));
    }

    res.status(200).json({
      status: 200,
      message: 'Chamada registrada com sucesso',
      data: { chamada_id: chamada.id, total: registros.length },
    });
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
}

export async function getChamadasTurma(req, res) {
  try {
    if (req.user?.role !== 'professor') {
      return res.status(403).json({ status: 403, message: 'Acesso restrito a professores' });
    }

    const turmaId = Number(req.params.turma_id);
    if (!turmaId || isNaN(turmaId)) {
      return res.status(400).json({ status: 400, message: 'turma_id é obrigatório' });
    }

    const owns = await turmaService.professorOwnsTurma(req.user.id, turmaId);
    if (!owns) {
      return res.status(403).json({ status: 403, message: 'Turma não pertence a este professor' });
    }

    const chamadas = await chamadaService.getChamadasTurma(turmaId);

    res.status(200).json({
      status: 200,
      data: chamadas,
    });
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
}

export async function getChamadaDetalhes(req, res) {
  try {
    if (req.user?.role !== 'professor') {
      return res.status(403).json({ status: 403, message: 'Acesso restrito a professores' });
    }

    const chamadaId = Number(req.params.chamada_id);
    if (!chamadaId || isNaN(chamadaId)) {
      return res.status(400).json({ status: 400, message: 'chamada_id é obrigatório' });
    }

    const chamada = await chamadaService.getChamadaDetalhes(chamadaId);

    res.status(200).json({
      status: 200,
      data: chamada,
    });
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
}

export async function getRelatorios(req, res) {
  try {
    if (req.user?.role !== 'professor') {
      return res.status(403).json({ status: 403, message: 'Acesso restrito a professores' });
    }

    let idDaTurma = req.query.turma_id || req.params.turma_id;
    if (!idDaTurma) {
      return res.status(400).json({ status: 400, message: 'É obrigatório informar o id da turma.' });
    }
    idDaTurma = Number(idDaTurma);
    if (isNaN(idDaTurma)) {
      return res.status(400).json({ status: 400, message: 'O id da turma deve ser um número válido.' });
    }

    const donoDaTurma = await turmaService.professorOwnsTurma(req.user.id, idDaTurma);
    if (!donoDaTurma) {
      return res.status(403).json({ status: 403, message: 'Turma não pertence a este professor' });
    }

    const relatorioDaTurma = await chamadaService.getRelatorioPorTurma(idDaTurma);

    res.status(200).json({
      status: 200,
      data: relatorioDaTurma,
    });
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
}
