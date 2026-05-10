import pool from '../configDB.js';

export async function createTable() {
  await pool.query(`CREATE TABLE IF NOT EXISTS invites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    role ENUM('professor','admin') NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
}

export async function create(email, role) {
  const [result] = await pool.query(
    'INSERT INTO invites (email, role) VALUES (?, ?)',
    [email, role]
  );
  return result.insertId;
}

export async function findAll() {
  const [rows] = await pool.query(`
    SELECT
      i.id,
      i.email,
      i.role,
      i.created_at,
      CASE
        WHEN i.role = 'professor' THEN
          IFNULL((SELECT CASE WHEN p.ativo = TRUE THEN 'aceito' ELSE 'pendente' END
                  FROM professors p WHERE p.email = i.email LIMIT 1), 'pendente')
        WHEN i.role = 'admin' THEN
          IFNULL((SELECT CASE WHEN a.ativo = TRUE THEN 'aceito' ELSE 'pendente' END
                  FROM admins a WHERE a.email = i.email LIMIT 1), 'pendente')
        ELSE 'pendente'
      END AS status
    FROM invites i
    ORDER BY i.created_at DESC
  `);
  return rows;
}
