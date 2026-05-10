import pool from '../configDB.js';

export async function createTable() {
  await pool.query(`CREATE TABLE IF NOT EXISTS turmas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL
  )`);
  const [cols] = await pool.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'turmas' AND COLUMN_NAME = 'professor_id'`
  );
  if (cols.length > 0) {
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
  const [nameCols] = await pool.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'turmas' AND COLUMN_NAME = 'name'`
  );
  if (nameCols.length > 0) {
    await pool.query("ALTER TABLE turmas CHANGE COLUMN `name` `nome` VARCHAR(150) NOT NULL");
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

export async function create(nome) {
  const [result] = await pool.query('INSERT INTO turmas (nome) VALUES (?)', [nome]);
  return { id: result.insertId, nome };
}

export async function linkProfessor(professorId, turmaId) {
  await pool.query(
    'INSERT INTO professor_turmas (professor_id, turma_id) VALUES (?, ?)',
    [professorId, turmaId]
  );
}

export async function findByProfessor(professorId) {
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

export async function findById(id) {
  const [rows] = await pool.query('SELECT id, nome FROM turmas WHERE id = ?', [id]);
  return rows[0] ?? null;
}

export async function findAll() {
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
