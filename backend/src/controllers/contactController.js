const pool = require('../db/pool');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function sendMessage(req, res) {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO contact_messages (name, email, message) VALUES ($1,$2,$3) RETURNING id, created_at',
      [name.trim(), email.trim(), message.trim()]
    );
    return res.status(201).json({ contact: result.rows[0] });
  } catch (err) {
    console.error('Contact message error:', err);
    return res.status(500).json({ error: 'Failed to send your message. Please try again.' });
  }
}

module.exports = { sendMessage };
