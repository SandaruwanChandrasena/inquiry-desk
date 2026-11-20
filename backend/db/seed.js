import 'dotenv/config';
import bcrypt from 'bcrypt';
import pool from '../src/db.js';

const PASSWORD = 'Password123!';

const users = [
  { name: 'Alice Staff', email: 'alice@example.com', role: 'staff' },
  { name: 'Bob Staff', email: 'bob@example.com', role: 'staff' },
  { name: 'Admin User', email: 'admin@example.com', role: 'admin' },
];

async function seed() {
  for (const user of users) {
    const passwordHash = await bcrypt.hash(PASSWORD, 10);

    // ON CONFLICT: skip if this email already exists
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING`,
      [user.name, user.email, passwordHash, user.role]
    );

    if (result.rowCount === 1) {
      console.log(`Created ${user.email} (${user.role})`);
    } else {
      console.log(`Skipped ${user.email} (already exists)`);
    }
  }

  console.log(`Seed done. Password for all users: ${PASSWORD}`);
}

seed()
  .catch((err) => {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());