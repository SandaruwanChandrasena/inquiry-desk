import pool from '../db.js';

export async function findUserByEmail(email) {
  const result = await pool.query(
    'SELECT id, name, email, password_hash, role FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0];
}

export async function findUserById(id) {
  const result = await pool.query(
    'SELECT id, name, email, role FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0];
}