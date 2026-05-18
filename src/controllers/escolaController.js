import * as escolaService from '../services/escolaService.js';
import { assertNonEmptyString } from '../utils/validation.js';

export async function create(req, res) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ status: 403, message: 'Acesso restrito a administradores' });
  }
  const nome = assertNonEmptyString(req.body?.nome, 'nome');
  const endereco = req.body?.endereco ? String(req.body.endereco) : undefined;
  const escola = await escolaService.create(nome, endereco);
  res.status(201).json({ status: 201, escola });
}

export async function listAll(_req, res) {
  const escolas = await escolaService.getAll();
  res.json({ status: 200, escolas });
}

export async function remove(req, res) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ status: 403, message: 'Acesso restrito a administradores' });
  }
  await escolaService.remove(req.params.id);
  res.json({ status: 200, message: 'Escola removida com sucesso' });
}
