export type PlanType = 'standard' | 'pro' | 'pro_ultra';

export interface Plan {
  id: PlanType;
  name: string;
  price: number;
  domain: string;
  features: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  shopName: string;
  plan: PlanType;
  subdomain: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  shopId: string;
  customerName: string;
  customerPhone?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: string;
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Analytics {
  totalOrders: number;
  totalRevenue: number;
  topProducts: { name: string; sold: number; revenue: number }[];
  lowStockProducts: { name: string; stock: number }[];
  monthlyRevenue: { month: string; revenue: number }[];
  salesTips: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  language?: string;
}

export interface AISession {
  sessionId: string;
  messages: ChatMessage[];
  context: 'setup' | 'products' | 'analytics' | 'website' | 'general';
}

export interface StorefrontConfig {
  shopName: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  heroText: string;
  aboutText: string;
  showProducts: boolean;
  showHours: boolean;
  hours: { day: string; open: string; close: string }[];
  phone: string;
  address: string;
  whatsapp?: string;
}

export type OrderFulfillmentType = 'delivery' | 'pickup' | 'pending';
export type OrderStatus = 'new' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  id: string;
  shopId: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: OrderStatus;
  fulfillmentType: OrderFulfillmentType;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
