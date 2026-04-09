import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getInvoices, createInvoice, updateInvoiceStatus } from '@/lib/db';

async function getAuthUser(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const invoices = getInvoices(user.shopId);
  return NextResponse.json({ invoices });
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { customerName, customerPhone, items } = body;

  if (!customerName || !items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Customer name and items are required' }, { status: 400 });
  }

  const subtotal = items.reduce((sum: number, item: { quantity: number; price: number }) => sum + item.quantity * item.price, 0);
  const tax = Math.round(subtotal * 0.18); // 18% GST
  const total = subtotal + tax;

  const invoice = createInvoice(user.shopId, {
    shopId: user.shopId,
    customerName,
    customerPhone: customerPhone || '',
    items: items.map((item: { productId: string; productName: string; quantity: number; price: number }) => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      price: item.price,
      total: item.quantity * item.price,
    })),
    subtotal,
    tax,
    total,
    status: 'pending',
  });

  return NextResponse.json({ invoice }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { id, status } = body;

  if (!id || !status) {
    return NextResponse.json({ error: 'Invoice ID and status are required' }, { status: 400 });
  }

  if (!['pending', 'paid', 'cancelled'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const invoice = updateInvoiceStatus(user.shopId, id, status);
  if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });

  return NextResponse.json({ invoice });
}
