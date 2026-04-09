import { NextRequest, NextResponse } from 'next/server';
import { getProducts, getStorefront, getUserById } from '@/lib/db';

/**
 * GET /api/storefront/[subdomain]
 * Public endpoint — no auth required.
 * Looks up the shop by subdomain and returns products + shop info.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  const { subdomain } = await params;

  // Find shop user by subdomain — scan users (demo; use DB index in production)
  // For now we accept shopId directly as subdomain for the demo
  const shopUser = getUserById(subdomain);
  if (!shopUser) {
    return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
  }

  const products = getProducts(shopUser.id).filter((p) => p.stock > 0);
  const config = getStorefront(shopUser.id);

  return NextResponse.json({
    products,
    shopInfo: {
      shopName: config?.shopName || shopUser.shopName,
      tagline: config?.tagline || '',
      phone: config?.phone || shopUser.phone,
      address: config?.address || '',
      whatsapp: config?.whatsapp || shopUser.phone,
    },
  });
}
