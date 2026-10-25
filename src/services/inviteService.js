import * as inviteRepo from '../repositories/inviteRepository.js';
import * as adminService from './adminService.js';
import * as professorService from './professorService.js';
import { sendAdminSetupEmail, sendPasswordSetupEmail } from '../utils/email.js';

async function removePendingAccount(role, id) {
  try {
    if (role === 'admin') {
      await adminService.remove(id);
    } else {
      await professorService.remove(id);
    }
  } catch (error) {
    console.error('Não foi possível remover a conta pendente após a falha no envio do convite:', error);
  }
}

export async function sendInvite(email, role) {
  if (role === 'admin') {
    const exists = await adminService.emailTaken(email);
    if (exists) return { error: 'Este e-mail já está cadastrado como administrador.' };
    const { id, token } = await adminService.invite(email);
    try {
      await sendAdminSetupEmail(email, token);
    } catch (error) {
      await removePendingAccount(role, id);
      throw error;
    }
  } else {
    const exists = await professorService.emailTaken(email);
    if (exists) return { error: 'Este e-mail já está cadastrado como professor(a).' };
    const { id, token } = await professorService.invite(email);
    try {
      await sendPasswordSetupEmail(email, token);
    } catch (error) {
      await removePendingAccount(role, id);
      throw error;
    }
  }
  await inviteRepo.create(email, role);
  return { ok: true };
}

export async function getAll() {
  return inviteRepo.findAll();
}
