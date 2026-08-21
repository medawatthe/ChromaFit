const fs = require('fs');
const pool = require('../db/pool');
const aiService = require('../services/aiService');

async function analyzeBody(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'A clear, full-body photo is required.' });
  }
  const imagePath = req.file.path;

  try {
    const userResult = await pool.query('SELECT body_shape FROM users WHERE id = $1', [req.user.id]);
    const userContext = userResult.rows[0] || {};

    const { parsed, raw } = await aiService.analyzeBodyShape(imagePath, userContext);

    const insertResult = await pool.query(
      `INSERT INTO body_analysis (
        user_id, body_shape, proportions, styling_tips, avoid_tips, ai_summary, raw_response
      ) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [
        req.user.id,
        parsed.body_shape || null,
        parsed.proportions || null,
        JSON.stringify(parsed.styling_tips || []),
        JSON.stringify(parsed.avoid_tips || []),
        parsed.ai_summary || null,
        raw,
      ]
    );

    await pool.query(
      `UPDATE users SET body_shape = $1
       WHERE id = $2 AND (body_shape IS NULL OR body_shape = '')`,
      [parsed.body_shape || null, req.user.id]
    );

    return res.status(201).json({ analysis: insertResult.rows[0] });
  } catch (err) {
    console.error('Body analysis error:', err);
    return res.status(500).json({ error: 'Failed to analyze body shape. Check that GEMINI_API_KEY is set correctly.' });
  } finally {
    fs.unlink(imagePath, () => {});
  }
}

async function getBodyAnalysisHistory(req, res) {
  try {
    const result = await pool.query(
      'SELECT * FROM body_analysis WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    return res.json({ history: result.rows, latest: result.rows[0] || null });
  } catch (err) {
    console.error('Get body analysis history error:', err);
    return res.status(500).json({ error: 'Failed to load body analysis history.' });
  }
}

module.exports = { analyzeBody, getBodyAnalysisHistory };
