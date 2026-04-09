"use client";
import { useState, useEffect, use } from "react";
import { Product, Order } from "@/types";

interface CartItem {
  product: Product;
  quantity: number;
}

interface ShopInfo {
  shopName: string;
  tagline?: string;
  phone?: string;
  address?: string;
  whatsapp?: string;
}

export default function StorefrontPage({ params }: { params: Promise<{ subdomain: string }> }) {
  const { subdomain } = use(params);

  const [products, setProducts] = useState<Product[]>([]);
  const [shopInfo, setShopInfo] = useState<ShopInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "details" | "confirm">("cart");
  const [orderDetails, setOrderDetails] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    fulfillmentType: "pickup" as "pickup" | "delivery",
    notes: "",
  });
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    loadShopData();
  }, [subdomain]);

  const loadShopData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/storefront/${subdomain}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setShopInfo(data.shopInfo || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateCartQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.product.id !== productId));
    } else {
      setCart((prev) =>
        prev.map((i) => (i.product.id === productId ? { ...i, quantity: qty } : i))
      );
    }
  };

  const placeOrder = async () => {
    if (!orderDetails.customerName || !orderDetails.customerPhone) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopId: subdomain,
          customerName: orderDetails.customerName,
          customerPhone: orderDetails.customerPhone,
          customerAddress: orderDetails.customerAddress,
          fulfillmentType: orderDetails.fulfillmentType,
          notes: orderDetails.notes,
          items: cart.map((i) => ({
            productId: i.product.id,
            productName: i.product.name,
            quantity: i.quantity,
            price: i.product.price,
          })),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPlacedOrder(data.order);
        setCart([]);
        setCheckoutStep("confirm");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">🛒</div>
          <p className="text-gray-600">Loading shop...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Shop Header */}
      <header className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-4 py-6 sticky top-0 z-40 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{shopInfo?.shopName || subdomain}</h1>
            {shopInfo?.tagline && (
              <p className="text-orange-100 text-sm mt-0.5">{shopInfo.tagline}</p>
            )}
          </div>
          <button
            onClick={() => setShowCart(true)}
            className="relative bg-white text-orange-600 px-4 py-2 rounded-xl font-semibold text-sm shadow hover:bg-orange-50 transition-colors"
          >
            🛒 Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Search + Filter */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 Search products..."
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm mb-3"
        />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-orange-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-orange-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <main className="max-w-4xl mx-auto px-4 pb-20">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">📦</div>
            <p className="text-lg font-medium">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filteredProducts.map((product) => {
              const cartItem = cart.find((i) => i.product.id === product.id);
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="text-4xl mb-3 text-center">🛍️</div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2">{product.name}</h3>
                  <p className="text-xs text-orange-600 bg-orange-50 inline-block px-2 py-0.5 rounded-full mb-2">
                    {product.category}
                  </p>
                  {product.description && (
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">{product.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                    {product.stock === 0 ? (
                      <span className="text-xs text-red-500 font-medium">Out of stock</span>
                    ) : cartItem ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateCartQty(product.id, cartItem.quantity - 1)}
                          className="w-7 h-7 bg-orange-100 text-orange-700 rounded-lg text-sm font-bold hover:bg-orange-200"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-sm font-bold">{cartItem.quantity}</span>
                        <button
                          onClick={() => updateCartQty(product.id, cartItem.quantity + 1)}
                          className="w-7 h-7 bg-orange-100 text-orange-700 rounded-lg text-sm font-bold hover:bg-orange-200"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(product)}
                        className="bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-orange-700"
                      >
                        Add +
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black bg-opacity-50" onClick={() => setShowCart(false)} />
          <div className="w-full max-w-sm bg-white flex flex-col shadow-2xl">
            {/* Cart Header */}
            <div className="bg-orange-600 text-white px-4 py-4 flex items-center justify-between">
              <h2 className="font-bold text-lg">
                {checkoutStep === "cart" ? "Your Cart 🛒" : checkoutStep === "details" ? "Order Details" : "Order Placed! 🎉"}
              </h2>
              <button onClick={() => { setShowCart(false); setCheckoutStep("cart"); }} className="text-orange-200 hover:text-white text-2xl leading-none">×</button>
            </div>

            {/* Cart Step */}
            {checkoutStep === "cart" && (
              <div className="flex-1 overflow-y-auto p-4">
                {cart.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <div className="text-4xl mb-3">🛒</div>
                    <p>Your cart is empty</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 mb-4">
                      {cart.map((item) => (
                        <div key={item.product.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                            <p className="text-xs text-gray-500">₹{item.product.price} each</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => updateCartQty(item.product.id, item.quantity - 1)} className="w-7 h-7 bg-orange-100 text-orange-700 rounded-lg text-sm font-bold">−</button>
                            <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                            <button onClick={() => updateCartQty(item.product.id, item.quantity + 1)} className="w-7 h-7 bg-orange-100 text-orange-700 rounded-lg text-sm font-bold">+</button>
                          </div>
                          <p className="text-sm font-bold text-orange-600 w-16 text-right">₹{item.product.price * item.quantity}</p>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-3 flex justify-between font-bold text-lg mb-4">
                      <span>Total</span>
                      <span className="text-orange-600">₹{cartTotal}</span>
                    </div>
                    <button
                      onClick={() => setCheckoutStep("details")}
                      className="w-full bg-orange-600 text-white py-3 rounded-xl font-semibold hover:bg-orange-700"
                    >
                      Proceed to Checkout →
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Details Step */}
            {checkoutStep === "details" && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <input
                  placeholder="Your Name *"
                  value={orderDetails.customerName}
                  onChange={(e) => setOrderDetails((d) => ({ ...d, customerName: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <input
                  placeholder="Phone Number *"
                  value={orderDetails.customerPhone}
                  onChange={(e) => setOrderDetails((d) => ({ ...d, customerPhone: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setOrderDetails((d) => ({ ...d, fulfillmentType: "pickup" }))}
                    className={`py-3 rounded-xl text-sm font-medium border-2 transition-colors ${
                      orderDetails.fulfillmentType === "pickup"
                        ? "border-orange-500 bg-orange-50 text-orange-700"
                        : "border-gray-200 text-gray-600"
                    }`}
                  >
                    🏪 Pickup
                  </button>
                  <button
                    onClick={() => setOrderDetails((d) => ({ ...d, fulfillmentType: "delivery" }))}
                    className={`py-3 rounded-xl text-sm font-medium border-2 transition-colors ${
                      orderDetails.fulfillmentType === "delivery"
                        ? "border-orange-500 bg-orange-50 text-orange-700"
                        : "border-gray-200 text-gray-600"
                    }`}
                  >
                    🚚 Delivery
                  </button>
                </div>
                {orderDetails.fulfillmentType === "delivery" && (
                  <textarea
                    placeholder="Delivery address"
                    value={orderDetails.customerAddress}
                    onChange={(e) => setOrderDetails((d) => ({ ...d, customerAddress: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none h-20"
                  />
                )}
                <textarea
                  placeholder="Special instructions (optional)"
                  value={orderDetails.notes}
                  onChange={(e) => setOrderDetails((d) => ({ ...d, notes: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none h-16"
                />
                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold text-lg mb-4">
                    <span>Total</span>
                    <span className="text-orange-600">₹{cartTotal}</span>
                  </div>
                  <button
                    onClick={placeOrder}
                    disabled={submitting || !orderDetails.customerName || !orderDetails.customerPhone}
                    className="w-full bg-orange-600 text-white py-3 rounded-xl font-semibold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Placing Order..." : "Place Order 🎉"}
                  </button>
                  <button onClick={() => setCheckoutStep("cart")} className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700">
                    ← Back to cart
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Step */}
            {checkoutStep === "confirm" && placedOrder && (
              <div className="flex-1 overflow-y-auto p-4 text-center">
                <div className="text-6xl mb-4 mt-8">🎉</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Order Placed!</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Thank you, {placedOrder.customerName}! The shopkeeper has been notified.
                </p>
                <div className="bg-orange-50 rounded-xl p-4 text-left mb-4">
                  <p className="text-xs text-gray-500 mb-1">Order ID</p>
                  <p className="font-mono text-sm font-bold text-gray-900">{placedOrder.id.slice(0, 16).toUpperCase()}</p>
                  <p className="text-xs text-gray-500 mt-2 mb-1">Fulfillment</p>
                  <p className="text-sm font-medium capitalize">
                    {placedOrder.fulfillmentType === "delivery" ? "🚚 Delivery" : "🏪 Pickup"}
                  </p>
                  <p className="text-xs text-gray-500 mt-2 mb-1">Total</p>
                  <p className="text-lg font-bold text-orange-600">₹{placedOrder.total}</p>
                </div>
                {shopInfo?.whatsapp && (
                  <a
                    href={`https://wa.me/${shopInfo.whatsapp}?text=${encodeURIComponent(
                      `Hi! I placed an order (ID: ${placedOrder.id.slice(0, 12).toUpperCase()}) for ₹${placedOrder.total}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 mb-3"
                  >
                    📱 Contact on WhatsApp
                  </a>
                )}
                <button
                  onClick={() => { setShowCart(false); setCheckoutStep("cart"); setPlacedOrder(null); }}
                  className="w-full border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sticky Cart Button */}
      {cartCount > 0 && !showCart && (
        <div className="fixed bottom-4 left-0 right-0 px-4 max-w-4xl mx-auto">
          <button
            onClick={() => setShowCart(true)}
            className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold shadow-xl hover:bg-orange-700 flex items-center justify-between px-6"
          >
            <span>🛒 {cartCount} items</span>
            <span>View Cart • ₹{cartTotal}</span>
          </button>
        </div>
      )}
    </div>
  );
}
