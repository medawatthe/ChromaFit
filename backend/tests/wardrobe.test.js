// tests/wardrobe.test.js
// Covers FR-04 to FR-08, FR-24 and NFR-12.

const path = require('path');
const fs = require('fs');
const request = require('supertest');
const { pool, resetSchema } = require('./setup');
const app = require('../src/app');

let token;
let otherToken;
let outfitId;

// A tiny valid PNG, written to disk so multer has a real file to accept
const fixturePath = path.resolve(__dirname, 'fixture.png');
const PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

beforeAll(async () => {
  await resetSchema();
  fs.writeFileSync(fixturePath, Buffer.from(PNG_BASE64, 'base64'));

  const reg = await request(app).post('/api/auth/register').send({
    firstName: 'Wardrobe',
    lastName: 'Owner',
    username: 'owner',
    email: 'owner@example.com',
    password: 'Password123',
    confirmPassword: 'Password123',
  });
  token = reg.body.token;

  const other = await request(app).post('/api/auth/register').send({
    firstName: 'Other',
    lastName: 'Person',
    username: 'intruder',
    email: 'intruder@example.com',
    password: 'Password123',
    confirmPassword: 'Password123',
  });
  otherToken = other.body.token;
});

afterAll(async () => {
  if (fs.existsSync(fixturePath)) fs.unlinkSync(fixturePath);
  await pool.end();
});

describe('Wardrobe CRUD', () => {
  // TC-15 — FR-04
  test('creates a garment with an image and attributes', async () => {
    const res = await request(app)
      .post('/api/outfits')
      .set('Authorization', `Bearer ${token}`)
      .field('clothingName', 'Blue Denim Jacket')
      .field('category', 'Outerwear')
      .field('color', 'Blue')
      .field('season', 'Winter')
      .field('occasion', 'Casual')
      .attach('image', fixturePath);

    expect(res.status).toBe(201);
    expect(res.body.outfit.clothing_name).toBe('Blue Denim Jacket');
    outfitId = res.body.outfit.id;
  });

  // TC-16 — image is mandatory
  test('rejects a garment submitted without an image', async () => {
    const res = await request(app)
      .post('/api/outfits')
      .set('Authorization', `Bearer ${token}`)
      .field('clothingName', 'No Image Item');

    expect(res.status).toBe(400);
  });

  // TC-17 — FR-05
  test('lists only the requesting user\'s garments', async () => {
    const res = await request(app)
      .get('/api/outfits')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.outfits)).toBe(true);
    expect(res.body.outfits.length).toBe(1);
  });

  // TC-18 — data isolation between accounts
  test('does not expose another user\'s garments', async () => {
    const res = await request(app)
      .get('/api/outfits')
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.status).toBe(200);
    expect(res.body.outfits.length).toBe(0);
  });

  // TC-19 — a user must not read another user's garment by id
  test('returns 404 when fetching a garment owned by someone else', async () => {
    const res = await request(app)
      .get(`/api/outfits/${outfitId}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.status).toBe(404);
  });

  // TC-20 — FR-05 update
  test('updates a garment', async () => {
    const res = await request(app)
      .put(`/api/outfits/${outfitId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ clothingName: 'Renamed Jacket' });

    expect(res.status).toBe(200);
    expect(res.body.outfit.clothing_name).toBe('Renamed Jacket');
  });

  // TC-21
  test('returns 404 for a garment that does not exist', async () => {
    const res = await request(app)
      .get('/api/outfits/999999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

describe('Wear tracking and analytics', () => {
  // TC-22 — FR-07
  test('records a wear event against a garment', async () => {
    const res = await request(app)
      .post(`/api/outfits/${outfitId}/wear`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(201);
  });

  // TC-23 — FR-08 and FR-24
  test('dashboard reports counts and a sustainability score', async () => {
    const res = await request(app)
      .get('/api/outfits/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.totals.total_items).toBe(1);
    expect(res.body.totals.worn_items).toBe(1);
    // one of one garment worn => 100
    expect(res.body.sustainabilityScore).toBe(100);
  });

  // TC-24 — score reflects unworn items
  test('sustainability score falls when an unworn garment is added', async () => {
    await request(app)
      .post('/api/outfits')
      .set('Authorization', `Bearer ${token}`)
      .field('clothingName', 'Unworn Shirt')
      .field('category', 'Tops')
      .attach('image', fixturePath);

    const res = await request(app)
      .get('/api/outfits/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(res.body.totals.total_items).toBe(2);
    expect(res.body.totals.unused_items).toBe(1);
    expect(res.body.sustainabilityScore).toBe(50);
  });
});

describe('Deletion and referential integrity', () => {
  // TC-25 — FR-05 delete
  test('deletes a garment', async () => {
    const res = await request(app)
      .delete(`/api/outfits/${outfitId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);
  });

  // TC-26 — NFR-12: wear_log rows must cascade with the garment
  test('cascades deletion to dependent wear_log rows', async () => {
    const { rows } = await pool.query(
      'SELECT COUNT(*)::int AS n FROM wear_log WHERE outfit_id = $1',
      [outfitId]
    );

    expect(rows[0].n).toBe(0);
  });
});
