import { Plan, PlanType } from '@/types';

export const PLANS: Plan[] = [
  {
    id: 'standard',
    name: 'Standard',
    price: 199,
    domain: 'shop.fera-search.tech',
    features: [
      'AI-powered product management (voice & text)',
      'Add products by just talking to AI',
      'Quick invoice generation',
      'QR code for products & invoices',
      'Basic analytics & sales tips',
      'Support for 22 Indian languages + English',
      'shop.fera-search.tech domain',
      'Up to 100 products',
      'WhatsApp integration',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 299,
    domain: 'yourshop.shop.com',
    features: [
      'Everything in Standard',
      'Custom domain: yourshop.shop.com',
      'Up to 500 products',
      'Advanced analytics & insights',
      'AI website builder (minor edits)',
      'Customer login & order tracking',
      'Email notifications',
      'Sales performance reports',
      'Priority AI support',
    ],
  },
  {
    id: 'pro_ultra',
    name: 'Pro Ultra',
    price: 599,
    domain: 'yourshop.com',
    features: [
      'Everything in Pro',
      'Premium domain: yourshop.com',
      'Unlimited products',
      'Full AI website builder (major + minor changes)',
      'Advanced AI with Sarvam-105b',
      'Real-time customer need insights',
      'Custom branding & themes',
      'Priority 24/7 support',
      'Multi-location support',
      'Advanced inventory management',
    ],
  },
];

export function getPlanById(id: PlanType): Plan {
  return PLANS.find((p) => p.id === id) || PLANS[0];
}

export function getDomainForPlan(plan: PlanType, shopName: string): string {
  const slug = shopName.toLowerCase().replace(/\s+/g, '');
  switch (plan) {
    case 'standard':
      return `${slug}.shop.fera-search.tech`;
    case 'pro':
      return `${slug}.shop.com`;
    case 'pro_ultra':
      return `${slug}.com`;
    default:
      return `${slug}.shop.fera-search.tech`;
  }
}

export const SUPPORTED_LANGUAGES = [
  { code: 'en-IN', name: 'English', native: 'English' },
  { code: 'hi-IN', name: 'Hindi', native: 'हिन्दी' },
  { code: 'bn-IN', name: 'Bengali', native: 'বাংলা' },
  { code: 'te-IN', name: 'Telugu', native: 'తెలుగు' },
  { code: 'mr-IN', name: 'Marathi', native: 'मराठी' },
  { code: 'ta-IN', name: 'Tamil', native: 'தமிழ்' },
  { code: 'gu-IN', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'kn-IN', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml-IN', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'pa-IN', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'or-IN', name: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'as-IN', name: 'Assamese', native: 'অসমীয়া' },
  { code: 'ur-IN', name: 'Urdu', native: 'اردو' },
  { code: 'mai-IN', name: 'Maithili', native: 'मैथिली' },
  { code: 'sa-IN', name: 'Sanskrit', native: 'संस्कृतम्' },
  { code: 'kok-IN', name: 'Konkani', native: 'कोंकणी' },
  { code: 'doi-IN', name: 'Dogri', native: 'डोगरी' },
  { code: 'mni-IN', name: 'Manipuri', native: 'মৈতৈলোন্' },
  { code: 'sat-IN', name: 'Santali', native: 'ᱥᱟᱱᱛᱟᱲᱤ' },
  { code: 'sd-IN', name: 'Sindhi', native: 'سنڌي' },
  { code: 'ks-IN', name: 'Kashmiri', native: 'كٲشُر' },
  { code: 'ne-IN', name: 'Nepali', native: 'नेपाली' },
  { code: 'bo-IN', name: 'Bodo', native: 'बर\u200dः' },
];
