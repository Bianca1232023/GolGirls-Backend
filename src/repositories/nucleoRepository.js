import pool from '../configDB.js';

export async function createTable() {
  await pool.query(`CREATE TABLE IF NOT EXISTS nucleos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL UNIQUE
  )`);
}

export async function create(nome) {
  const [result] = await pool.query('INSERT INTO nucleos (nome) VALUES (?)', [nome]);
  return { id: result.insertId, nome };
}

export async function findAll() {
  const [rows] = await pool.query('SELECT id, nome FROM nucleos ORDER BY nome');
  return rows;
}

export async function remove(id) {
  const [result] = await pool.query('DELETE FROM nucleos WHERE id = ?', [id]);
  return result;
}
