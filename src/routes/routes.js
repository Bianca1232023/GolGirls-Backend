import express from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import authenticateToken from '../middleware/auth.js';
import {
  registerAdmin,
  loginAdmin,
  registerProfessor,
  getAdmins,
  updateAdmin,
  updateAdminPartial,
  deleteAdmin,
  adminEmailTaken,
  professorEmailTaken,
  loginProfessor,
  registerParticipant,
  listParticipants,
} from '../controller/users.js';
import { assertEmail, assertNonEmptyString, assertPassword } from '../utils/validation.js';

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

router.post(
  '/register',
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
  '/login',
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

    const prof = await loginProfessor(email, password);
    if (!prof) {
      return res.status(401).json({ status: 401, message: 'Email ou senha inválidos' });
    }

    const token = signProfessorToken(prof);
    res.json({ status: 200, token });
  })
);

router.post(
  '/admin/createprofessor',
  authenticateToken,
  asyncHandler(async (req, res) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ status: 403, message: 'Acesso restrito a administradores' });
    }

    const name = assertNonEmptyString(req.body?.name, 'name');
    const email = assertEmail(req.body?.email);
    const password = assertPassword(req.body?.password);

    if (await professorEmailTaken(email)) {
      const err = new Error('Email já cadastrado');
      err.status = 409;
      throw err;
    }

    await registerProfessor({ name, email, password });
    res.json({ status: 200, message: 'Professor criado com sucesso' });
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
  '/participants/register',
  authLimiter,
  asyncHandler(async (req, res) => {
    const matricula = assertNonEmptyString(req.body?.matricula, 'matricula');
    const nucleo = assertNonEmptyString(req.body?.nucleo, 'nucleo');
    const funcao = req.body?.funcao ?? req.body?.função;
    assertNonEmptyString(funcao, 'funcao ou função');

    await registerParticipant({ matricula, nucleo, funcao });
    res.status(201).json({ status: 201, message: 'Cadastro registrado com sucesso' });
  })
);

async function listParticipantsForAdmin(req, res) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ status: 403, message: 'Acesso restrito a administradores' });
  }

  const rows = await listParticipants();
  res.json({ status: 200, participants: rows, users: rows });
}

router.get('/participants', authenticateToken, asyncHandler(listParticipantsForAdmin));

router.get('/users', authenticateToken, asyncHandler(listParticipantsForAdmin));

export default router;
