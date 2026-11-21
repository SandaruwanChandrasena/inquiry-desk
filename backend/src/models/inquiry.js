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

export async function listInquiries({ userId, role, status, search }) {
  const conditions = [];
  const values = [];

  // Owner rule: staff see only their own inquiries, admin sees all
  if (role !== 'admin') {
    values.push(userId);
    conditions.push(`i.created_by = $${values.length}`);
  }

  if (status) {
    values.push(status);
    conditions.push(`i.status = $${values.length}`);
  }

  if (search) {
    // Escape % and _ so they are searched as normal characters
    values.push(`%${search.replace(/[\\%_]/g, '\\$&')}%`);
    conditions.push(`(i.customer_name ILIKE $${values.length} OR i.subject ILIKE $${values.length})`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await pool.query(
    `SELECT i.id, i.customer_name, i.email, i.phone, i.subject, i.status, i.version,
            i.created_at, i.updated_at, u.name AS updated_by_name
     FROM inquiries i
     JOIN users u ON u.id = i.updated_by
     ${where}
     ORDER BY i.updated_at DESC, i.id DESC`,
    values
  );
  return result.rows;
}