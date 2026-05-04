import express from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import authenticateToken from '../middleware/auth.js';
import {
  registerAdmin,
  loginAdmin,
  inviteProfessor,
  findProfessorByResetToken,
  activateProfessor,
  getAdmins,
  updateAdmin,
  updateAdminPartial,
  deleteAdmin,
  adminEmailTaken,
  professorEmailTaken,
  loginProfessor,
  loginAluno,
  registerAluno,
  listAlunos,
  listAlunosWithFilters,
  createTurma,
  listTurmas,
  listTurmasByProfessor,
  getTurmaById,
  getAlunosByTurma,
  getProfessorById,
  professorOwnsTurma,
  updateAlunoTurma,
  createNucleo,
  listNucleos,
  deleteNucleo,
  createEscola,
  listEscolas,
  deleteEscola,
} from '../controller/users.js';
import { assertEmail, assertNonEmptyString, assertPassword } from '../utils/validation.js';
import { sendPasswordSetupEmail } from '../utils/email.js';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { status: 429, message: 'Muitas tentativas. Tente novamente mais tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

function signAdminToken(admin) {
  return jwt.sign({ id: admin.id, role: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });
}

function signProfessorToken(prof) {
  return jwt.sign({ id: prof.id, role: 'professor' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });
}

function signAlunoToken(aluno) {
  return jwt.sign({ id: aluno.id, role: 'aluno' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });
}

router.post(
  '/admin/register',
  authLimiter,
  asyncHandler(async (req, res) => {
    const name = assertNonEmptyString(req.body?.name, 'name');
    const email = assertEmail(req.body?.email);
    const password = assertPassword(req.body?.password);

    if (await adminEmailTaken(email)) {
      const err = new Error('Email já cadastrado');
      err.status = 409;
      throw err;
    }

    await registerAdmin({ name, email, password });
    res.status(201).json({ status: 201, message: 'Admin registrado com sucesso' });
  })
);

router.post(
  '/admin/login',
  authLimiter,
  asyncHandler(async (req, res) => {
    const email = assertEmail(req.body?.email);
    const password = assertNonEmptyString(req.body?.password, 'password');

    const admin = await loginAdmin(email, password);
    if (!admin) {
      return res.status(401).json({ status: 401, message: 'Email ou senha inválidos' });
    }

    const token = signAdminToken(admin);
    res.json({ status: 200, token });
  })
);

router.post(
  '/professor/login',
  authLimiter,
  asyncHandler(async (req, res) => {
    const email = assertEmail(req.body?.email);
    const password = assertNonEmptyString(req.body?.password, 'password');

    const result = await loginProfessor(email, password);
    if (!result) {
      return res.status(401).json({ status: 401, message: 'Email ou senha inválidos' });
    }
    if (result.error) {
      return res.status(403).json({ status: 403, message: result.error });
    }

    const token = signProfessorToken(result);
    res.json({ status: 200, token });
  })
);

router.post(
  '/professor/set-password',
  authLimiter,
  asyncHandler(async (req, res) => {
    const token = assertNonEmptyString(req.body?.token, 'token');
    const name = assertNonEmptyString(req.body?.name, 'name');
    const password = assertPassword(req.body?.password);

    const prof = await findProfessorByResetToken(token);
    if (!prof) {
      return res.status(400).json({ status: 400, message: 'Token inválido ou expirado' });
    }

    await activateProfessor(prof.id, name, password);
    res.json({ status: 200, message: 'Senha definida com sucesso. Você já pode fazer login.' });
  })
);

router.post(
  '/professor/createturma',
  authenticateToken,
  asyncHandler(async (req, res) => {
    if (req.user?.role !== 'professor') {
      return res.status(403).json({ status: 403, message: 'Acesso restrito a professores' });
    }

    const nome = assertNonEmptyString(req.body?.nome, 'nome');
    const turma = await createTurma(nome, req.user.id);
    res.status(201).json({ status: 201, turma });
  })
);

router.get(
  '/professor/turmas',
  authenticateToken,
  asyncHandler(async (req, res) => {
    if (req.user?.role !== 'professor') {
      return res.status(403).json({ status: 403, message: 'Acesso restrito a professores' });
    }

    const turmas = await listTurmasByProfessor(req.user.id);
    res.json({ status: 200, turmas });
  })
);

router.post(
  '/admin/createprofessor',
  authenticateToken,
  asyncHandler(async (req, res) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ status: 403, message: 'Acesso restrito a administradores' });
    }

    const email = assertEmail(req.body?.email);

    if (await professorEmailTaken(email)) {
      const err = new Error('Email já cadastrado');
      err.status = 409;
      throw err;
    }

    const { token } = await inviteProfessor(email);
    await sendPasswordSetupEmail(email, token);
    res.status(201).json({ status: 201, message: 'Professor convidado com sucesso. E-mail enviado.' });
  })
);

router.get(
  '/admins',
  authenticateToken,
  asyncHandler(async (req, res) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ status: 403, message: 'Acesso restrito a administradores' });
    }

    const { id } = req.query;
    const admins = await getAdmins(id);
    res.json({ status: 200, admins });
  })
);

router.put(
  '/admins/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ status: 403, message: 'Acesso restrito a administradores' });
    }

    const { id } = req.params;
    const name = assertNonEmptyString(req.body?.name, 'name');
    const email = assertEmail(req.body?.email);
    const password = assertPassword(req.body?.password);

    await updateAdmin({ name, email, password }, id);
    res.json({ status: 200, message: 'Admin atualizado com sucesso' });
  })
);

router.patch(
  '/admins/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ status: 403, message: 'Acesso restrito a administradores' });
    }

    const { id } = req.params;
    const result = await updateAdminPartial(req.body, id);

    if (result?.error) {
      return res.status(400).json({ status: 400, message: result.error });
    }

    res.json({ status: 200, message: 'Admin atualizado com sucesso' });
  })
);

router.delete(
  '/admins/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ status: 403, message: 'Acesso restrito a administradores' });
    }

    const { id } = req.params;
    await deleteAdmin(id);
    res.json({ status: 200, message: 'Admin removido com sucesso' });
  })
);

router.post(
  '/professor/createaluno',
  authenticateToken,
  asyncHandler(async (req, res) => {
    if (req.user?.role !== 'professor') {
      return res.status(403).json({ status: 403, message: 'Acesso restrito a professores' });
    }

    const turma_id = Number(req.body?.turma_id);
    if (!turma_id || isNaN(turma_id)) {
      return res.status(400).json({ status: 400, message: 'turma_id é obrigatório' });
    }

    const owns = await professorOwnsTurma(req.user.id, turma_id);
    if (!owns) {
      return res.status(403).json({ status: 403, message: 'Turma não pertence a este professor' });
    }

    const nome = assertNonEmptyString(req.body?.nome, 'nome');
    const matricula = assertNonEmptyString(req.body?.matricula, 'matricula');
    const nucleo_id = Number(req.body?.nucleo_id);
    const escola_id = Number(req.body?.escola_id);
    const bairro = assertNonEmptyString(req.body?.bairro, 'bairro');

    if (!nucleo_id || isNaN(nucleo_id)) {
      return res.status(400).json({ status: 400, message: 'nucleo_id é obrigatório' });
    }
    if (!escola_id || isNaN(escola_id)) {
      return res.status(400).json({ status: 400, message: 'escola_id é obrigatório' });
    }

    await registerAluno({ nome, matricula, nucleo_id, bairro, escola_id, turma_id });
    res.status(201).json({ status: 201, message: 'Cadastro do aluno registrado com sucesso' });
  })
);

router.patch(
  '/professor/alunos/:id/turma',
  authenticateToken,
  asyncHandler(async (req, res) => {
    if (req.user?.role !== 'professor') {
      return res.status(403).json({ status: 403, message: 'Acesso restrito a professores' });
    }

    const alunoId = Number(req.params.id);
    const turma_id = Number(req.body?.turma_id);

    if (!turma_id || isNaN(turma_id)) {
      return res.status(400).json({ status: 400, message: 'turma_id é obrigatório' });
    }

    const owns = await professorOwnsTurma(req.user.id, turma_id);
    if (!owns) {
      return res.status(403).json({ status: 403, message: 'Turma não pertence a este professor' });
    }

    await updateAlunoTurma(alunoId, turma_id);
    res.json({ status: 200, message: 'Aluno movido para a turma com sucesso' });
  })
);

router.get(
  '/admin/turmas',
  authenticateToken,
  asyncHandler(async (req, res) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ status: 403, message: 'Acesso restrito a administradores' });
    }

    const turmas = await listTurmas();
    res.json({ status: 200, turmas });
  })
);

router.get(
  '/turmas/:id/alunos',
  authenticateToken,
  asyncHandler(async (req, res) => {
    if (req.user?.role !== 'admin' && req.user?.role !== 'professor') {
      return res.status(403).json({ status: 403, message: 'Acesso restrito a administradores e professores' });
    }

    const { id } = req.params;
    const alunos = await getAlunosByTurma(id);
    res.json({ status: 200, alunos });
  })
);

router.post(
  '/aluno/login',
  authLimiter,
  asyncHandler(async (req, res) => {
    const matricula = assertNonEmptyString(req.body?.matricula, 'matricula');

    const aluno = await loginAluno(matricula);
    if (!aluno) {
      return res.status(401).json({ status: 401, message: 'Matrícula inválida' });
    }

    const token = signAlunoToken(aluno);
    res.json({ status: 200, token });
    })
);

async function listAlunosForProfessor(req, res) {
  if (req.user?.role !== 'professor' && req.user?.role !== 'admin') {
    return res.status(403).json({ status: 403, message: 'Acesso restrito a professores e administradores' });
  }

  if (req.user?.role === 'professor') {
    const { turma_id, nucleo_id, escola_id, bairro } = req.query;
    const alunos = await listAlunosWithFilters(req.user.id, { turma_id, nucleo_id, escola_id, bairro });
    return res.json({ status: 200, alunos });
  }

  const rows = await listAlunos();
  res.json({ status: 200, alunos: rows });
}

router.get('/alunos', authenticateToken, asyncHandler(listAlunosForProfessor));

// --- Nucleos (admin gerencia, qualquer autenticado consulta) ---
router.post(
  '/admin/nucleos',
  authenticateToken,
  asyncHandler(async (req, res) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ status: 403, message: 'Acesso restrito a administradores' });
    }
    const nome = assertNonEmptyString(req.body?.nome, 'nome');
    const nucleo = await createNucleo(nome);
    res.status(201).json({ status: 201, nucleo });
  })
);

router.get(
  '/nucleos',
  authenticateToken,
  asyncHandler(async (_req, res) => {
    const nucleos = await listNucleos();
    res.json({ status: 200, nucleos });
  })
);

router.delete(
  '/admin/nucleos/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ status: 403, message: 'Acesso restrito a administradores' });
    }
    await deleteNucleo(req.params.id);
    res.json({ status: 200, message: 'Núcleo removido com sucesso' });
  })
);

// --- Escolas (admin gerencia, qualquer autenticado consulta) ---
router.post(
  '/admin/escolas',
  authenticateToken,
  asyncHandler(async (req, res) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ status: 403, message: 'Acesso restrito a administradores' });
    }
    const nome = assertNonEmptyString(req.body?.nome, 'nome');
    const escola = await createEscola(nome);
    res.status(201).json({ status: 201, escola });
  })
);

router.get(
  '/escolas',
  authenticateToken,
  asyncHandler(async (_req, res) => {
    const escolas = await listEscolas();
    res.json({ status: 200, escolas });
  })
);

router.delete(
  '/admin/escolas/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ status: 403, message: 'Acesso restrito a administradores' });
    }
    await deleteEscola(req.params.id);
    res.json({ status: 200, message: 'Escola removida com sucesso' });
  })
);

export default router;
