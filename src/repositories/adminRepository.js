import pool from '../configDB.js';

// ── Criação / migrações ──────────────────────────────────────────────────────

export async function createTable() {
  await pool.query(`CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expires DATETIME,
    ativo BOOLEAN NOT NULL DEFAULT FALSE
  )`);
  await pool.query('ALTER TABLE admins MODIFY COLUMN name VARCHAR(150)');
  await pool.query('ALTER TABLE admins MODIFY COLUMN password VARCHAR(255)');
  const [rtCols] = await pool.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'admins' AND COLUMN_NAME = 'reset_token'`
  );
  if (rtCols.length === 0) {
    await pool.query('ALTER TABLE admins ADD COLUMN reset_token VARCHAR(255) AFTER password');
  }
  const [rteCols] = await pool.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'admins' AND COLUMN_NAME = 'reset_token_expires'`
  );
  if (rteCols.length === 0) {
    await pool.query('ALTER TABLE admins ADD COLUMN reset_token_expires DATETIME AFTER reset_token');
  }
  const [ativoCols] = await pool.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'admins' AND COLUMN_NAME = 'ativo'`
  );
  if (ativoCols.length === 0) {
    await pool.query('ALTER TABLE admins ADD COLUMN ativo BOOLEAN NOT NULL DEFAULT FALSE AFTER reset_token_expires');
    await pool.query('UPDATE admins SET ativo = TRUE WHERE password IS NOT NULL');
  }
}

// ── Queries ──────────────────────────────────────────────────────────────────

export async function findByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM admins WHERE email = ?', [email]);
  return rows[0] ?? null;
}

export async function emailTaken(email) {
  const [rows] = await pool.query('SELECT 1 AS x FROM admins WHERE email = ?', [email]);
  return rows[0] ?? null;
}

export async function create({ name, email, passwordHash, ativo = true }) {
  const [result] = await pool.query(
    'INSERT INTO admins (name, email, password, ativo) VALUES (?, ?, ?, ?)',
    [name, email, passwordHash, ativo]
  );
  return result;
}

export async function createInvite(email, token, expires) {
  const [result] = await pool.query(
    'INSERT INTO admins (name, email, reset_token, reset_token_expires, ativo) VALUES (NULL, ?, ?, ?, FALSE)',
    [email, token, expires]
  );
  return { id: result.insertId, token };
}

export async function findByResetToken(token) {
  const [rows] = await pool.query(
    'SELECT id, email FROM admins WHERE reset_token = ? AND reset_token_expires > UTC_TIMESTAMP()',
    [token]
  );
  return rows[0] ?? null;
}

export async function activate(id, name, passwordHash) {
  await pool.query(
    'UPDATE admins SET name = ?, password = ?, reset_token = NULL, reset_token_expires = NULL, ativo = TRUE WHERE id = ?',
    [name, passwordHash, id]
  );
}

export async function findActiveByEmail(email) {
  const [rows] = await pool.query('SELECT id FROM admins WHERE email = ? AND ativo = TRUE', [email]);
  return rows[0] ?? null;
}

export async function setResetToken(id, token, expires) {
  await pool.query(
    'UPDATE admins SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
    [token, expires, id]
  );
}

export async function findByResetTokenForReset(token) {
  const [rows] = await pool.query(
    'SELECT id FROM admins WHERE reset_token = ? AND reset_token_expires > UTC_TIMESTAMP()',
    [token]
  );
  return rows[0] ?? null;
}

export async function updatePassword(id, passwordHash) {
  await pool.query(
    'UPDATE admins SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
    [passwordHash, id]
  );
}

export async function findAll(id) {
  if (id != null && String(id).trim() !== '') {
    const [rows] = await pool.query('SELECT id, name, email FROM admins WHERE id = ?', [id]);
    return rows.length ? [rows[0]] : [];
  }
  const [rows] = await pool.query('SELECT id, name, email FROM admins ORDER BY id');
  return rows;
}

export async function findAllWithStatus() {
  const [rows] = await pool.query(
    `SELECT id, COALESCE(name, email) AS name, email, ativo, 'admin' AS role FROM admins ORDER BY id`
  );
  return rows;
}

export async function update(id, { name, email, passwordHash }) {
  const [result] = await pool.query(
    'UPDATE admins SET name = ?, email = ?, password = ? WHERE id = ?',
    [name, email, passwordHash, id]
  );
  return result;
}

export async function updatePartial(id, updates, values) {
  values.push(id);
  const sql = `UPDATE admins SET ${updates.join(', ')} WHERE id = ?`;
  const [result] = await pool.query(sql, values);
  return result;
}

export async function remove(id) {
  const [result] = await pool.query('DELETE FROM admins WHERE id = ?', [id]);
  return result;
}
