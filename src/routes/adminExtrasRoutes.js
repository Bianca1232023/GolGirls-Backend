import { Router } from 'express';
import authenticateToken from '../middleware/auth.js';
import * as ctrl from '../controllers/inviteController.js';
import * as professorCtrl from '../controllers/professorController.js';
import * as professorService from '../services/professorService.js';
import prisma from '../models/prisma.js';

const router = Router();

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

// Convites
router.post('/send-invite', authenticateToken, asyncHandler(ctrl.sendInvite));
router.get('/invites', authenticateToken, asyncHandler(ctrl.listAll));

// Corpo docente
router.get('/team', authenticateToken, asyncHandler(ctrl.listTeam));

// Criar professor (convite por admin)
router.post('/createprofessor', authenticateToken, asyncHandler(professorCtrl.createProfessor));

// Deletar professor
router.delete('/professors/:id', authenticateToken, asyncHandler(professorCtrl.remove));

// Listar professores (para selects no frontend)
router.get('/professors', authenticateToken, asyncHandler(async (req, res) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ status: 403, message: 'Acesso restrito a administradores' });
  }
  const professors = await professorService.getAll();
  res.json({ status: 200, professors });
}));

// Relatório de impacto (dados reais)
router.get('/relatorios', authenticateToken, asyncHandler(async (req, res) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ status: 403, message: 'Acesso restrito a administradores' });
  }

  const nucleoId = req.query.nucleo_id ? Number(req.query.nucleo_id) : null;

  // Total de alunas ativas
  const totalAlunas = await prisma.aluno.count({
    where: { ativo: true, ...(nucleoId ? { nucleo_id: nucleoId } : {}) },
  });

  // Taxa de frequência: registros presentes / total registros
  const registros = await prisma.registro.findMany({
    where: nucleoId ? { chamada: { turma: { nucleo_id: nucleoId } } } : {},
    select: { presente: true },
  });
  const totalRegistros = registros.length;
  const totalPresentes = registros.filter((r) => r.presente).length;
  const taxaFrequencia = totalRegistros > 0
    ? Math.round((totalPresentes / totalRegistros) * 100)
    : 0;

  // Risco de evasão: alunas com >= 3 faltas no total
  const faltasPorAluno = await prisma.registro.groupBy({
    by: ['aluno_id'],
    where: {
      presente: false,
      ...(nucleoId ? { chamada: { turma: { nucleo_id: nucleoId } } } : {}),
    },
    _count: { presente: true },
    having: { presente: { _count: { gte: 3 } } },
  });
  const alertasEvasao = faltasPorAluno.length;

  // Frequência mensal (últimos 6 meses)
  const seisAtras = new Date();
  seisAtras.setMonth(seisAtras.getMonth() - 5);
  seisAtras.setDate(1);
  seisAtras.setHours(0, 0, 0, 0);

  const chamadaMensal = await prisma.chamada.findMany({
    where: {
      data: { gte: seisAtras },
      ...(nucleoId ? { turma: { nucleo_id: nucleoId } } : {}),
    },
    include: { registros: { select: { presente: true } } },
    orderBy: { data: 'asc' },
  });

  const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const mesesMap = new Map();
  for (const c of chamadaMensal) {
    const d = new Date(c.data);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!mesesMap.has(key)) mesesMap.set(key, { mes: MESES[d.getMonth()], presentes: 0, total: 0 });
    const entry = mesesMap.get(key);
    entry.total += c.registros.length;
    entry.presentes += c.registros.filter((r) => r.presente).length;
  }
  const chartMensal = Array.from(mesesMap.values()).map((e) => ({
    mes: e.mes,
    pct: e.total > 0 ? Math.round((e.presentes / e.total) * 100) : 0,
  }));

  res.json({
    status: 200,
    relatorio: { totalAlunas, taxaFrequencia, alertasEvasao, chartMensal },
  });
}));

export default router;
