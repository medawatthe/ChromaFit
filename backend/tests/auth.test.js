// tests/auth.test.js
// Covers FR-01, FR-02 and NFR-01, NFR-02, NFR-03.

const request = require('supertest');
const { pool, resetSchema } = require('./setup');
const app = require('../src/app');

const validUser = {
  firstName: 'Test',
  lastName: 'User',
  username: 'testuser',
  email: 'testuser@example.com',
  password: 'Password123',
  confirmPassword: 'Password123',
};

beforeAll(async () => {
  await resetSchema();
});

afterAll(async () => {
  await pool.end();
});

describe('POST /api/auth/register', () => {
  // TC-01
  test('registers a valid user and returns a token', async () => {
    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.username).toBe('testuser');
  });

  // TC-02 — NFR-01: password must never be returned
  test('never returns the password hash', async () => {
    const res = await request(app).post('/api/auth/register').send({
      ...validUser,
      username: 'testuser2',
      email: 'testuser2@example.com',
    });

    expect(res.status).toBe(201);
    expect(res.body.user.password_hash).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toContain('Password123');
  });

  // TC-03
  test('rejects registration missing required fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ firstName: 'Only', lastName: 'Name' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  // TC-04
  test('rejects mismatched password confirmation', async () => {
    const res = await request(app).post('/api/auth/register').send({
      ...validUser,
      username: 'mismatch',
      email: 'mismatch@example.com',
      confirmPassword: 'DifferentPass1',
    });

    expect(res.status).toBe(400);
  });

  // TC-05
  test('rejects a password shorter than eight characters', async () => {
    const res = await request(app).post('/api/auth/register').send({
      ...validUser,
      username: 'shortpw',
      email: 'shortpw@example.com',
      password: 'Pass1',
      confirmPassword: 'Pass1',
    });

    expect(res.status).toBe(400);
  });

  // TC-06 — uniqueness constraint
  test('rejects a duplicate email address', async () => {
    const res = await request(app).post('/api/auth/register').send({
      ...validUser,
      username: 'differentname',
    });

    expect(res.status).toBe(409);
  });
});

describe('POST /api/auth/login', () => {
  // TC-07
  test('authenticates with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: validUser.email, password: validUser.password });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  // TC-08
  test('rejects an incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: validUser.email, password: 'WrongPassword1' });

    expect(res.status).toBe(401);
  });

  // TC-09
  test('rejects an unknown account', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'nobody@example.com', password: 'Password123' });

    expect(res.status).toBe(401);
  });

  // TC-10
  test('rejects a request with no credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
  });
});

describe('Authorisation middleware', () => {
  // TC-11 — NFR-03
  test('rejects a protected route with no token', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
  });

  // TC-12
  test('rejects a malformed bearer token', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', 'Bearer not-a-real-token');

    expect(res.status).toBe(401);
  });

  // TC-13
  test('accepts a valid token', async () => {
    const login = await request(app)
      .post('/api/auth/login')
      .send({ identifier: validUser.email, password: validUser.password });

    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${login.body.token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(validUser.email);
  });

  // TC-14 — role check: a standard user must not reach admin routes
  test('rejects a non-admin user on an admin route', async () => {
    const login = await request(app)
      .post('/api/auth/login')
      .send({ identifier: validUser.email, password: validUser.password });

    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${login.body.token}`);

    expect(res.status).toBe(403);
  });
});
