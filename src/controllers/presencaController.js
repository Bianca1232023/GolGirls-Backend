import * as presencaService from '../services/presencaService.js';

export async function registrarChamada(req, res) {
  if (req.user?.role !== 'professor') {
    return res.status(403).json({ status: 403, message: 'Acesso restrito a professores' });
  }
  const turma_id = Number(req.body?.turma_id);
  const data_aula = req.body?.data_aula;
  const registros = req.body?.registros;
  if (!turma_id || !data_aula || !Array.isArray(registros) || registros.length === 0) {
    return res.status(400).json({
      status: 400,
      message: 'turma_id, data_aula e registros (array) são obrigatórios',
    });
  }
  const rows = await presencaService.registrarChamada(req.user.id, turma_id, data_aula, registros);
  res.status(201).json({ status: 201, message: 'Chamada registrada', total: rows.length });
}

export async function relatoriosProfessor(req, res) {
  if (req.user?.role !== 'professor') {
    return res.status(403).json({ status: 403, message: 'Acesso restrito a professores' });
  }
  const data = await presencaService.relatoriosProfessor(req.user.id, req.query.turma_id);
  res.json({ status: 200, ...data });
}

export async function relatoriosAdmin(req, res) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ status: 403, message: 'Acesso restrito a administradores' });
  }
  const data = await presencaService.relatoriosAdmin();
  res.json({ status: 200, relatorio: data });
}
