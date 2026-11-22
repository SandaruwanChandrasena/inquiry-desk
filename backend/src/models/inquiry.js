import pool from '../db.js';

// true if the inquiry was ever moved from Resolved back to In Progress (= reopened)
const WAS_REOPENED = `EXISTS (
  SELECT 1 FROM inquiry_history h
  WHERE h.inquiry_id = i.id AND h.from_status = 'resolved' AND h.to_status = 'in_progress'
) AS was_reopened`;

// Runs all queries in one transaction: if one fails, none are saved
async function inTransaction(work) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function addHistory(client, inquiryId, fromStatus, toStatus, userId) {
  await client.query(
    `INSERT INTO inquiry_history (inquiry_id, from_status, to_status, changed_by)
     VALUES ($1, $2, $3, $4)`,
    [inquiryId, fromStatus, toStatus, userId]
  );
}

export async function createInquiry(data, userId) {
  return inTransaction(async (client) => {
    const result = await client.query(
      `INSERT INTO inquiries
         (customer_name, email, phone, subject, description, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $6)
       RETURNING *`,
      [data.customer_name, data.email, data.phone, data.subject, data.description, userId]
    );
    const inquiry = result.rows[0];
    await addHistory(client, inquiry.id, null, 'new', userId);
    return inquiry;
  });
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
            i.created_at, i.updated_at, u.name AS updated_by_name, ${WAS_REOPENED}
     FROM inquiries i
     JOIN users u ON u.id = i.updated_by
     ${where}
     ORDER BY i.updated_at DESC, i.id DESC`,
    values
  );
  return result.rows;
}

// Owner rule again: staff can only load their own inquiry, admin can load any
export async function findInquiryById(id, user) {
  const result = await pool.query(
    `SELECT i.*, c.name AS created_by_name, u.name AS updated_by_name, ${WAS_REOPENED}
     FROM inquiries i
     JOIN users c ON c.id = i.created_by
     JOIN users u ON u.id = i.updated_by
     WHERE i.id = $1
       AND ($2 = 'admin' OR i.created_by = $3)`,
    [id, user.role, user.id]
  );
  const inquiry = result.rows[0];
  if (!inquiry) return undefined;

  const history = await pool.query(
    `SELECT h.id, h.from_status, h.to_status, h.changed_at, u.name AS changed_by_name
     FROM inquiry_history h
     JOIN users u ON u.id = h.changed_by
     WHERE h.inquiry_id = $1
     ORDER BY h.changed_at DESC, h.id DESC`,
    [id]
  );
  inquiry.history = history.rows;
  return inquiry;
}

// Only updates if nobody changed the row since the user loaded it.
// The history row is saved in the same transaction.
export async function updateStatus(id, fromStatus, toStatus, version, userId) {
  return inTransaction(async (client) => {
    const result = await client.query(
      `UPDATE inquiries
       SET status = $2, version = version + 1, updated_by = $4, updated_at = NOW()
       WHERE id = $1 AND version = $3
       RETURNING id`,
      [id, toStatus, version, userId]
    );
    const updated = result.rows[0];
    if (updated) await addHistory(client, id, fromStatus, toStatus, userId);
    return updated;
  });
}