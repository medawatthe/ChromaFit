const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const config = require('../config/env');

const SALT_ROUNDS = 10;

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

function sanitizeUser(row) {
  const { password_hash, ...safe } = row;
  return safe;
}

async function register(req, res) {
  const {
    firstName,
    lastName,
    username,
    email,
    mobileNumber,
    password,
    confirmPassword,
    dateOfBirth,
    gender,
    heightCm,
    weightKg,
    skinTone,
    bodyShape,
    fashionStylePreference,
    favoriteColors,
    leastFavoriteColors,
    country,
    city,
    occupation,
    climatePreference,
  } = req.body;

  if (!firstName || !lastName || !username || !email || !password) {
    return res.status(400).json({ error: 'First name, last name, username, email, and password are required.' });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Password and confirm password do not match.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }

  try {
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email or username is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await pool.query(
      `INSERT INTO users (
        first_name, last_name, username, email, mobile_number, password_hash,
        date_of_birth, gender, height_cm, weight_kg, skin_tone, body_shape,
        fashion_style_preference, favorite_colors, least_favorite_colors,
        country, city, occupation, climate_preference
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19
      ) RETURNING *`,
      [
        firstName,
        lastName,
        username,
        email,
        mobileNumber || null,
        passwordHash,
        dateOfBirth || null,
        gender || null,
        heightCm || null,
        weightKg || null,
        skinTone || null,
        bodyShape || null,
        fashionStylePreference || [],
        favoriteColors || [],
        leastFavoriteColors || [],
        country || null,
        city || null,
        occupation || null,
        climatePreference || null,
      ]
    );

    const user = result.rows[0];
    const token = signToken(user);
    return res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Failed to register user.' });
  }
}

async function login(req, res) {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Email/username and password are required.' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $1',
      [identifier]
    );
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = signToken(user);
    return res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Failed to log in.' });
  }
}

module.exports = { register, login };
