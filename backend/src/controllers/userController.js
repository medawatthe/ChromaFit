const pool = require('../db/pool');

function sanitizeUser(row) {
  const { password_hash, ...safe } = row;
  return safe;
}

const EDITABLE_FIELDS = {
  firstName: 'first_name',
  lastName: 'last_name',
  mobileNumber: 'mobile_number',
  bio: 'bio',
  heightCm: 'height_cm',
  weightKg: 'weight_kg',
  skinTone: 'skin_tone',
  bodyShape: 'body_shape',
  fashionStylePreference: 'fashion_style_preference',
  favoriteColors: 'favorite_colors',
  leastFavoriteColors: 'least_favorite_colors',
  favoriteBrands: 'favorite_brands',
  country: 'country',
  city: 'city',
  occupation: 'occupation',
  climatePreference: 'climate_preference',
  profilePictureUrl: 'profile_picture_url',
  coverPhotoUrl: 'cover_photo_url',
  language: 'language',
  theme: 'theme',
  fontSize: 'font_size',
};

async function getProfile(req, res) {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    return res.json({ user: sanitizeUser(result.rows[0]) });
  } catch (err) {
    console.error('Get profile error:', err);
    return res.status(500).json({ error: 'Failed to load profile.' });
  }
}

async function updateProfile(req, res) {
  const updates = [];
  const values = [];
  let i = 1;

  for (const [bodyKey, column] of Object.entries(EDITABLE_FIELDS)) {
    if (Object.prototype.hasOwnProperty.call(req.body, bodyKey)) {
      updates.push(`${column} = $${i}`);
      values.push(req.body[bodyKey]);
      i += 1;
    }
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No valid fields provided to update.' });
  }

  updates.push(`updated_at = now()`);
  values.push(req.user.id);

  try {
    const result = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    return res.json({ user: sanitizeUser(result.rows[0]) });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
}

module.exports = { getProfile, updateProfile };
