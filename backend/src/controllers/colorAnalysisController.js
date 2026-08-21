const fs = require('fs');
const pool = require('../db/pool');
const aiService = require('../services/aiService');

async function analyzeColor(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'A clear face photo is required.' });
  }
  const imagePath = req.file.path;

  try {
    const userResult = await pool.query('SELECT skin_tone FROM users WHERE id = $1', [req.user.id]);
    const userContext = userResult.rows[0] || {};

    const { parsed, raw } = await aiService.analyzeColorProfile(imagePath, userContext);

    const insertResult = await pool.query(
      `INSERT INTO color_analysis (
        user_id, undertone, seasonal_type, seasonal_subtype, best_colors, colors_to_avoid, ai_summary, raw_response
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [
        req.user.id,
        parsed.undertone || null,
        parsed.seasonal_type || null,
        parsed.seasonal_subtype || null,
        JSON.stringify(parsed.best_colors || []),
        JSON.stringify(parsed.colors_to_avoid || []),
        parsed.ai_summary || null,
        raw,
      ]
    );

    await pool.query(
      `UPDATE users SET skin_tone = $1
       WHERE id = $2 AND (skin_tone IS NULL OR skin_tone = '')`,
      [`${parsed.undertone || ''} / ${parsed.seasonal_type || ''}`.trim(), req.user.id]
    );

    return res.status(201).json({ analysis: insertResult.rows[0] });
  } catch (err) {
    console.error('Color analysis error:', err);
    return res.status(500).json({ error: 'Failed to analyze color profile. Check that GEMINI_API_KEY is set correctly.' });
  } finally {
    fs.unlink(imagePath, () => {});
  }
}

async function getColorAnalysisHistory(req, res) {
  try {
    const result = await pool.query(
      'SELECT * FROM color_analysis WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    return res.json({ history: result.rows, latest: result.rows[0] || null });
  } catch (err) {
    console.error('Get color analysis history error:', err);
    return res.status(500).json({ error: 'Failed to load color analysis history.' });
  }
}

module.exports = { analyzeColor, getColorAnalysisHistory };
