// Must be first: app.js does not load .env, only server.js does
import 'dotenv/config';
import request from 'supertest';
import app from '../src/app.js';
import pool from '../src/db.js';

afterAll(async () => {
  await pool.end();
});

describe('Auth', () => {
  test('no login → 401 on a protected route', async () => {
    const res = await request(app).get('/api/inquiries');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Not logged in');
  });

  test('wrong password → 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@example.com', password: 'wrong-password' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid email or password');
    expect(res.headers['set-cookie']).toBeUndefined();
  });

  test('email or password not text → 400, not a crash', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 123, password: 'Password123!' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Email and password are required');
  });

  test('correct login → 200 and an httpOnly token cookie', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@example.com', password: 'Password123!' });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('alice@example.com');
    expect(res.body.user.password_hash).toBeUndefined();

    const cookie = res.headers['set-cookie'][0];
    expect(cookie).toMatch(/^token=/);
    expect(cookie).toMatch(/HttpOnly/);
  });
});