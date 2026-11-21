// Must be first: app.js does not load .env, only server.js does
import 'dotenv/config';
import request from 'supertest';
import app from '../src/app.js';
import pool from '../src/db.js';

const runId = Date.now();
let count = 0;
const createdIds = [];

let alice;
let bob;

// An agent keeps the login cookie, like a browser
async function loginAs(email) {
  const agent = request.agent(app);
  const res = await agent
    .post('/api/auth/login')
    .send({ email, password: 'Password123!' });
  expect(res.status).toBe(200);
  return agent;
}

async function createTestInquiry(agent) {
  count += 1;
  const res = await agent.post('/api/inquiries').send({
    customer_name: 'Test Customer',
    email: 'test.customer@example.com',
    subject: `Test ${runId}-${count}`,
    description: 'Created by an automated test',
  });
  expect(res.status).toBe(201);
  createdIds.push(res.body.inquiry.id);
  return res.body.inquiry;
}

beforeAll(async () => {
  alice = await loginAs('alice@example.com');
  bob = await loginAs('bob@example.com');
});

// Delete only the inquiries this test run made
afterAll(async () => {
  if (createdIds.length > 0) {
    await pool.query('DELETE FROM inquiries WHERE id = ANY($1)', [createdIds]);
  }
  await pool.end();
});

describe('Access rule', () => {
  test("staff can't open another staff member's inquiry → 404", async () => {
    const inquiry = await createTestInquiry(alice);

    const res = await bob.get(`/api/inquiries/${inquiry.id}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Inquiry not found');
  });

  test("staff can't change another staff member's inquiry → 404", async () => {
    const inquiry = await createTestInquiry(alice);

    const res = await bob
      .patch(`/api/inquiries/${inquiry.id}/status`)
      .send({ status: 'in_progress', version: 1 });

    expect(res.status).toBe(404);
  });
});

describe('Status rules', () => {
  test('New → In Progress works and version goes up', async () => {
    const inquiry = await createTestInquiry(alice);

    const res = await alice
      .patch(`/api/inquiries/${inquiry.id}/status`)
      .send({ status: 'in_progress', version: 1 });

    expect(res.status).toBe(200);
    expect(res.body.inquiry.status).toBe('in_progress');
    expect(res.body.inquiry.version).toBe(2);
  });

  test('New → Resolved is blocked → 422', async () => {
    const inquiry = await createTestInquiry(alice);

    const res = await alice
      .patch(`/api/inquiries/${inquiry.id}/status`)
      .send({ status: 'resolved', version: 1 });

    expect(res.status).toBe(422);
    expect(res.body.error).toBe('Cannot change status from new to resolved');
  });

  test('old version (two tabs) → 409', async () => {
    const inquiry = await createTestInquiry(alice);

    // Tab 1 saves first
    await alice
      .patch(`/api/inquiries/${inquiry.id}/status`)
      .send({ status: 'in_progress', version: 1 })
      .expect(200);

    // Tab 2 still has version 1
    const res = await alice
      .patch(`/api/inquiries/${inquiry.id}/status`)
      .send({ status: 'in_progress', version: 1 });

    expect(res.status).toBe(409);
  });
});

describe('Validation', () => {
  test('no email and no phone → 400 with a contact error', async () => {
    const res = await alice.post('/api/inquiries').send({
      customer_name: 'Test Customer',
      subject: `Test ${runId}-no-contact`,
      description: 'Created by an automated test',
    });

    expect(res.status).toBe(400);
    expect(res.body.fields.contact).toBe('Give an email or a phone number');
  });
});