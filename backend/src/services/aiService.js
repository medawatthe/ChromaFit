const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');
const config = require('../config/env');

const genAI = new GoogleGenerativeAI(config.geminiApiKey);

const MODEL_NAME = 'gemini-flash-lite-latest';

function imageToInlinePart(imagePath) {
  const ext = path.extname(imagePath).slice(1).toLowerCase();
  const mimeType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
  const data = fs.readFileSync(imagePath).toString('base64');
  return { inlineData: { mimeType, data } };
}

const ANALYSIS_SYSTEM_PROMPT = `You are ChromaFit's fashion analysis engine. You analyze a photo of a single clothing
item or outfit and return a structured styling assessment.
Base skin_tone_category on any visible skin in the image; if none is visible, use "unknown".
Score fashion_score using colour harmony, fit, and styling coherence.`;

const ANALYSIS_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    dominant_colors: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    skin_tone_category: { type: SchemaType.STRING },
    color_harmony_score: { type: SchemaType.NUMBER },
    fashion_score: { type: SchemaType.NUMBER },
    occasion_match: { type: SchemaType.STRING },
    ai_summary: { type: SchemaType.STRING },
  },
  required: [
    'dominant_colors',
    'skin_tone_category',
    'color_harmony_score',
    'fashion_score',
    'occasion_match',
    'ai_summary',
  ],
};

async function analyzeOutfit(imagePath, userContext = {}) {
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: ANALYSIS_SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: ANALYSIS_SCHEMA,
    },
  });

  const imagePart = imageToInlinePart(imagePath);
  const result = await model.generateContent([
    `Analyze this clothing item. User context: ${JSON.stringify(userContext)}`,
    imagePart,
  ]);

  const raw = result.response.text();
  return { parsed: JSON.parse(raw), raw };
}

const CHAT_SYSTEM_PROMPT = `You are the ChromaFit AI Stylist — a friendly, concise fashion assistant.
Give practical outfit and wardrobe advice tailored to the user's profile and wardrobe summary provided in context.
Keep replies to 2-4 sentences unless the user asks for a list.`;

async function chatWithStylist(message, context = {}, imagePath = null) {
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: CHAT_SYSTEM_PROMPT,
  });

  const promptText = `Context: ${JSON.stringify(context)}\n\nUser message: ${message}`;
  const parts = imagePath ? [promptText, imageToInlinePart(imagePath)] : [promptText];

  const result = await model.generateContent(parts);

  return result.response.text();
}

const COLOR_ANALYSIS_SYSTEM_PROMPT = `You are ChromaFit's personal color analysis engine. You analyze a clear
photo of a person's face/skin, eyes, and hair and determine their color profile for clothing styling purposes.
Determine: undertone (warm, cool, or neutral), a seasonal color type (Spring, Summer, Autumn, or Winter) using
the classic 4-season color analysis system, and a short list of best and worst clothing colors for them, each
with a representative hex code. Be encouraging and practical, not clinical. If the photo does not clearly show
a face, do your best with what's visible and note the limitation in ai_summary.`;

const COLOR_ANALYSIS_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    undertone: { type: SchemaType.STRING },
    seasonal_type: { type: SchemaType.STRING },
    seasonal_subtype: { type: SchemaType.STRING },
    best_colors: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: { name: { type: SchemaType.STRING }, hex: { type: SchemaType.STRING } },
        required: ['name', 'hex'],
      },
    },
    colors_to_avoid: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: { name: { type: SchemaType.STRING }, hex: { type: SchemaType.STRING } },
        required: ['name', 'hex'],
      },
    },
    ai_summary: { type: SchemaType.STRING },
  },
  required: ['undertone', 'seasonal_type', 'best_colors', 'colors_to_avoid', 'ai_summary'],
};

async function analyzeColorProfile(imagePath, userContext = {}) {
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: COLOR_ANALYSIS_SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: COLOR_ANALYSIS_SCHEMA,
    },
  });

  const imagePart = imageToInlinePart(imagePath);
  const result = await model.generateContent([
    `Analyze this person's coloring for a personal color analysis. User context: ${JSON.stringify(userContext)}`,
    imagePart,
  ]);

  const raw = result.response.text();
  return { parsed: JSON.parse(raw), raw };
}

const BODY_ANALYSIS_SYSTEM_PROMPT = `You are ChromaFit's body shape analysis engine. You analyze a clear,
full-body photo of a person standing in fitted clothing and determine their body shape for styling purposes,
using the standard categories: Hourglass, Pear, Apple, Rectangle, Inverted Triangle. If the photo doesn't show
a clear full body, use "Unknown" and explain why in ai_summary. Be body-positive and practical — this is
styling guidance, never a health, weight, or appearance judgment.`;

const BODY_ANALYSIS_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    body_shape: { type: SchemaType.STRING },
    proportions: { type: SchemaType.STRING },
    styling_tips: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    avoid_tips: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    ai_summary: { type: SchemaType.STRING },
  },
  required: ['body_shape', 'proportions', 'styling_tips', 'avoid_tips', 'ai_summary'],
};

async function analyzeBodyShape(imagePath, userContext = {}) {
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: BODY_ANALYSIS_SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: BODY_ANALYSIS_SCHEMA,
    },
  });

  const imagePart = imageToInlinePart(imagePath);
  const result = await model.generateContent([
    `Analyze this person's body shape for styling purposes. User context: ${JSON.stringify(userContext)}`,
    imagePart,
  ]);

  const raw = result.response.text();
  return { parsed: JSON.parse(raw), raw };
}

const MATCH_SYSTEM_PROMPT = `You are ChromaFit's outfit-matching engine. Given one selected clothing item and
a list of the user's other wardrobe items (structured metadata only, no images), pick which of those OTHER
items pair best with the selected item and explain why (colour harmony, occasion/season coherence, style).
Only reference items by the outfit_id values given in the candidate list — never invent an id.`;

const MATCH_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    matches: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          outfit_id: { type: SchemaType.NUMBER },
          match_score: { type: SchemaType.NUMBER },
          reason: { type: SchemaType.STRING },
        },
        required: ['outfit_id', 'match_score', 'reason'],
      },
    },
    styling_tip: { type: SchemaType.STRING },
  },
  required: ['matches', 'styling_tip'],
};

async function suggestMatches(selectedItem, candidateItems) {
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: MATCH_SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: MATCH_SCHEMA,
    },
  });

  const prompt = `Selected item: ${JSON.stringify(selectedItem)}\n\nCandidate wardrobe items:\n${JSON.stringify(candidateItems)}\n\nReturn up to 6 best matches ordered by match_score descending (0-100 scale).`;
  const result = await model.generateContent([prompt]);

  const raw = result.response.text();
  return { parsed: JSON.parse(raw), raw };
}

const COMPARISON_SYSTEM_PROMPT = `You are ChromaFit's outfit comparison engine. Given two clothing items
(structured metadata only, no images) and an optional occasion, decide which one is the better choice — or
declare a tie if they're genuinely comparable — and explain your reasoning for each.`;

const COMPARISON_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    winner: { type: SchemaType.STRING },
    reason_a: { type: SchemaType.STRING },
    reason_b: { type: SchemaType.STRING },
    verdict: { type: SchemaType.STRING },
  },
  required: ['winner', 'reason_a', 'reason_b', 'verdict'],
};

async function compareOutfits(itemA, itemB, occasion) {
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: COMPARISON_SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: COMPARISON_SCHEMA,
    },
  });

  const prompt = `Item A: ${JSON.stringify(itemA)}\n\nItem B: ${JSON.stringify(itemB)}\n\nOccasion: ${occasion || 'general / not specified'}\n\nWhich is the better choice? "winner" must be exactly "A", "B", or "tie".`;
  const result = await model.generateContent([prompt]);

  const raw = result.response.text();
  return { parsed: JSON.parse(raw), raw };
}

module.exports = {
  analyzeOutfit,
  chatWithStylist,
  analyzeColorProfile,
  analyzeBodyShape,
  suggestMatches,
  compareOutfits,
};
