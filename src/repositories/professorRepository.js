import pool from '../configDB.js';

// ── Criação / migrações ──────────────────────────────────────────────────────

export async function createTable() {
  await pool.query(`CREATE TABLE IF NOT EXISTS professors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expires DATETIME,
    ativo BOOLEAN NOT NULL DEFAULT FALSE
  )`);
  await pool.query('ALTER TABLE professors MODIFY COLUMN password VARCHAR(255)');
  await pool.query('ALTER TABLE professors MODIFY COLUMN name VARCHAR(150)');
  const [rtCols] = await pool.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'professors' AND COLUMN_NAME = 'reset_token'`
  );
  if (rtCols.length === 0) {
    await pool.query('ALTER TABLE professors ADD COLUMN reset_token VARCHAR(255) AFTER password');
  }
  const [rteCols] = await pool.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'professors' AND COLUMN_NAME = 'reset_token_expires'`
  );
  if (rteCols.length === 0) {
    await pool.query('ALTER TABLE professors ADD COLUMN reset_token_expires DATETIME AFTER reset_token');
  }
  const [ativoCols] = await pool.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'professors' AND COLUMN_NAME = 'ativo'`
  );
  if (ativoCols.length === 0) {
    await pool.query('ALTER TABLE professors ADD COLUMN ativo BOOLEAN NOT NULL DEFAULT FALSE AFTER reset_token_expires');
    await pool.query('UPDATE professors SET ativo = TRUE WHERE password IS NOT NULL');
  }
  const [cols] = await pool.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'professors' AND COLUMN_NAME = 'turma_id'`
  );
  if (cols.length > 0) {
    const [fks] = await pool.query(
      `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'professors'
       AND COLUMN_NAME = 'turma_id' AND REFERENCED_TABLE_NAME IS NOT NULL`
    );
    if (fks.length > 0) {
      await pool.query(`ALTER TABLE professors DROP FOREIGN KEY \`${fks[0].CONSTRAINT_NAME}\``);
    }
    await pool.query('ALTER TABLE professors DROP COLUMN turma_id');
  }
}

// ── Queries ──────────────────────────────────────────────────────────────────

export async function findByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM professors WHERE email = ?', [email]);
  return rows[0] ?? null;
}

export async function emailTaken(email) {
  const [rows] = await pool.query('SELECT 1 AS x FROM professors WHERE email = ?', [email]);
  return rows[0] ?? null;
}

export async function create({ name, email, passwordHash }) {
  const [result] = await pool.query(
    'INSERT INTO professors (name, email, password) VALUES (?, ?, ?)',
    [name, email, passwordHash]
  );
  return result;
}

export async function createInvite(email, token, expires) {
  const [result] = await pool.query(
    'INSERT INTO professors (name, email, reset_token, reset_token_expires, ativo) VALUES (NULL, ?, ?, ?, FALSE)',
    [email, token, expires]
  );
  return { id: result.insertId, token };
}

export async function findByResetToken(token) {
  const [rows] = await pool.query(
    'SELECT id, email FROM professors WHERE reset_token = ? AND reset_token_expires > UTC_TIMESTAMP()',
    [token]
  );
  return rows[0] ?? null;
}

export async function activate(id, name, passwordHash) {
  await pool.query(
    'UPDATE professors SET name = ?, password = ?, reset_token = NULL, reset_token_expires = NULL, ativo = TRUE WHERE id = ?',
    [name, passwordHash, id]
  );
}

export async function findActiveByEmail(email) {
  const [rows] = await pool.query('SELECT id FROM professors WHERE email = ? AND ativo = TRUE', [email]);
  return rows[0] ?? null;
}

export async function setResetToken(id, token, expires) {
  await pool.query(
    'UPDATE professors SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
    [token, expires, id]
  );
}

export async function findByResetTokenForReset(token) {
  const [rows] = await pool.query(
    'SELECT id FROM professors WHERE reset_token = ? AND reset_token_expires > UTC_TIMESTAMP()',
    [token]
  );
  return rows[0] ?? null;
}

export async function updatePassword(id, passwordHash) {
  await pool.query(
    'UPDATE professors SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
    [passwordHash, id]
  );
}

export async function findById(id) {
  const [rows] = await pool.query('SELECT id, name, email FROM professors WHERE id = ?', [id]);
  return rows[0] ?? null;
}

export async function findAll(id) {
  if (id != null && String(id).trim() !== '') {
    const [rows] = await pool.query(
      `SELECT p.id, p.name, p.email,
              GROUP_CONCAT(t.nome SEPARATOR ', ') AS turmas
       FROM professors p
       LEFT JOIN professor_turmas pt ON p.id = pt.professor_id
       LEFT JOIN turmas t ON pt.turma_id = t.id
       WHERE p.id = ?
       GROUP BY p.id, p.name, p.email`,
      [id]
    );
    return rows;
  }
  const [rows] = await pool.query(
    `SELECT p.id, p.name, p.email,
            GROUP_CONCAT(t.nome SEPARATOR ', ') AS turmas
     FROM professors p
     LEFT JOIN professor_turmas pt ON p.id = pt.professor_id
     LEFT JOIN turmas t ON pt.turma_id = t.id
     GROUP BY p.id, p.name, p.email
     ORDER BY p.id`
  );
  return rows;
}

export async function findAllWithStatus() {
  const [rows] = await pool.query(
    `SELECT id, COALESCE(name, email) AS name, email, ativo, 'professor' AS role FROM professors ORDER BY id`
  );
  return rows;
}

export async function remove(id) {
  const [result] = await pool.query('DELETE FROM professors WHERE id = ?', [id]);
  return result;
}
