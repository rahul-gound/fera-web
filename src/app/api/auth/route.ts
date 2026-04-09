import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/lib/db';
import { signToken, hashPassword, verifyPassword } from '@/lib/auth';
import { PlanType } from '@/types';
import { getDomainForPlan } from '@/lib/plans';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'register') {
      const { name, email, phone, shopName, password, plan } = body;
      if (!name || !email || !phone || !shopName || !password) {
        return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
      }

      const existing = getUserByEmail(email);
      if (existing) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
      }

      const selectedPlan: PlanType = (['standard', 'pro', 'pro_ultra'].includes(plan) ? plan : 'standard') as PlanType;
      const subdomain = getDomainForPlan(selectedPlan, shopName);

      const user = createUser({
        name,
        email,
        phone,
        shopName,
        plan: selectedPlan,
        subdomain,
        password: hashPassword(password),
      });

      const token = await signToken({
        userId: user.id,
        shopId: user.id,
        email: user.email,
        plan: user.plan,
      });

      const response = NextResponse.json({ user, token }, { status: 201 });
      response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
      return response;
    }

    if (action === 'login') {
      const { email, password } = body;
      if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
      }

      const user = getUserByEmail(email);
      if (!user || !verifyPassword(password, user.password)) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      const token = await signToken({
        userId: user.id,
        shopId: user.id,
        email: user.email,
        plan: user.plan,
      });

      const response = NextResponse.json({ user: { ...user, password: undefined }, token });
      response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
      return response;
    }

    if (action === 'logout') {
      const response = NextResponse.json({ success: true });
      response.cookies.delete('auth_token');
      return response;
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
