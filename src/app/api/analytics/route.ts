import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getAnalytics } from '@/lib/db';
import { generateSalesTips } from '@/lib/sarvam';

async function getAuthUser(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const analytics = getAnalytics(user.shopId);

  // Get AI-generated sales tips
  let salesTips: string[] = [
    'Display your best-selling products at eye level and near the entrance',
    'Bundle slow-moving items with popular products for combo deals',
    'Send WhatsApp messages to regular customers about new arrivals',
    'Keep your shop clean and well-lit to attract more customers',
    'Offer small discounts during off-peak hours to drive traffic',
  ];

  try {
    salesTips = await generateSalesTips({
      topProducts: analytics.topProducts.map((p) => p.name),
      lowSellers: analytics.lowStockProducts.map((p) => p.name),
      totalRevenue: analytics.totalRevenue,
      monthlyGrowth: 0,
    });
  } catch {
    // Use default tips if AI is unavailable
  }

  return NextResponse.json({ ...analytics, salesTips });
}
