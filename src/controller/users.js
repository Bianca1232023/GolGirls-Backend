import bcrypt from 'bcryptjs';
import { openDb } from '../configdb.js';

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 12;

function stripPassword(row) {
  if (!row) return null;
  const { password: _p, ...rest } = row;
  return rest;
}

async function hashPassword(plain) {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

async function withDb(fn) {
  const db = await openDb();
  return fn(db);
}

export async function createTableAdmin() {
  return withDb((db) =>
    db.exec(`CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )`)
  );
}

export async function createTableProfessor() {
  return withDb((db) =>
    db.exec(`CREATE TABLE IF NOT EXISTS professors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )`)
  );
}

export async function createTableParticipants() {
  return withDb((db) =>
    db.exec(`CREATE TABLE IF NOT EXISTS participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      matricula TEXT NOT NULL,
      nucleo TEXT NOT NULL,
      funcao TEXT NOT NULL
    )`)
  );
}

export async function adminEmailTaken(email) {
  return withDb((db) => db.get('SELECT 1 AS x FROM admins WHERE email = ?', [email]));
}

export async function registerAdmin(admin) {
  const hash = await hashPassword(admin.password);
  return withDb((db) =>
    db.run('INSERT INTO admins (name, email, password) VALUES (?, ?, ?)', [
      admin.name,
      admin.email,
      hash,
    ])
  );
}

export async function loginAdmin(email, password) {
  const row = await withDb((db) => db.get('SELECT * FROM admins WHERE email = ?', [email]));
  if (!row) return null;
  const ok = await verifyPassword(password, row.password);
  return ok ? stripPassword(row) : null;
}

export async function professorEmailTaken(email) {
  return withDb((db) => db.get('SELECT 1 AS x FROM professors WHERE email = ?', [email]));
}

export async function registerProfessor(prof) {
  const hash = await hashPassword(prof.password);
  return withDb((db) =>
    db.run('INSERT INTO professors (name, email, password) VALUES (?, ?, ?)', [
      prof.name,
      prof.email,
      hash,
    ])
  );
}

export async function loginProfessor(email, password) {
  const row = await withDb((db) => db.get('SELECT * FROM professors WHERE email = ?', [email]));
  if (!row) return null;
  const ok = await verifyPassword(password, row.password);
  return ok ? stripPassword(row) : null;
}

export async function getAdmins(id) {
  return withDb(async (db) => {
    if (id != null && String(id).trim() !== '') {
      const row = await db.get('SELECT id, name, email FROM admins WHERE id = ?', [id]);
      return row ? [row] : [];
    }
    return db.all('SELECT id, name, email FROM admins ORDER BY id');
  });
}

export async function updateAdmin(admin, id) {
  const hash = await hashPassword(admin.password);
  return withDb((db) =>
    db.run('UPDATE admins SET name = ?, email = ?, password = ? WHERE id = ?', [
      admin.name,
      admin.email,
      hash,
      id,
    ])
  );
}

export async function updateAdminPartial(body, id) {
  const allowed = ['name', 'email', 'password'];
  const updates = [];
  const values = [];
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(body, key) && body[key] != null) {
      updates.push(`${key} = ?`);
      if (key === 'password') {
        const p = String(body[key]);
        if (p.length < 8) {
          return { error: 'password deve ter no mínimo 8 caracteres' };
        }
        values.push(await hashPassword(p));
      } else {
        values.push(String(body[key]));
      }
    }
  }
  if (updates.length === 0) {
    return { error: 'Nenhum campo válido para atualizar' };
  }
  values.push(id);
  const sql = `UPDATE admins SET ${updates.join(', ')} WHERE id = ?`;
  return withDb((db) => db.run(sql, values));
}

export async function deleteAdmin(id) {
  return withDb((db) => db.run('DELETE FROM admins WHERE id = ?', [id]));
}

export async function registerParticipant(data) {
  const funcao = data.funcao ?? data.função;
  return withDb((db) =>
    db.run('INSERT INTO participants (matricula, nucleo, funcao) VALUES (?, ?, ?)', [
      data.matricula,
      data.nucleo,
      funcao,
    ])
  );
}

export async function listParticipants() {
  return withDb((db) =>
    db.all('SELECT id, matricula, nucleo, funcao FROM participants ORDER BY id')
  );
}
