import * as inviteService from '../services/inviteService.js';
import * as adminRepo from '../repositories/adminRepository.js';
import * as professorRepo from '../repositories/professorRepository.js';
import { assertEmail } from '../utils/validation.js';

export async function sendInvite(req, res) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ status: 403, message: 'Acesso restrito a administradores' });
  }

  const email = assertEmail(req.body?.email);
  const role = req.body?.role;

  if (role !== 'professor' && role !== 'admin') {
    return res.status(400).json({ status: 400, message: 'role deve ser "professor" ou "admin"' });
  }

  const result = await inviteService.sendInvite(email, role);
  if (result.error) {
    const err = new Error(result.error);
    err.status = 409;
    throw err;
  }

  res.status(201).json({ status: 201, message: 'Convite enviado com sucesso.' });
}

export async function listAll(req, res) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ status: 403, message: 'Acesso restrito a administradores' });
  }
  const invites = await inviteService.getAll();
  res.json({ status: 200, invites });
}

export async function listTeam(req, res) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ status: 403, message: 'Acesso restrito a administradores' });
  }
  const profs = await professorRepo.findAllWithStatus();
  const admins = await adminRepo.findAllWithStatus();
  res.json({ status: 200, members: [...profs, ...admins] });
}
