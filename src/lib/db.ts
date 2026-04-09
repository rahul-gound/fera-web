/**
 * Simple in-memory store for demo purposes.
 * In production, replace with a real database (e.g., Supabase, PlanetScale, or MongoDB).
 */

import { Product, Invoice, User, StorefrontConfig } from '@/types';

// ---------------------------------------------------------------------------
// In-memory stores (server-side singletons for demo)
// ---------------------------------------------------------------------------

const users = new Map<string, User & { password: string }>();
const products = new Map<string, Product[]>(); // shopId -> products
const invoices = new Map<string, Invoice[]>(); // shopId -> invoices
const storefronts = new Map<string, StorefrontConfig>(); // shopId -> config

// ---------------------------------------------------------------------------
// User helpers
// ---------------------------------------------------------------------------

export function createUser(
  data: Omit<User, 'id' | 'createdAt'> & { password: string }
): User {
  const id = `u_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const user: User & { password: string } = {
    ...data,
    id,
    createdAt: new Date().toISOString(),
  };
  users.set(id, user);
  // Also index by email for lookup
  users.set(`email:${data.email}`, user);
  return sanitizeUser(user);
}

export function getUserByEmail(email: string): (User & { password: string }) | null {
  return users.get(`email:${email}`) || null;
}

export function getUserById(id: string): User | null {
  const user = users.get(id);
  return user ? sanitizeUser(user) : null;
}

function sanitizeUser(user: User & { password: string }): User {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _p, ...rest } = user;
  return rest;
}

// ---------------------------------------------------------------------------
// Product helpers
// ---------------------------------------------------------------------------

export function getProducts(shopId: string): Product[] {
  return products.get(shopId) || [];
}

export function addProduct(shopId: string, data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
  const id = `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const product: Product = {
    ...data,
    id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const list = products.get(shopId) || [];
  list.push(product);
  products.set(shopId, list);
  return product;
}

export function updateProduct(shopId: string, productId: string, data: Partial<Product>): Product | null {
  const list = products.get(shopId) || [];
  const idx = list.findIndex((p) => p.id === productId);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...data, updatedAt: new Date().toISOString() };
  products.set(shopId, list);
  return list[idx];
}

export function deleteProduct(shopId: string, productId: string): boolean {
  const list = products.get(shopId) || [];
  const newList = list.filter((p) => p.id !== productId);
  if (newList.length === list.length) return false;
  products.set(shopId, newList);
  return true;
}

// ---------------------------------------------------------------------------
// Invoice helpers
// ---------------------------------------------------------------------------

export function getInvoices(shopId: string): Invoice[] {
  return invoices.get(shopId) || [];
}

export function createInvoice(shopId: string, data: Omit<Invoice, 'id' | 'createdAt'>): Invoice {
  const id = `inv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const invoice: Invoice = {
    ...data,
    id,
    createdAt: new Date().toISOString(),
  };
  const list = invoices.get(shopId) || [];
  list.push(invoice);
  invoices.set(shopId, list);
  return invoice;
}

export function updateInvoiceStatus(shopId: string, invoiceId: string, status: Invoice['status']): Invoice | null {
  const list = invoices.get(shopId) || [];
  const idx = list.findIndex((inv) => inv.id === invoiceId);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], status };
  invoices.set(shopId, list);
  return list[idx];
}

// ---------------------------------------------------------------------------
// Storefront helpers
// ---------------------------------------------------------------------------

export function getStorefront(shopId: string): StorefrontConfig | null {
  return storefronts.get(shopId) || null;
}

export function saveStorefront(shopId: string, config: StorefrontConfig): StorefrontConfig {
  storefronts.set(shopId, config);
  return config;
}

// ---------------------------------------------------------------------------
// Analytics helpers
// ---------------------------------------------------------------------------

export function getAnalytics(shopId: string) {
  const allInvoices = getInvoices(shopId).filter((i) => i.status === 'paid');
  const allProducts = getProducts(shopId);

  // Revenue
  const totalRevenue = allInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalOrders = allInvoices.length;

  // Product performance
  const productSales: Record<string, { name: string; sold: number; revenue: number }> = {};
  for (const inv of allInvoices) {
    for (const item of inv.items) {
      if (!productSales[item.productId]) {
        productSales[item.productId] = { name: item.productName, sold: 0, revenue: 0 };
      }
      productSales[item.productId].sold += item.quantity;
      productSales[item.productId].revenue += item.total;
    }
  }

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const lowStockProducts = allProducts
    .filter((p) => p.stock < 5)
    .map((p) => ({ name: p.name, stock: p.stock }));

  // Monthly revenue (last 6 months)
  const monthlyRevenue: { month: string; revenue: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    const monthStart = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString();
    const rev = allInvoices
      .filter((inv) => inv.createdAt >= monthStart && inv.createdAt <= monthEnd)
      .reduce((s, inv) => s + inv.total, 0);
    monthlyRevenue.push({ month: key, revenue: rev });
  }

  return { totalRevenue, totalOrders, topProducts, lowStockProducts, monthlyRevenue };
}
