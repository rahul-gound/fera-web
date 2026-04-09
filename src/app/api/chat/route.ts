import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { sarvamChat, classifyChangeType } from '@/lib/sarvam';
import { getProducts, getAnalytics } from '@/lib/db';
import { getUserById } from '@/lib/db';

async function getAuthUser(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { message, context, history } = body;

  if (!message) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  // Get shop context
  const shopUser = getUserById(user.userId);
  const products = getProducts(user.shopId);
  const analytics = getAnalytics(user.shopId);

  // Build system prompt based on context
  let systemPrompt = `You are Fera AI, a friendly business assistant for Indian shopkeepers. 
You speak simply and clearly in the shopkeeper's preferred language.
You help with: managing products, creating invoices, understanding sales data, and growing their business.

Shop Name: ${shopUser?.shopName || 'Your Shop'}
Plan: ${user.plan}
Total Products: ${products.length}
Total Revenue: ₹${analytics.totalRevenue}

Key rules:
- Be conversational and friendly, like talking to a friend
- Use simple words, avoid technical jargon
- When a shopkeeper wants to add a product, extract details and confirm
- When asked about sales, explain in simple terms with actionable advice
- Always respond in the same language the shopkeeper uses
- Keep responses concise and practical`;

  // Detect if this is a website change request (for Pro Ultra)
  let modelToUse: 'sarvam-30b' | 'sarvam-105b' = 'sarvam-30b';
  
  if (user.plan === 'pro_ultra' && context === 'website') {
    try {
      const isMajorChange = await classifyChangeType(message);
      if (isMajorChange) {
        modelToUse = 'sarvam-105b';
        systemPrompt += '\n\nYou are handling a MAJOR website change. Provide detailed implementation.';
      }
    } catch {
      // Default to 30b
    }
  }

  // Build conversation history
  const messages: { role: 'user' | 'assistant' | 'system'; content: string }[] = [
    { role: 'system', content: systemPrompt },
    ...(Array.isArray(history) ? history.slice(-10) : []),
    { role: 'user', content: message },
  ];

  try {
    // Check if shopkeeper is asking to add a product
    const isProductRequest = /add|jod|डाल|ऐड|product|item|माल|सामान/i.test(message);
    
    if (isProductRequest && context === 'products') {
      systemPrompt += `\n\nIf the shopkeeper wants to add a product, extract these details and respond with:
1. A friendly confirmation message
2. A JSON block in this format: <product>{"name":"...","price":0,"category":"...","description":"...","stock":10}</product>`;
    }

    // Check if shopkeeper needs login/signup options
    const isAuthRequest = /login|signup|register|account|खाता|लॉगिन|साइनअप/i.test(message);
    if (isAuthRequest) {
      return NextResponse.json({
        reply: `मैं आपकी मदद कर सकता हूं! / I can help you with that!

क्या आप **Login** करना चाहते हैं या **Sign Up** करना चाहते हैं?
Do you want to **Login** or **Sign Up**?

👉 [Login / लॉगिन](/login)
👉 [Sign Up / रजिस्टर करें](/register)`,
        action: 'auth_redirect',
        model: 'sarvam-30b',
      });
    }

    const reply = await sarvamChat(messages, modelToUse, { temperature: 0.7, max_tokens: 1024 });

    // Extract product data if present
    const productMatch = reply.match(/<product>([\s\S]*?)<\/product>/);
    let extractedProduct = null;
    if (productMatch) {
      try {
        extractedProduct = JSON.parse(productMatch[1]);
      } catch {
        // ignore
      }
    }

    return NextResponse.json({
      reply: reply.replace(/<product>[\s\S]*?<\/product>/, '').trim(),
      extractedProduct,
      model: modelToUse,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    
    // Fallback response when AI is unavailable
    const fallbackReplies: Record<string, string> = {
      products: 'मुझे अभी AI से जुड़ने में समस्या हो रही है। / I\'m having trouble connecting to AI right now. Please try again in a moment.',
      analytics: 'Your analytics are being processed. Please check back shortly.',
      general: 'मैं अभी उपलब्ध नहीं हूं। / I\'m currently unavailable. Please try again later.',
    };

    return NextResponse.json(
      { reply: fallbackReplies[context] || fallbackReplies.general, error: 'AI temporarily unavailable' },
      { status: 503 }
    );
  }
}
