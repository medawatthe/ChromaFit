const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const config = require('../config/env');

const client = new OpenAI({ apiKey: config.openaiApiKey });

const VISION_MODEL = 'gpt-4o-mini';
const CHAT_MODEL = 'gpt-4o-mini';

function imageToDataUrl(imagePath) {
  const ext = path.extname(imagePath).slice(1).toLowerCase();
  const mime = ext === 'jpg' ? 'jpeg' : ext;
  const buffer = fs.readFileSync(imagePath);
  return `data:image/${mime};base64,${buffer.toString('base64')}`;
}

const ANALYSIS_SYSTEM_PROMPT = `You are ChromaFit's fashion analysis engine. You analyze a photo of a single clothing
item or outfit and return ONLY a JSON object with this exact shape:
{
  "dominant_colors": ["string", ...],
  "skin_tone_category": "fair|light|medium|olive|tan|deep|unknown",
  "color_harmony_score": number (0-100),
  "fashion_score": number (0-10),
  "occasion_match": "string describing best-fit occasions",
  "ai_summary": "2-3 sentence human-readable styling summary and advice"
}
Base skin_tone_category on any visible skin in the image; if none is visible, use "unknown".
Score fashion_score using colour harmony, fit, and styling coherence. Respond with JSON only, no markdown.`;

async function analyzeOutfit(imagePath, userContext = {}) {
  const dataUrl = imageToDataUrl(imagePath);

  const response = await client.chat.completions.create({
    model: VISION_MODEL,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: ANALYSIS_SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyze this clothing item. User context: ${JSON.stringify(userContext)}`,
          },
          { type: 'image_url', image_url: { url: dataUrl } },
        ],
      },
    ],
  });

  const raw = response.choices[0].message.content;
  return { parsed: JSON.parse(raw), raw };
}

const CHAT_SYSTEM_PROMPT = `You are the ChromaFit AI Stylist — a friendly, concise fashion assistant.
Give practical outfit and wardrobe advice tailored to the user's profile and wardrobe summary provided in context.
Keep replies to 2-4 sentences unless the user asks for a list.`;

async function chatWithStylist(message, context = {}) {
  const response = await client.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      { role: 'system', content: CHAT_SYSTEM_PROMPT },
      { role: 'user', content: `Context: ${JSON.stringify(context)}\n\nUser message: ${message}` },
    ],
  });

  return response.choices[0].message.content;
}

module.exports = { analyzeOutfit, chatWithStylist };
