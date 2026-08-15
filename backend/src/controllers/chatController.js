const pool = require('../db/pool');
const aiService = require('../services/aiService');

async function sendMessage(req, res) {
  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
  const imagePath = req.file ? req.file.path : null;

  try {
    const userResult = await pool.query(
      'SELECT skin_tone, body_shape, fashion_style_preference, favorite_colors FROM users WHERE id = $1',
      [req.user.id]
    );
    const wardrobeSummary = await pool.query(
      `SELECT category, COUNT(*)::int AS count FROM outfits WHERE user_id = $1 GROUP BY category`,
      [req.user.id]
    );

    const context = {
      profile: userResult.rows[0] || {},
      wardrobeByCategory: wardrobeSummary.rows,
    };

    const response = await aiService.chatWithStylist(message, context, imagePath);

    const insertResult = await pool.query(
      `INSERT INTO chat_history (user_id, message, response, image_url) VALUES ($1,$2,$3,$4) RETURNING *`,
      [req.user.id, message, response, imageUrl]
    );

    return res.status(201).json({ chat: insertResult.rows[0] });
  } catch (err) {
    console.error('Chat error:', err);
    return res.status(500).json({ error: 'Failed to get a response from the AI stylist. Check that GEMINI_API_KEY is set correctly.' });
  }
}

async function getHistory(req, res) {
  try {
    const result = await pool.query(
      'SELECT * FROM chat_history WHERE user_id = $1 ORDER BY created_at ASC',
      [req.user.id]
    );
    return res.json({ history: result.rows });
  } catch (err) {
    console.error('Get chat history error:', err);
    return res.status(500).json({ error: 'Failed to load chat history.' });
  }
}

module.exports = { sendMessage, getHistory };
