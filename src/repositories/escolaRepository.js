import pool from '../configDB.js';

export async function createTable() {
  await pool.query(`CREATE TABLE IF NOT EXISTS escolas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE
  )`);
}

export async function create(nome) {
  const [result] = await pool.query('INSERT INTO escolas (nome) VALUES (?)', [nome]);
  return { id: result.insertId, nome };
}

export async function findAll() {
  const [rows] = await pool.query('SELECT id, nome FROM escolas ORDER BY nome');
  return rows;
}

export async function remove(id) {
  const [result] = await pool.query('DELETE FROM escolas WHERE id = ?', [id]);
  return result;
}
