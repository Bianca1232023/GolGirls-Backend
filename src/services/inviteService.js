import * as inviteRepo from '../repositories/inviteRepository.js';
import * as adminService from './adminService.js';
import * as professorService from './professorService.js';
import { sendAdminSetupEmail, sendPasswordSetupEmail } from '../utils/email.js';

export async function sendInvite(email, role) {
  if (role === 'admin') {
    const exists = await adminService.emailTaken(email);
    if (exists) return { error: 'Este e-mail já está cadastrado como administrador.' };
    const { token } = await adminService.invite(email);
    await sendAdminSetupEmail(email, token);
  } else {
    const exists = await professorService.emailTaken(email);
    if (exists) return { error: 'Este e-mail já está cadastrado como professor(a).' };
    const { token } = await professorService.invite(email);
    await sendPasswordSetupEmail(email, token);
  }
  await inviteRepo.create(email, role);
  return { ok: true };
}

export async function getAll() {
  return inviteRepo.findAll();
}
