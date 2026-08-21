export function hexToHsl(hex) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: Math.round(l * 100) };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
  else if (max === g) h = ((b - r) / d + 2) * 60;
  else h = ((r - g) / d + 4) * 60;

  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function classifyTemperature({ h }) {
  // Warm hue families: reds/oranges/yellows (~0-70) and magenta/red wrap (~330-360).
  // Cool hue families: greens/blues/purples (~150-300).
  if ((h >= 0 && h <= 70) || h >= 330) return 'warm';
  if (h >= 150 && h <= 300) return 'cool';
  return 'neutral';
}

const WARM_SEASONS = new Set(['spring', 'autumn']);
const COOL_SEASONS = new Set(['summer', 'winter']);

export function parseUndertone(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  if (lower.includes('warm')) return 'warm';
  if (lower.includes('cool')) return 'cool';
  if (lower.includes('neutral')) return 'neutral';
  return null;
}

export function getColorVerdict({ hex, undertone, seasonalType }) {
  if (!hex || hex.length < 6) {
    return { verdict: 'unknown', reason: 'Pick a color to see how it works for you.' };
  }

  const { h, s, l } = hexToHsl(hex);
  const colorTemp = classifyTemperature({ h });

  const seasonKey = (seasonalType || '').toLowerCase();
  const seasonTemp = WARM_SEASONS.has(seasonKey) ? 'warm' : COOL_SEASONS.has(seasonKey) ? 'cool' : null;
  const referenceTemp = seasonTemp || undertone;

  if (!referenceTemp) {
    return {
      verdict: 'unknown',
      reason: 'Run Color Analysis (or set a skin tone on your profile) to get a personalized verdict.',
    };
  }

  if (colorTemp === 'neutral') {
    return {
      verdict: 'good',
      reason: 'This is a fairly neutral shade — it should work reasonably well regardless of undertone.',
    };
  }

  const tempMatches = colorTemp === referenceTemp;

  // Extreme brightness/darkness or very low saturation can clash even on a matching temperature.
  const isMuted = s < 20;
  const isExtreme = l < 12 || l > 92;

  if (tempMatches && !isMuted && !isExtreme) {
    return {
      verdict: 'great',
      reason: `This ${colorTemp} shade aligns with your ${referenceTemp} undertone — a strong match.`,
    };
  }
  if (tempMatches) {
    return {
      verdict: 'good',
      reason: `The ${colorTemp} tone suits you, though this exact shade is quite ${isMuted ? 'muted' : 'extreme'} — try a slightly different intensity.`,
    };
  }
  return {
    verdict: 'avoid',
    reason: `This ${colorTemp} shade may clash with your ${referenceTemp} undertone — it can wash you out.`,
  };
}
