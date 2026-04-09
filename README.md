# Fera Web – AI-Powered Shop Builder for Indian Retailers 🇮🇳

Build your online shop in minutes using AI. Speak in any of 22 Indian languages. No coding needed.

## Features

- 🤖 **AI-Powered** – Powered by Sarvam AI (30b for chat, 105b for major website changes)
- 🎙️ **Voice Input** – Add products by speaking in your language
- 🌐 **22 Indian Languages** – Hindi, Tamil, Bengali, Telugu, and more
- 📦 **Product Management** – Add/edit/delete products via AI or manual form
- 🧾 **Invoice Generation** – Create invoices with GST calculation
- 📊 **Analytics** – Sales insights and AI-powered tips to grow your business
- 🌍 **Storefront** – AI builds a beautiful website for your shop

## Pricing Plans

| Plan | Price | Domain |
|------|-------|--------|
| Standard | ₹199/month | shopname.shop.fera-search.tech |
| Pro | ₹299/month | shopname.shop.com |
| Pro Ultra | ₹599/month | shopname.com |

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/rahul-gound/fera-web
cd fera-web
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
# Edit .env.local with your actual API keys
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SARVAM_105B_API_KEY` | Sarvam 105B API key (for major website/code generation) |
| `SARVAM_30B_API_KEY` | Sarvam 30B API key (for conversation and minor changes) |
| `JWT_SECRET` | Secret key for JWT token signing |
| `NEXT_PUBLIC_APP_URL` | Your app's public URL |

## Architecture

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: Next.js API Routes (serverless)
- **AI**: Sarvam AI (sarvam-30b for chat, sarvam-105b for website generation)
- **Auth**: JWT-based authentication with HTTP-only cookies

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Sarvam AI API
- Jose (JWT)
