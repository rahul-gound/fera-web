import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getProducts, addProduct, updateProduct, deleteProduct } from '@/lib/db';
import { sarvamChat } from '@/lib/sarvam';

async function getAuthUser(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const products = getProducts(user.shopId);
  return NextResponse.json({ products });
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();

  // AI-assisted product creation from natural language
  if (body.aiDescription) {
    try {
      const systemPrompt = `You are a helpful assistant for Indian shopkeepers. 
Extract product details from the description and return a JSON object with these fields:
- name (string): product name
- description (string): short product description
- price (number): price in rupees
- category (string): product category
- stock (number): initial stock quantity (default 10 if not mentioned)

Return ONLY valid JSON, nothing else.`;

      const aiResult = await sarvamChat(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: body.aiDescription },
        ],
        'sarvam-30b'
      );

      let productData;
      try {
        const match = aiResult.match(/\{[\s\S]*\}/);
        productData = match ? JSON.parse(match[0]) : null;
      } catch {
        productData = null;
      }

      if (!productData?.name) {
        return NextResponse.json({ error: 'Could not parse product from description' }, { status: 400 });
      }

      const product = addProduct(user.shopId, {
        name: productData.name,
        description: productData.description || '',
        price: Number(productData.price) || 0,
        category: productData.category || 'General',
        stock: Number(productData.stock) || 10,
      });

      return NextResponse.json({ product, aiParsed: productData }, { status: 201 });
    } catch (error) {
      console.error('AI product creation error:', error);
      return NextResponse.json({ error: 'AI service unavailable. Please add product manually.' }, { status: 503 });
    }
  }

  // Manual product creation
  const { name, description, price, category, stock } = body;
  if (!name || price === undefined) {
    return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
  }

  const product = addProduct(user.shopId, {
    name,
    description: description || '',
    price: Number(price),
    category: category || 'General',
    stock: Number(stock) || 0,
  });

  return NextResponse.json({ product }, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });

  const product = updateProduct(user.shopId, id, updates);
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  return NextResponse.json({ product });
}

export async function DELETE(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });

  const success = deleteProduct(user.shopId, id);
  if (!success) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  return NextResponse.json({ success: true });
}
