import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getOrders, createOrder, updateOrder, getUserById, getProducts } from '@/lib/db';
import { OrderStatus, OrderFulfillmentType } from '@/types';

async function getAuthUser(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

/** GET /api/orders — shopkeeper views all orders for their shop */
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const orders = getOrders(user.shopId);
  return NextResponse.json({ orders });
}

/**
 * POST /api/orders — two modes:
 *  1. Shopkeeper mode (requires auth cookie): creates an order from the dashboard.
 *  2. Customer mode (no auth cookie): create a booking from a public storefront
 *     by passing `shopId` in the request body.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();

  // Determine shopId: authenticated shopkeeper OR public booking
  let shopId: string;
  const authUser = await getAuthUser(request);
  if (authUser) {
    shopId = authUser.shopId;
  } else if (body.shopId) {
    // Public customer booking — validate shopId exists and has products listed
    const shopUser = getUserById(body.shopId);
    if (!shopUser) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }
    const shopProducts = getProducts(body.shopId);
    if (shopProducts.length === 0) {
      return NextResponse.json({ error: 'This shop is not accepting orders yet' }, { status: 403 });
    }
    shopId = body.shopId;
  } else {
    return NextResponse.json({ error: 'Unauthorized or missing shopId' }, { status: 401 });
  }

  const { customerName, customerPhone, customerAddress, items, notes, fulfillmentType } = body;

  if (!customerName || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Customer name and items are required' }, { status: 400 });
  }

  // Validate items have required fields
  for (const item of items) {
    if (!item.productId || !item.productName || !item.quantity || item.price === undefined) {
      return NextResponse.json({ error: 'Each item must have productId, productName, quantity, and price' }, { status: 400 });
    }
  }

  const subtotal = items.reduce(
    (sum: number, item: { quantity: number; price: number }) => sum + item.quantity * item.price,
    0
  );
  const total = subtotal; // Orders don't apply GST by default (invoice does)

  const order = createOrder(shopId, {
    shopId,
    customerName,
    customerPhone: customerPhone || '',
    customerAddress: customerAddress || '',
    items: items.map((item: { productId: string; productName: string; quantity: number; price: number }) => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      price: item.price,
      total: item.quantity * item.price,
    })),
    subtotal,
    total,
    status: 'new',
    fulfillmentType: (fulfillmentType as OrderFulfillmentType) || 'pending',
    notes: notes || '',
  });

  return NextResponse.json({ order }, { status: 201 });
}

/**
 * PATCH /api/orders — shopkeeper updates order status or fulfillment type.
 * Body: { id, status?, fulfillmentType?, notes? }
 */
export async function PATCH(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { id, status, fulfillmentType, notes } = body;

  if (!id) return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });

  const validStatuses: OrderStatus[] = ['new', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
  if (status && !validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const validFulfillment: OrderFulfillmentType[] = ['delivery', 'pickup', 'pending'];
  if (fulfillmentType && !validFulfillment.includes(fulfillmentType)) {
    return NextResponse.json({ error: 'Invalid fulfillmentType' }, { status: 400 });
  }

  const updated = updateOrder(user.shopId, id, {
    ...(status ? { status } : {}),
    ...(fulfillmentType ? { fulfillmentType } : {}),
    ...(notes !== undefined ? { notes } : {}),
  });

  if (!updated) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  return NextResponse.json({ order: updated });
}
