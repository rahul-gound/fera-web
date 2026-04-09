/**
 * Sarvam AI API client
 * Supports Sarvam-30b (conversation) and Sarvam-105b (major code/website changes)
 */

const SARVAM_API_BASE = process.env.SARVAM_API_BASE_URL || 'https://api.sarvam.ai';

export type SarvamModel = 'sarvam-30b' | 'sarvam-105b';

interface SarvamMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface SarvamChatRequest {
  model: SarvamModel;
  messages: SarvamMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface SarvamChatResponse {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface SarvamTranscribeResponse {
  transcript: string;
  language_code: string;
  confidence: number;
}

/**
 * Get the API key for a given model
 */
function getApiKey(model: SarvamModel): string {
  if (model === 'sarvam-105b') {
    const key = process.env.SARVAM_105B_API_KEY;
    if (!key) throw new Error('SARVAM_105B_API_KEY is not set');
    return key;
  }
  const key = process.env.SARVAM_30B_API_KEY;
  if (!key) throw new Error('SARVAM_30B_API_KEY is not set');
  return key;
}

/**
 * Chat with a Sarvam model
 * Use sarvam-30b for conversation; sarvam-105b for major website/code generation
 */
export async function sarvamChat(
  messages: SarvamMessage[],
  model: SarvamModel = 'sarvam-30b',
  options: { temperature?: number; max_tokens?: number } = {}
): Promise<string> {
  const apiKey = getApiKey(model);

  const body: SarvamChatRequest = {
    model,
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.max_tokens ?? 2048,
  };

  const response = await fetch(`${SARVAM_API_BASE}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Sarvam API error (${response.status}): ${error}`);
  }

  const data: SarvamChatResponse = await response.json();
  return data.choices[0]?.message?.content || '';
}

/**
 * Transcribe audio using Sarvam's speech-to-text API
 * Supports all 22 Indian languages + English
 */
export async function sarvamTranscribe(
  audioBlob: ArrayBuffer,
  languageCode: string = 'hi-IN'
): Promise<SarvamTranscribeResponse> {
  const apiKey = getApiKey('sarvam-30b');

  const formData = new FormData();
  formData.append('file', new Blob([audioBlob], { type: 'audio/wav' }), 'audio.wav');
  formData.append('language_code', languageCode);
  formData.append('model', 'saarika:v1');

  const response = await fetch(`${SARVAM_API_BASE}/speech-to-text`, {
    method: 'POST',
    headers: {
      'api-subscription-key': apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Sarvam STT error (${response.status}): ${error}`);
  }

  return response.json();
}

/**
 * Determine if a request requires major or minor changes
 * Returns true if major changes (use sarvam-105b), false for minor (use sarvam-30b)
 */
export async function classifyChangeType(userMessage: string): Promise<boolean> {
  const systemPrompt = `You are an AI that classifies user requests as "major" or "minor" changes for a shopkeeper's website.
Major changes: rebuilding website sections, changing layout, adding new pages, major feature additions.
Minor changes: fixing typos, changing colors, updating product details, small text edits.
Reply with only: "major" or "minor"`;

  const result = await sarvamChat(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    'sarvam-30b',
    { temperature: 0, max_tokens: 10 }
  );

  return result.trim().toLowerCase() === 'major';
}

/**
 * Generate website HTML for a shopkeeper storefront
 */
export async function generateStorefront(config: {
  shopName: string;
  tagline?: string;
  products?: { name: string; price: number; description: string }[];
  phone?: string;
  address?: string;
  hours?: string;
  primaryColor?: string;
}): Promise<string> {
  const systemPrompt = `You are an expert web developer. Generate a complete, beautiful, mobile-responsive HTML page for a small Indian retail shop. 
Use inline CSS and pure HTML only (no external dependencies). 
The design should be clean, professional, and suitable for a local Indian shop.
Include: shop name, tagline, products grid, contact info, hours, WhatsApp button.
Return ONLY the HTML code, nothing else.`;

  const userPrompt = `Create a storefront website for:
Shop Name: ${config.shopName}
Tagline: ${config.tagline || 'Quality products at best prices'}
Phone: ${config.phone || ''}
Address: ${config.address || ''}
Hours: ${config.hours || 'Mon-Sat: 9AM-8PM'}
Primary Color: ${config.primaryColor || '#FF6B35'}
Products: ${JSON.stringify(config.products?.slice(0, 10) || [])}`;

  return sarvamChat(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    'sarvam-105b',
    { temperature: 0.3, max_tokens: 4096 }
  );
}

/**
 * Generate sales tips based on shop analytics
 */
export async function generateSalesTips(analytics: {
  topProducts: string[];
  lowSellers: string[];
  totalRevenue: number;
  monthlyGrowth: number;
}): Promise<string[]> {
  const systemPrompt = `You are a business consultant for small Indian retail shops. 
Generate 5 practical, actionable sales tips in simple language.
Format: Return a JSON array of 5 strings. Each tip should be concise and practical.`;

  const userPrompt = `Shop analytics:
Top selling products: ${analytics.topProducts.join(', ')}
Low selling products: ${analytics.lowSellers.join(', ')}
Monthly revenue: ₹${analytics.totalRevenue}
Monthly growth: ${analytics.monthlyGrowth}%

Generate 5 practical sales tips.`;

  const result = await sarvamChat(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    'sarvam-30b',
    { temperature: 0.7, max_tokens: 1024 }
  );

  try {
    const match = result.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
  } catch {
    // fallback: split by newlines
  }
  return result
    .split('\n')
    .filter((l) => l.trim())
    .slice(0, 5);
}
