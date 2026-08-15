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

module.exports = { analyzeOutfit, chatWithStylist };
