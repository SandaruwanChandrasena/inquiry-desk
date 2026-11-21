import pool from '../db.js';

export async function createInquiry(data, userId) {
  const result = await pool.query(
    `INSERT INTO inquiries
       (customer_name, email, phone, subject, description, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $6)
     RETURNING *`,
    [data.customer_name, data.email, data.phone, data.subject, data.description, userId]
  );
  return result.rows[0];
}

// An "open" inquiry is any inquiry that is not resolved yet
export async function findOpenDuplicate(data) {
  const result = await pool.query(
    `SELECT id FROM inquiries
     WHERE status <> 'resolved'
       AND LOWER(subject) = LOWER($1)
       AND (LOWER(email) = LOWER($2) OR phone = $3)
     LIMIT 1`,
    [data.subject, data.email, data.phone]
  );
  return result.rows[0];
}