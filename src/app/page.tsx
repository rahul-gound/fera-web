import Link from "next/link";
import { PLANS } from "@/lib/plans";

const features = [
  {
    icon: "🎙️",
    title: "बोलकर दुकान बनाएं",
    subtitle: "Voice-to-Shop AI",
    desc: "Just speak in Hindi, English, Tamil, Bengali or any of 22 Indian languages — Fera AI builds your shop.",
  },
  {
    icon: "📦",
    title: "Products Add करें बोलकर",
    subtitle: "Smart Product Management",
    desc: "Say \"Add 50 Colgate toothpaste at ₹85\" and AI adds it instantly. No forms, no typing.",
  },
  {
    icon: "🧾",
    title: "झटपट Invoice",
    subtitle: "Quick Invoice & QR",
    desc: "Generate professional invoices and QR codes in seconds. Share on WhatsApp directly.",
  },
  {
    icon: "📊",
    title: "बिक्री की समझ",
    subtitle: "Smart Analytics",
    desc: "Know which products sell best, get AI tips to increase sales, track revenue growth.",
  },
  {
    icon: "🌐",
    title: "अपनी Website",
    subtitle: "AI Website Builder",
    desc: "AI creates a professional storefront for your shop. Customers can see products online.",
  },
  {
    icon: "🇮🇳",
    title: "22 भारतीय भाषाएं",
    subtitle: "All Indian Languages",
    desc: "Powered by Sarvam AI — supports all 22 scheduled Indian languages + English.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-orange-600">Fera</span>
          <span className="text-2xl font-bold text-gray-800">Web</span>
          <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">Beta</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
            Login
          </Link>
          <Link
            href="/register"
            className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
          >
            Start Free
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 via-white to-green-50 px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span>🤖</span>
            <span>Powered by Sarvam AI – Made for Bharat</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            अपनी दुकान को{" "}
            <span className="text-orange-600">Online</span>{" "}
            लाएं
            <br />
            <span className="text-3xl md:text-5xl">बिना Coding के</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Just talk to Fera AI in your language — Hindi, Tamil, Bengali, or English.
            AI builds your shop, manages products, and helps you sell more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-orange-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-orange-700 transition-colors shadow-lg shadow-orange-200"
            >
              मुफ्त शुरू करें – Start Free 🚀
            </Link>
            <Link
              href="#pricing"
              className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:border-orange-600 hover:text-orange-600 transition-colors"
            >
              Plans देखें – View Plans
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            ✅ No credit card required &nbsp;•&nbsp; ✅ Set up in 5 minutes &nbsp;•&nbsp; ✅ 22 Indian languages
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-16 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            कैसे काम करता है? <span className="text-orange-600">How It Works?</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", icon: "🗣️", title: "बात करें AI से", desc: "Tell Fera AI about your shop in your language — products, prices, hours, everything." },
              { step: "2", icon: "⚡", title: "AI बनाता है आपकी Shop", desc: "AI instantly creates your online storefront, product catalog, and business page." },
              { step: "3", icon: "📈", title: "बेचें ज़्यादा", desc: "Share your shop link, get orders, generate invoices, and grow your business." },
            ].map((step) => (
              <div key={step.step} className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                  {step.icon}
                </div>
                <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto -mt-2 mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            सब कुछ एक जगह – <span className="text-orange-600">Everything in One Place</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-orange-600 font-medium mb-3">{f.subtitle}</p>
                <p className="text-gray-600 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            सरल Plans – <span className="text-orange-600">Simple Pricing</span>
          </h2>
          <p className="text-center text-gray-600 mb-12">
            शुरुआत करें ₹199/month से। बड़े होते जाएं।
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PLANS.map((plan, idx) => (
              <div
                key={plan.id}
                className={`rounded-2xl p-8 border-2 flex flex-col ${
                  idx === 1
                    ? "border-orange-500 shadow-xl shadow-orange-100 bg-orange-50 relative"
                    : idx === 2
                    ? "border-purple-500 shadow-xl shadow-purple-100 bg-purple-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                {idx === 1 && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-600 text-white text-xs px-4 py-1 rounded-full font-semibold">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-bold text-gray-900">₹{plan.price}</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <p className="text-sm text-gray-500 font-mono bg-gray-100 px-3 py-1 rounded-lg">
                    🌐 {plan.domain}
                  </p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-green-500 font-bold mt-0.5 flex-shrink-0">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/register?plan=${plan.id}`}
                  className={`block text-center py-3 rounded-xl font-semibold transition-colors ${
                    idx === 2
                      ? "bg-purple-600 text-white hover:bg-purple-700"
                      : idx === 1
                      ? "bg-orange-600 text-white hover:bg-orange-700"
                      : "border-2 border-gray-300 text-gray-700 hover:border-orange-500 hover:text-orange-600"
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 px-6 py-12">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl font-bold text-orange-500">Fera</span>
              <span className="text-xl font-bold text-white">Web</span>
            </div>
            <p className="text-sm">
              AI-powered shop builder for Indian retailers. Built with Sarvam AI.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/register" className="hover:text-white transition-colors">Start Free</Link></li>
              <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Contact</h4>
            <p className="text-sm">support@fera-search.tech</p>
            <p className="text-sm mt-1">🇮🇳 Made in India</p>
          </div>
        </div>
        <div className="max-w-5xl mx-auto mt-8 pt-8 border-t border-gray-800 text-center text-xs">
          © 2024 Fera Web. All rights reserved. Powered by Sarvam AI.
        </div>
      </footer>
    </div>
  );
}
