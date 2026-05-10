import pool from '../configDB.js';

export async function createTable() {
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
  const [nomeCols] = await pool.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'alunos' AND COLUMN_NAME = 'nome'`
  );
  if (nomeCols.length === 0) {
    await pool.query('ALTER TABLE alunos ADD COLUMN nome VARCHAR(150) NOT NULL AFTER id');
  }
  await pool.query('ALTER TABLE alunos MODIFY COLUMN idade TINYINT UNSIGNED');
  await pool.query('ALTER TABLE alunos MODIFY COLUMN dia_aula VARCHAR(50)');
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

export async function create(data) {
  const [result] = await pool.query(
    'INSERT INTO alunos (nome, matricula, nucleo_id, idade, ativo, dia_aula, bairro, turma_id, escola_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [data.nome, data.matricula, data.nucleo_id, data.idade, data.ativo ?? true, data.dia_aula, data.bairro, data.turma_id, data.escola_id]
  );
  return result;
}

export async function findByMatricula(matricula) {
  const [rows] = await pool.query(
    'SELECT id, nome, matricula FROM alunos WHERE matricula = ? LIMIT 1',
    [matricula]
  );
  return rows[0] || null;
}

export async function findByTurma(turmaId) {
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

export async function findAll() {
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

export async function findWithFilters(professorId, filters = {}) {
  const conditions = [];
  const values = [];

  conditions.push(
    `a.turma_id IN (SELECT turma_id FROM professor_turmas WHERE professor_id = ?)`
  );
  values.push(professorId);

  if (filters.turma_id) { conditions.push('a.turma_id = ?'); values.push(Number(filters.turma_id)); }
  if (filters.nucleo_id) { conditions.push('a.nucleo_id = ?'); values.push(Number(filters.nucleo_id)); }
  if (filters.escola_id) { conditions.push('a.escola_id = ?'); values.push(Number(filters.escola_id)); }
  if (filters.bairro) { conditions.push('a.bairro LIKE ?'); values.push(`%${filters.bairro}%`); }

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

export async function updateTurma(alunoId, turmaId) {
  const [result] = await pool.query(
    'UPDATE alunos SET turma_id = ? WHERE id = ?',
    [turmaId, alunoId]
  );
  return result;
}
