const pool = require('../db/pool');
const aiService = require('../services/aiService');

function toMeta(row) {
  return {
    id: row.id,
    clothing_name: row.clothing_name,
    category: row.category,
    color: row.color,
    secondary_color: row.secondary_color,
    pattern: row.pattern,
    occasion: row.occasion,
    season: row.season,
  };
}

async function compareOutfits(req, res) {
  const { outfitIdA, outfitIdB, occasion } = req.body;

  if (!outfitIdA || !outfitIdB) {
    return res.status(400).json({ error: 'Two wardrobe items are required to compare.' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM outfits WHERE id = ANY($1::int[]) AND user_id = $2',
      [[outfitIdA, outfitIdB], req.user.id]
    );
    const itemA = result.rows.find((r) => r.id === Number(outfitIdA));
    const itemB = result.rows.find((r) => r.id === Number(outfitIdB));

    if (!itemA || !itemB) {
      return res.status(404).json({ error: 'One or both wardrobe items were not found.' });
    }

    const { parsed } = await aiService.compareOutfits(toMeta(itemA), toMeta(itemB), occasion);

    return res.json({
      itemA,
      itemB,
      winner: parsed.winner,
      reasonA: parsed.reason_a,
      reasonB: parsed.reason_b,
      verdict: parsed.verdict,
    });
  } catch (err) {
    console.error('Compare outfits error:', err);
    return res.status(500).json({ error: 'Failed to compare outfits. Check that GEMINI_API_KEY is set correctly.' });
  }
}

module.exports = { compareOutfits };
