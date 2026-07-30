const path = require('path');
const pool = require('../db/pool');
const aiService = require('../services/aiService');

async function analyzeOutfit(req, res) {
  try {
    const outfitResult = await pool.query('SELECT * FROM outfits WHERE id = $1 AND user_id = $2', [
      req.params.id,
      req.user.id,
    ]);
    const outfit = outfitResult.rows[0];
    if (!outfit) {
      return res.status(404).json({ error: 'Wardrobe item not found.' });
    }

    const userResult = await pool.query(
      'SELECT skin_tone, body_shape, fashion_style_preference, favorite_colors FROM users WHERE id = $1',
      [req.user.id]
    );
    const userContext = userResult.rows[0] || {};

    const imagePath = path.join(__dirname, '..', '..', outfit.image_url.replace(/^\/uploads\//, 'uploads/'));

    const { parsed, raw } = await aiService.analyzeOutfit(imagePath, userContext);

    const insertResult = await pool.query(
      `INSERT INTO ai_analysis (
        outfit_id, dominant_colors, skin_tone_category, color_harmony_score,
        fashion_score, occasion_match, ai_summary, raw_response
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [
        outfit.id,
        JSON.stringify(parsed.dominant_colors || []),
        parsed.skin_tone_category || null,
        parsed.color_harmony_score || null,
        parsed.fashion_score || null,
        parsed.occasion_match || null,
        parsed.ai_summary || null,
        raw,
      ]
    );

    return res.status(201).json({ analysis: insertResult.rows[0] });
  } catch (err) {
    console.error('Analyze outfit error:', err);
    return res.status(500).json({ error: 'Failed to analyze outfit. Check that OPENAI_API_KEY is set correctly.' });
  }
}

module.exports = { analyzeOutfit };
