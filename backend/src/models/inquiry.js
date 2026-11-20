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