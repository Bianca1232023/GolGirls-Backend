import * as nucleoService from '../services/nucleoService.js';
import { assertNonEmptyString } from '../utils/validation.js';

export async function create(req, res) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ status: 403, message: 'Acesso restrito a administradores' });
  }
  const nome = assertNonEmptyString(req.body?.nome, 'nome');
  const localizacao = req.body?.localizacao ? String(req.body.localizacao) : undefined;
  const nucleo = await nucleoService.create(nome, localizacao);
  res.status(201).json({ status: 201, nucleo });
}

export async function listAll(_req, res) {
  const nucleos = await nucleoService.getAll();
  res.json({ status: 200, nucleos });
}

export async function remove(req, res) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ status: 403, message: 'Acesso restrito a administradores' });
  }
  await nucleoService.remove(req.params.id);
  res.json({ status: 200, message: 'Núcleo removido com sucesso' });
}
