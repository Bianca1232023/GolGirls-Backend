import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import pool from '../configDB.js';

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

export async function createTableAdmin() {
  await pool.query(`CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL
  )`);
}

export async function createTableProfessor() {
  await pool.query(`CREATE TABLE IF NOT EXISTS professors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expires DATETIME,
    ativo BOOLEAN NOT NULL DEFAULT FALSE
  )`);
  // migração: torna password nullable (professores convidados sem senha)
  await pool.query('ALTER TABLE professors MODIFY COLUMN password VARCHAR(255)');
  // migração: torna name nullable (professores que ainda não definiram o nome via convite)
  await pool.query('ALTER TABLE professors MODIFY COLUMN name VARCHAR(150)');
  // migração: adiciona reset_token se não existir
  const [rtCols] = await pool.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'professors' AND COLUMN_NAME = 'reset_token'`
  );
  if (rtCols.length === 0) {
    await pool.query('ALTER TABLE professors ADD COLUMN reset_token VARCHAR(255) AFTER password');
  }
  // migração: adiciona reset_token_expires se não existir
  const [rteCols] = await pool.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'professors' AND COLUMN_NAME = 'reset_token_expires'`
  );
  if (rteCols.length === 0) {
    await pool.query('ALTER TABLE professors ADD COLUMN reset_token_expires DATETIME AFTER reset_token');
  }
  // migração: adiciona ativo se não existir (professores existentes já tinham senha → ativo=true)
  const [ativoCols] = await pool.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'professors' AND COLUMN_NAME = 'ativo'`
  );
  if (ativoCols.length === 0) {
    await pool.query('ALTER TABLE professors ADD COLUMN ativo BOOLEAN NOT NULL DEFAULT FALSE AFTER reset_token_expires');
    await pool.query('UPDATE professors SET ativo = TRUE WHERE password IS NOT NULL');
  }
  // migração: remove turma_id caso a tabela já existisse com essa coluna
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

export async function createTableProfessorTurmas() {
  await pool.query(`CREATE TABLE IF NOT EXISTS professor_turmas (
    professor_id INT NOT NULL,
    turma_id INT NOT NULL,
    PRIMARY KEY (professor_id, turma_id),
    FOREIGN KEY (professor_id) REFERENCES professors(id) ON DELETE CASCADE,
    FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE CASCADE
  )`);
}

export async function createTableTurmas() {
  await pool.query(`CREATE TABLE IF NOT EXISTS turmas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL
  )`);
  // migração: remove professor_id caso a tabela já existisse com a estrutura antiga
  const [cols] = await pool.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'turmas' AND COLUMN_NAME = 'professor_id'`
  );
  if (cols.length > 0) {
    // descobre o nome real da FK antes de tentar remover
    const [fks] = await pool.query(
      `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'turmas'
       AND COLUMN_NAME = 'professor_id' AND REFERENCED_TABLE_NAME IS NOT NULL`
    );
    if (fks.length > 0) {
      await pool.query(`ALTER TABLE turmas DROP FOREIGN KEY \`${fks[0].CONSTRAINT_NAME}\``);
    }
    await pool.query('ALTER TABLE turmas DROP COLUMN professor_id');
  }
  // migração: renomeia coluna 'name' para 'nome' caso exista ainda
  const [nameCols] = await pool.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'turmas' AND COLUMN_NAME = 'name'`
  );
  if (nameCols.length > 0) {
    await pool.query("ALTER TABLE turmas CHANGE COLUMN `name` `nome` VARCHAR(150) NOT NULL");
  }
}

export async function createTableNucleos() {
  await pool.query(`CREATE TABLE IF NOT EXISTS nucleos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL UNIQUE
  )`);
}

export async function createTableEscolas() {
  await pool.query(`CREATE TABLE IF NOT EXISTS escolas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE
  )`);
}

export async function createTableAlunos() {
  await pool.query(`CREATE TABLE IF NOT EXISTS alunos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    matricula VARCHAR(100) NOT NULL,
    nucleo_id INT NOT NULL,
    idade TINYINT UNSIGNED,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    dia_aula VARCHAR(50),
    bairro VARCHAR(150) NOT NULL,
    turma_id INT NOT NULL,
    escola_id INT NOT NULL,
    FOREIGN KEY (turma_id) REFERENCES turmas(id),
    FOREIGN KEY (nucleo_id) REFERENCES nucleos(id),
    FOREIGN KEY (escola_id) REFERENCES escolas(id)
  )`);
  // migração: adiciona coluna nome caso não exista
  const [nomeCols] = await pool.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'alunos' AND COLUMN_NAME = 'nome'`
  );
  if (nomeCols.length === 0) {
    await pool.query('ALTER TABLE alunos ADD COLUMN nome VARCHAR(150) NOT NULL AFTER id');
  }
  // migração: torna idade e dia_aula nullable
  await pool.query('ALTER TABLE alunos MODIFY COLUMN idade TINYINT UNSIGNED');
  await pool.query('ALTER TABLE alunos MODIFY COLUMN dia_aula VARCHAR(50)');
  // migração: substitui coluna nucleo VARCHAR por nucleo_id FK
  const [nucolCols] = await pool.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'alunos' AND COLUMN_NAME = 'nucleo'`
  );
  if (nucolCols.length > 0) {
    await pool.query('ALTER TABLE alunos DROP COLUMN nucleo');
  }
  const [nucleoIdCols] = await pool.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'alunos' AND COLUMN_NAME = 'nucleo_id'`
  );
  if (nucleoIdCols.length === 0) {
    await pool.query('ALTER TABLE alunos ADD COLUMN nucleo_id INT NOT NULL AFTER matricula, ADD FOREIGN KEY (nucleo_id) REFERENCES nucleos(id)');
  }
  // migração: substitui coluna escola VARCHAR por escola_id FK
  const [escolaCols] = await pool.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'alunos' AND COLUMN_NAME = 'escola'`
  );
  if (escolaCols.length > 0) {
    await pool.query('ALTER TABLE alunos DROP COLUMN escola');
  }
  const [escolaIdCols] = await pool.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'alunos' AND COLUMN_NAME = 'escola_id'`
  );
  if (escolaIdCols.length === 0) {
    await pool.query('ALTER TABLE alunos ADD COLUMN escola_id INT NOT NULL AFTER turma_id, ADD FOREIGN KEY (escola_id) REFERENCES escolas(id)');
  }
}

export async function adminEmailTaken(email) {
  const [rows] = await pool.query('SELECT 1 AS x FROM admins WHERE email = ?', [email]);
  return rows[0] ?? null;
}

export async function registerAdmin(admin) {
  const hash = await hashPassword(admin.password);
  const [result] = await pool.query(
    'INSERT INTO admins (name, email, password) VALUES (?, ?, ?)',
    [admin.name, admin.email, hash]
  );
  return result;
}

export async function loginAdmin(email, password) {
  const [rows] = await pool.query('SELECT * FROM admins WHERE email = ?', [email]);
  const row = rows[0] ?? null;
  if (!row) return null;
  const ok = await verifyPassword(password, row.password);
  return ok ? stripPassword(row) : null;
}

export async function professorEmailTaken(email) {
  const [rows] = await pool.query('SELECT 1 AS x FROM professors WHERE email = ?', [email]);
  return rows[0] ?? null;
}

export async function registerProfessor(prof) {
  const hash = await hashPassword(prof.password);
  const [result] = await pool.query(
    'INSERT INTO professors (name, email, password) VALUES (?, ?, ?)',
    [prof.name, prof.email, hash]
  );
  return result;
}

export async function loginProfessor(email, password) {
  const [rows] = await pool.query('SELECT * FROM professors WHERE email = ?', [email]);
  const row = rows[0] ?? null;
  if (!row) return null;
  if (!row.ativo) return { error: 'Conta ainda não ativada. Verifique seu e-mail para definir sua senha.' };
  const ok = await verifyPassword(password, row.password);
  return ok ? stripPassword(row) : null;
}

export async function inviteProfessor(email) {
  const token = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
  const [result] = await pool.query(
    'INSERT INTO professors (name, email, reset_token, reset_token_expires, ativo) VALUES (NULL, ?, ?, ?, FALSE)',
    [email, token, expires]
  );
  return { id: result.insertId, token };
}

export async function findProfessorByResetToken(token) {
  const [rows] = await pool.query(
    'SELECT id, email FROM professors WHERE reset_token = ? AND reset_token_expires > UTC_TIMESTAMP()',
    [token]
  );
  return rows[0] ?? null;
}

export async function activateProfessor(professorId, name, plainPassword) {
  const hash = await hashPassword(plainPassword);
  await pool.query(
    'UPDATE professors SET name = ?, password = ?, reset_token = NULL, reset_token_expires = NULL, ativo = TRUE WHERE id = ?',
    [name, hash, professorId]
  );
}

export async function getAdmins(id) {
  if (id != null && String(id).trim() !== '') {
    const [rows] = await pool.query('SELECT id, name, email FROM admins WHERE id = ?', [id]);
    return rows.length ? [rows[0]] : [];
  }
  const [rows] = await pool.query('SELECT id, name, email FROM admins ORDER BY id');
  return rows;
}

export async function getProfessors(id) {
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

export async function getProfessorById(id) {
  const [rows] = await pool.query(
    'SELECT id, name, email FROM professors WHERE id = ?',
    [id]
  );
  return rows[0] ?? null;
}

export async function updateAdmin(admin, id) {
  const hash = await hashPassword(admin.password);
  const [result] = await pool.query(
    'UPDATE admins SET name = ?, email = ?, password = ? WHERE id = ?',
    [admin.name, admin.email, hash, id]
  );
  return result;
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
  const [result] = await pool.query(sql, values);
  return result;
}

export async function deleteAdmin(id) {
  const [result] = await pool.query('DELETE FROM admins WHERE id = ?', [id]);
  return result;
}

export async function createTurma(nome, professorId) {
  const [result] = await pool.query(
    'INSERT INTO turmas (nome) VALUES (?)',
    [nome]
  );
  const turmaId = result.insertId;
  if (professorId != null) {
    await pool.query(
      'INSERT INTO professor_turmas (professor_id, turma_id) VALUES (?, ?)',
      [professorId, turmaId]
    );
  }
  return { id: turmaId, nome };
}

export async function listTurmasByProfessor(professorId) {
  const [rows] = await pool.query(
    `SELECT t.id, t.nome
     FROM turmas t
     INNER JOIN professor_turmas pt ON t.id = pt.turma_id
     WHERE pt.professor_id = ?
     ORDER BY t.id`,
    [professorId]
  );
  return rows;
}

export async function professorOwnsTurma(professorId, turmaId) {
  const [rows] = await pool.query(
    'SELECT 1 FROM professor_turmas WHERE professor_id = ? AND turma_id = ?',
    [professorId, turmaId]
  );
  return rows.length > 0;
}

export async function getTurmaById(id) {
  const [rows] = await pool.query('SELECT id, nome FROM turmas WHERE id = ?', [id]);
  return rows[0] ?? null;
}

export async function listTurmas() {
  const [rows] = await pool.query(
    `SELECT t.id, t.nome, GROUP_CONCAT(p.name SEPARATOR ', ') AS professores
     FROM turmas t
     LEFT JOIN professor_turmas pt ON t.id = pt.turma_id
     LEFT JOIN professors p ON pt.professor_id = p.id
     GROUP BY t.id, t.nome
     ORDER BY t.id`
  );
  return rows;
}

export async function getAlunosByTurma(turmaId) {
  const [rows] = await pool.query(
    `SELECT a.id, a.nome, a.matricula, a.idade, a.ativo, a.dia_aula, a.bairro,
            n.id AS nucleo_id, n.nome AS nucleo,
            e.id AS escola_id, e.nome AS escola,
            t.id AS turma_id, t.nome AS turma_nome
     FROM alunos a
     JOIN nucleos n ON a.nucleo_id = n.id
     JOIN escolas e ON a.escola_id = e.id
     JOIN turmas t ON a.turma_id = t.id
     WHERE a.turma_id = ?
     ORDER BY a.id`,
    [turmaId]
  );
  return rows;
}

export async function listAlunosWithFilters(professorId, filters = {}) {
  const conditions = [];
  const values = [];

  // restringe às turmas do professor
  conditions.push(
    `a.turma_id IN (
      SELECT turma_id FROM professor_turmas WHERE professor_id = ?
    )`
  );
  values.push(professorId);

  if (filters.turma_id) {
    conditions.push('a.turma_id = ?');
    values.push(Number(filters.turma_id));
  }
  if (filters.nucleo_id) {
    conditions.push('a.nucleo_id = ?');
    values.push(Number(filters.nucleo_id));
  }
  if (filters.escola_id) {
    conditions.push('a.escola_id = ?');
    values.push(Number(filters.escola_id));
  }
  if (filters.bairro) {
    conditions.push('a.bairro LIKE ?');
    values.push(`%${filters.bairro}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await pool.query(
    `SELECT a.id, a.nome, a.matricula, a.idade, a.ativo, a.dia_aula, a.bairro,
            n.id AS nucleo_id, n.nome AS nucleo,
            e.id AS escola_id, e.nome AS escola,
            t.id AS turma_id, t.nome AS turma_nome
     FROM alunos a
     JOIN nucleos n ON a.nucleo_id = n.id
     JOIN escolas e ON a.escola_id = e.id
     JOIN turmas t ON a.turma_id = t.id
     ${where}
     ORDER BY a.id`,
    values
  );
  return rows;
}

export async function updateAlunoTurma(alunoId, turmaId) {
  const [result] = await pool.query(
    'UPDATE alunos SET turma_id = ? WHERE id = ?',
    [turmaId, alunoId]
  );
  return result;
}

export async function registerAluno(data) {
  const [result] = await pool.query(
    'INSERT INTO alunos (nome, matricula, nucleo_id, idade, ativo, dia_aula, bairro, turma_id, escola_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [data.nome, data.matricula, data.nucleo_id, data.idade, data.ativo ?? true, data.dia_aula, data.bairro, data.turma_id, data.escola_id]
  );
  return result;
}

export async function listAlunos() {
  const [rows] = await pool.query(
    `SELECT a.id, a.nome, a.matricula, a.idade, a.ativo, a.dia_aula, a.bairro,
            n.id AS nucleo_id, n.nome AS nucleo,
            e.id AS escola_id, e.nome AS escola,
            t.id AS turma_id, t.nome AS turma_nome
     FROM alunos a
     JOIN nucleos n ON a.nucleo_id = n.id
     JOIN escolas e ON a.escola_id = e.id
     JOIN turmas t ON a.turma_id = t.id
     ORDER BY a.id`
  );
  return rows;
}

export async function loginAluno(matricula) {
  const [rows] = await pool.query(
    'SELECT id, nome, matricula FROM alunos WHERE matricula = ? LIMIT 1',
    [matricula]
  );
  return rows[0] || null;
}

// --- Nucleos ---
export async function createNucleo(nome) {
  const [result] = await pool.query('INSERT INTO nucleos (nome) VALUES (?)', [nome]);
  return { id: result.insertId, nome };
}

export async function listNucleos() {
  const [rows] = await pool.query('SELECT id, nome FROM nucleos ORDER BY nome');
  return rows;
}

export async function deleteNucleo(id) {
  const [result] = await pool.query('DELETE FROM nucleos WHERE id = ?', [id]);
  return result;
}

// --- Escolas ---
export async function createEscola(nome) {
  const [result] = await pool.query('INSERT INTO escolas (nome) VALUES (?)', [nome]);
  return { id: result.insertId, nome };
}

export async function listEscolas() {
  const [rows] = await pool.query('SELECT id, nome FROM escolas ORDER BY nome');
  return rows;
}

export async function deleteEscola(id) {
  const [result] = await pool.query('DELETE FROM escolas WHERE id = ?', [id]);
  return result;
}

