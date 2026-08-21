const pool = require('../db/pool');

async function createWishlistItem(req, res) {
  const b = req.body;

  if (!b.itemName) {
    return res.status(400).json({ error: 'An item name is required.' });
  }

  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const result = await pool.query(
      `INSERT INTO wishlist_items (user_id, item_name, category, brand, estimated_price, notes, image_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [
        req.user.id,
        b.itemName,
        b.category || null,
        b.brand || null,
        b.estimatedPrice || null,
        b.notes || null,
        imageUrl,
      ]
    );
    return res.status(201).json({ item: result.rows[0] });
  } catch (err) {
    console.error('Create wishlist item error:', err);
    return res.status(500).json({ error: 'Failed to add item to wishlist.' });
  }
}

async function listWishlistItems(req, res) {
  try {
    const result = await pool.query(
      'SELECT * FROM wishlist_items WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    return res.json({ items: result.rows });
  } catch (err) {
    console.error('List wishlist items error:', err);
    return res.status(500).json({ error: 'Failed to load wishlist.' });
  }
}

async function deleteWishlistItem(req, res) {
  try {
    const result = await pool.query(
      'DELETE FROM wishlist_items WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Wishlist item not found.' });
    }
    return res.status(204).send();
  } catch (err) {
    console.error('Delete wishlist item error:', err);
    return res.status(500).json({ error: 'Failed to delete wishlist item.' });
  }
}

module.exports = { createWishlistItem, listWishlistItems, deleteWishlistItem };
