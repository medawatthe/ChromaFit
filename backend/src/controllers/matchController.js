const pool = require('../db/pool');
const aiService = require('../services/aiService');

async function matchOutfit(req, res) {
  try {
    const outfitResult = await pool.query('SELECT * FROM outfits WHERE id = $1 AND user_id = $2', [
      req.params.id,
      req.user.id,
    ]);
    const selected = outfitResult.rows[0];
    if (!selected) {
      return res.status(404).json({ error: 'Wardrobe item not found.' });
    }

    const candidatesResult = await pool.query(
      `SELECT id, clothing_name, category, color, secondary_color, pattern, occasion, season
       FROM outfits WHERE user_id = $1 AND id != $2 ORDER BY created_at DESC LIMIT 60`,
      [req.user.id, selected.id]
    );
    if (candidatesResult.rows.length === 0) {
      return res.status(400).json({ error: 'Add more items to your wardrobe to get match suggestions.' });
    }

    const selectedMeta = {
      id: selected.id,
      clothing_name: selected.clothing_name,
      category: selected.category,
      color: selected.color,
      secondary_color: selected.secondary_color,
      pattern: selected.pattern,
      occasion: selected.occasion,
      season: selected.season,
    };

    const { parsed } = await aiService.suggestMatches(selectedMeta, candidatesResult.rows);

    const matchedIds = (parsed.matches || []).map((m) => m.outfit_id);
    const fullRows = matchedIds.length
      ? await pool.query('SELECT * FROM outfits WHERE id = ANY($1::int[]) AND user_id = $2', [
          matchedIds,
          req.user.id,
        ])
      : { rows: [] };
    const byId = Object.fromEntries(fullRows.rows.map((o) => [o.id, o]));

    const matches = (parsed.matches || [])
      .filter((m) => byId[m.outfit_id])
      .map((m) => ({ ...byId[m.outfit_id], match_score: m.match_score, reason: m.reason }));

    return res.json({ selected, matches, stylingTip: parsed.styling_tip });
  } catch (err) {
    console.error('Match outfit error:', err);
    return res.status(500).json({ error: 'Failed to generate match suggestions. Check that GEMINI_API_KEY is set correctly.' });
  }
}

module.exports = { matchOutfit };
