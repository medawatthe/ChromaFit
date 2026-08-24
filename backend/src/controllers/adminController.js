const pool = require('../db/pool');

async function getStats(req, res) {
  try {
    const [users, outfits, analyses, chats, contacts, wishlist] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS count FROM users'),
      pool.query('SELECT COUNT(*)::int AS count FROM outfits'),
      pool.query('SELECT COUNT(*)::int AS count FROM ai_analysis'),
      pool.query('SELECT COUNT(*)::int AS count FROM chat_history'),
      pool.query('SELECT COUNT(*)::int AS count FROM contact_messages'),
      pool.query('SELECT COUNT(*)::int AS count FROM wishlist_items'),
    ]);
    const signupsByDay = await pool.query(
      `SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day, COUNT(*)::int AS count
       FROM users
       WHERE created_at >= (CURRENT_DATE - INTERVAL '14 days')
       GROUP BY 1 ORDER BY 1`
    );
    return res.json({
      totalUsers: users.rows[0].count,
      totalOutfits: outfits.rows[0].count,
      totalAnalyses: analyses.rows[0].count,
      totalChats: chats.rows[0].count,
      totalContactMessages: contacts.rows[0].count,
      totalWishlistItems: wishlist.rows[0].count,
      signupsByDay: signupsByDay.rows,
    });
  } catch (err) {
    console.error('Admin get stats error:', err);
    return res.status(500).json({ error: 'Failed to load admin stats.' });
  }
}

async function listUsers(req, res) {
  try {
    const result = await pool.query(
      `SELECT u.id, u.first_name, u.last_name, u.username, u.email, u.role, u.created_at,
              COUNT(o.id)::int AS item_count
       FROM users u
       LEFT JOIN outfits o ON o.user_id = u.id
       GROUP BY u.id
       ORDER BY u.created_at DESC`
    );
    return res.json({ users: result.rows });
  } catch (err) {
    console.error('Admin list users error:', err);
    return res.status(500).json({ error: 'Failed to load users.' });
  }
}

async function updateUserRole(req, res) {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Role must be "user" or "admin".' });
  }
  try {
    const result = await pool.query(
      'UPDATE users SET role = $1, updated_at = now() WHERE id = $2 RETURNING id, username, role',
      [role, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    return res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('Admin update user role error:', err);
    return res.status(500).json({ error: 'Failed to update user role.' });
  }
}

async function deleteUser(req, res) {
  if (Number(req.params.id) === req.user.id) {
    return res.status(400).json({ error: 'You cannot delete your own account from here.' });
  }
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    return res.status(204).send();
  } catch (err) {
    console.error('Admin delete user error:', err);
    return res.status(500).json({ error: 'Failed to delete user.' });
  }
}

async function listContactMessages(req, res) {
  try {
    const result = await pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 100');
    return res.json({ messages: result.rows });
  } catch (err) {
    console.error('Admin list contact messages error:', err);
    return res.status(500).json({ error: 'Failed to load contact messages.' });
  }
}

module.exports = { getStats, listUsers, updateUserRole, deleteUser, listContactMessages };
