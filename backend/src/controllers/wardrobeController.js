const pool = require('../db/pool');

const EDITABLE_FIELDS = {
  clothingName: 'clothing_name',
  category: 'category',
  brand: 'brand',
  color: 'color',
  secondaryColor: 'secondary_color',
  pattern: 'pattern',
  material: 'material',
  sleeveType: 'sleeve_type',
  neckType: 'neck_type',
  fitType: 'fit_type',
  season: 'season',
  occasion: 'occasion',
  purchaseDate: 'purchase_date',
  price: 'price',
  lastWornDate: 'last_worn_date',
  notes: 'notes',
};

async function createOutfit(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'A clothing image is required.' });
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  const b = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO outfits (
        user_id, image_url, clothing_name, category, brand, color, secondary_color,
        pattern, material, sleeve_type, neck_type, fit_type, season, occasion,
        purchase_date, price, last_worn_date, notes
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
      RETURNING *`,
      [
        req.user.id,
        imageUrl,
        b.clothingName || null,
        b.category || null,
        b.brand || null,
        b.color || null,
        b.secondaryColor || null,
        b.pattern || null,
        b.material || null,
        b.sleeveType || null,
        b.neckType || null,
        b.fitType || null,
        b.season || null,
        b.occasion || null,
        b.purchaseDate || null,
        b.price || null,
        b.lastWornDate || null,
        b.notes || null,
      ]
    );
    return res.status(201).json({ outfit: result.rows[0] });
  } catch (err) {
    console.error('Create outfit error:', err);
    return res.status(500).json({ error: 'Failed to save wardrobe item.' });
  }
}

async function listOutfits(req, res) {
  const { category, occasion, season, search } = req.query;
  const conditions = ['user_id = $1'];
  const values = [req.user.id];

  if (category) {
    values.push(category);
    conditions.push(`category = $${values.length}`);
  }
  if (occasion) {
    values.push(occasion);
    conditions.push(`occasion = $${values.length}`);
  }
  if (season) {
    values.push(season);
    conditions.push(`season = $${values.length}`);
  }
  if (search) {
    values.push(`%${search}%`);
    const i = values.length;
    conditions.push(`(clothing_name ILIKE $${i} OR brand ILIKE $${i} OR notes ILIKE $${i})`);
  }

  try {
    const result = await pool.query(
      `SELECT * FROM outfits WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`,
      values
    );
    return res.json({ outfits: result.rows });
  } catch (err) {
    console.error('List outfits error:', err);
    return res.status(500).json({ error: 'Failed to load wardrobe.' });
  }
}

async function getOutfit(req, res) {
  try {
    const result = await pool.query('SELECT * FROM outfits WHERE id = $1 AND user_id = $2', [
      req.params.id,
      req.user.id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Wardrobe item not found.' });
    }
    const analysis = await pool.query(
      'SELECT * FROM ai_analysis WHERE outfit_id = $1 ORDER BY created_at DESC LIMIT 1',
      [req.params.id]
    );
    return res.json({ outfit: result.rows[0], analysis: analysis.rows[0] || null });
  } catch (err) {
    console.error('Get outfit error:', err);
    return res.status(500).json({ error: 'Failed to load wardrobe item.' });
  }
}

async function updateOutfit(req, res) {
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

  if (req.file) {
    updates.push(`image_url = $${i}`);
    values.push(`/uploads/${req.file.filename}`);
    i += 1;
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No valid fields provided to update.' });
  }

  updates.push('updated_at = now()');
  values.push(req.params.id, req.user.id);

  try {
    const result = await pool.query(
      `UPDATE outfits SET ${updates.join(', ')} WHERE id = $${i} AND user_id = $${i + 1} RETURNING *`,
      values
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Wardrobe item not found.' });
    }
    return res.json({ outfit: result.rows[0] });
  } catch (err) {
    console.error('Update outfit error:', err);
    return res.status(500).json({ error: 'Failed to update wardrobe item.' });
  }
}

async function deleteOutfit(req, res) {
  try {
    const result = await pool.query(
      'DELETE FROM outfits WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Wardrobe item not found.' });
    }
    return res.status(204).send();
  } catch (err) {
    console.error('Delete outfit error:', err);
    return res.status(500).json({ error: 'Failed to delete wardrobe item.' });
  }
}

async function logWear(req, res) {
  try {
    const outfitResult = await pool.query('SELECT id FROM outfits WHERE id = $1 AND user_id = $2', [
      req.params.id,
      req.user.id,
    ]);
    if (outfitResult.rows.length === 0) {
      return res.status(404).json({ error: 'Wardrobe item not found.' });
    }

    await pool.query('INSERT INTO wear_log (outfit_id, user_id, worn_on) VALUES ($1, $2, CURRENT_DATE)', [
      req.params.id,
      req.user.id,
    ]);
    const updated = await pool.query(
      'UPDATE outfits SET last_worn_date = CURRENT_DATE, updated_at = now() WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    return res.status(201).json({ outfit: updated.rows[0] });
  } catch (err) {
    console.error('Log wear error:', err);
    return res.status(500).json({ error: 'Failed to log wear.' });
  }
}

async function getDashboardStats(req, res) {
  const userId = req.user.id;

  // Wear count per outfit, derived from wear_log (not just last_worn_date)
  const wearCountsBase = `
    SELECT o.id, o.clothing_name, o.image_url, o.category,
           COALESCE(wc.wear_count, 0)::int AS wear_count
    FROM outfits o
    LEFT JOIN (
      SELECT outfit_id, COUNT(*) AS wear_count FROM wear_log GROUP BY outfit_id
    ) wc ON wc.outfit_id = o.id
    WHERE o.user_id = $1
  `;

  try {
    const totals = await pool.query(
      `SELECT
        COUNT(*)::int AS total_items,
        COUNT(*) FILTER (WHERE wear_count > 0)::int AS worn_items,
        COUNT(*) FILTER (WHERE wear_count = 0)::int AS unused_items
      FROM (${wearCountsBase}) t`,
      [userId]
    );
    const mostWorn = await pool.query(
      `SELECT id, clothing_name, image_url, category, wear_count
       FROM (${wearCountsBase}) t
       WHERE wear_count > 0
       ORDER BY wear_count DESC, clothing_name ASC
       LIMIT 5`,
      [userId]
    );
    const leastWorn = await pool.query(
      `SELECT id, clothing_name, image_url, category, wear_count
       FROM (${wearCountsBase}) t
       WHERE wear_count > 0
       ORDER BY wear_count ASC, clothing_name ASC
       LIMIT 5`,
      [userId]
    );
    const unused = await pool.query(
      `SELECT id, clothing_name, image_url, category
       FROM (${wearCountsBase}) t
       WHERE wear_count = 0
       ORDER BY clothing_name ASC
       LIMIT 5`,
      [userId]
    );
    const monthlyUsage = await pool.query(
      `SELECT to_char(date_trunc('month', worn_on), 'YYYY-MM') AS month, COUNT(*)::int AS count
       FROM wear_log
       WHERE user_id = $1 AND worn_on >= (CURRENT_DATE - INTERVAL '6 months')
       GROUP BY 1
       ORDER BY 1`,
      [userId]
    );
    const byCategory = await pool.query(
      `SELECT category, COUNT(*)::int AS count FROM outfits
       WHERE user_id = $1 AND category IS NOT NULL
       GROUP BY category ORDER BY count DESC`,
      [userId]
    );
    const byColor = await pool.query(
      `SELECT color, COUNT(*)::int AS count FROM outfits
       WHERE user_id = $1 AND color IS NOT NULL
       GROUP BY color ORDER BY count DESC LIMIT 5`,
      [userId]
    );
    const avgFashionScore = await pool.query(
      `SELECT AVG(a.fashion_score)::float AS avg_score
       FROM ai_analysis a
       JOIN outfits o ON o.id = a.outfit_id
       WHERE o.user_id = $1`,
      [userId]
    );

    const total = totals.rows[0].total_items || 0;
    const worn = totals.rows[0].worn_items || 0;
    const sustainabilityScore = total > 0 ? Math.round((worn / total) * 100) : 0;

    return res.json({
      totals: totals.rows[0],
      byCategory: byCategory.rows,
      byColor: byColor.rows,
      avgFashionScore: avgFashionScore.rows[0].avg_score,
      sustainabilityScore,
      mostWorn: mostWorn.rows,
      leastWorn: leastWorn.rows,
      unused: unused.rows,
      monthlyUsage: monthlyUsage.rows,
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    return res.status(500).json({ error: 'Failed to load dashboard stats.' });
  }
}

module.exports = {
  createOutfit,
  listOutfits,
  getOutfit,
  updateOutfit,
  deleteOutfit,
  logWear,
  getDashboardStats,
};
