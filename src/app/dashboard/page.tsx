"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import AIChat from "@/components/AIChat";
import ProductSearch from "@/components/ProductSearch";
import LanguageSelector from "@/components/LanguageSelector";
import { Product, Invoice, Order } from "@/types";

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  topProducts: { name: string; sold: number; revenue: number }[];
  lowStockProducts: { name: string; stock: number }[];
  monthlyRevenue: { month: string; revenue: number }[];
  salesTips: string[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<"home" | "products" | "invoices" | "orders" | "analytics" | "ai">("home");
  const [loading, setLoading] = useState(true);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", category: "", stock: "", description: "" });
  const [addingProduct, setAddingProduct] = useState(false);
  const [aiDescription, setAiDescription] = useState("");
  const [addMode, setAddMode] = useState<"manual" | "ai">("ai");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [language, setLanguage] = useState("hi-IN");

  // Invoice form — items now include productId for searchable selection
  const [invoiceForm, setInvoiceForm] = useState({
    customerName: "",
    customerPhone: "",
    items: [{ productId: "", productName: "", quantity: 1, price: 0 }],
  });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, productsRes, invoicesRes, ordersRes] = await Promise.all([
        fetch("/api/analytics"),
        fetch("/api/products"),
        fetch("/api/invoices"),
        fetch("/api/orders"),
      ]);
      if (analyticsRes.ok) setStats(await analyticsRes.json());
      if (productsRes.ok) {
        const data = await productsRes.json();
        setProducts(data.products || []);
      }
      if (invoicesRes.ok) {
        const data = await invoicesRes.json();
        setInvoices(data.invoices || []);
      }
      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addProductManual = async () => {
    if (!newProduct.name || !newProduct.price) return;
    setAddingProduct(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProduct.name,
          price: parseFloat(newProduct.price),
          category: newProduct.category || "General",
          stock: parseInt(newProduct.stock) || 10,
          description: newProduct.description,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setProducts((prev) => [...prev, data.product]);
        setNewProduct({ name: "", price: "", category: "", stock: "", description: "" });
      }
    } finally {
      setAddingProduct(false);
    }
  };

  const addProductByAI = async () => {
    if (!aiDescription.trim()) return;
    setAddingProduct(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aiDescription }),
      });
      if (res.ok) {
        const data = await res.json();
        setProducts((prev) => [...prev, data.product]);
        setAiDescription("");
        showToast(`✅ Product added: ${data.product.name} at ₹${data.product.price}`);
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to add product via AI", "error");
      }
    } finally {
      setAddingProduct(false);
    }
  };

  const deleteProduct = async (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    await fetch(`/api/products?id=${deleteConfirmId}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p.id !== deleteConfirmId));
    setDeleteConfirmId(null);
    showToast("Product deleted");
  };

  const createInvoice = async () => {
    if (!invoiceForm.customerName || invoiceForm.items.every((i) => !i.productName)) return;
    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invoiceForm),
    });
    if (res.ok) {
      const data = await res.json();
      setInvoices((prev) => [data.invoice, ...prev]);
      setInvoiceForm({
        customerName: "",
        customerPhone: "",
        items: [{ productId: "", productName: "", quantity: 1, price: 0 }],
      });
    }
  };

  const markInvoicePaid = async (id: string) => {
    const res = await fetch("/api/invoices", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "paid" }),
    });
    if (res.ok) {
      const data = await res.json();
      setInvoices((prev) => prev.map((inv) => (inv.id === id ? data.invoice : inv)));
    }
  };

  const updateOrderStatus = async (id: string, status: string, fulfillmentType?: string) => {
    const res = await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, ...(fulfillmentType ? { fulfillmentType } : {}) }),
    });
    if (res.ok) {
      const data = await res.json();
      setOrders((prev) => prev.map((o) => (o.id === id ? data.order : o)));
      showToast(`Order ${status}`);
    }
  };

  const logout = async () => {
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {toast.message}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Product?</h3>
            <p className="text-gray-600 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={confirmDelete} className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col fixed h-full">
        <div className="mb-4">
          <Link href="/" className="flex items-center gap-1">
            <span className="text-xl font-bold text-orange-600">Fera</span>
            <span className="text-xl font-bold text-gray-800">Web</span>
          </Link>
          <p className="text-xs text-gray-500 mt-1">Shopkeeper Dashboard</p>
        </div>
        <div className="mb-4">
          <LanguageSelector value={language} onChange={setLanguage} />
        </div>
        <nav className="space-y-1 flex-1">
          <button
            onClick={() => setActiveTab("home")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === "home" ? "bg-orange-100 text-orange-700" : "text-gray-600 hover:bg-gray-100"}`}
          >
            <span>🏠</span> Dashboard
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === "products" ? "bg-orange-100 text-orange-700" : "text-gray-600 hover:bg-gray-100"}`}
          >
            <span>📦</span> Products
          </button>
          <button
            onClick={() => setActiveTab("invoices")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === "invoices" ? "bg-orange-100 text-orange-700" : "text-gray-600 hover:bg-gray-100"}`}
          >
            <span>🧾</span> Invoices
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === "orders" ? "bg-orange-100 text-orange-700" : "text-gray-600 hover:bg-gray-100"}`}
          >
            <span>🛒</span> Orders
            {orders.filter((o) => o.status === "new").length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {orders.filter((o) => o.status === "new").length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === "analytics" ? "bg-orange-100 text-orange-700" : "text-gray-600 hover:bg-gray-100"}`}
          >
            <span>📊</span> Analytics
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === "ai" ? "bg-orange-100 text-orange-700" : "text-gray-600 hover:bg-gray-100"}`}
          >
            <span>🤖</span> AI Assistant
          </button>
        </nav>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-4"
        >
          <span>🚪</span> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">
        {/* Dashboard Home */}
        {activeTab === "home" && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">नमस्ते! Welcome back 👋</h1>
            <p className="text-gray-600 mb-8">Here&apos;s how your shop is doing today</p>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[
                { label: "Total Orders", value: stats?.totalOrders || 0, icon: "📦", color: "bg-blue-50 text-blue-700" },
                { label: "Total Revenue", value: `₹${stats?.totalRevenue || 0}`, icon: "💰", color: "bg-green-50 text-green-700" },
                { label: "Products", value: products.length, icon: "🛒", color: "bg-orange-50 text-orange-700" },
                { label: "Pending Invoices", value: invoices.filter((i) => i.status === "pending").length, icon: "🧾", color: "bg-purple-50 text-purple-700" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-2xl mb-4`}>
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Sales Tips */}
            {stats?.salesTips && stats.salesTips.length > 0 && (
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-6 border border-orange-100 mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">🤖 AI Sales Tips – बिक्री बढ़ाने के Tips</h3>
                <ul className="space-y-3">
                  {stats.salesTips.slice(0, 5).map((tip, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-orange-500 font-bold text-lg leading-none">{i + 1}.</span>
                      <span className="text-gray-700 text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Low Stock Alert */}
            {stats?.lowStockProducts && stats.lowStockProducts.length > 0 && (
              <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
                <h3 className="text-lg font-bold text-red-700 mb-4">⚠️ Low Stock Alert – स्टॉक खत्म होने वाला है</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {stats.lowStockProducts.map((p) => (
                    <div key={p.name} className="bg-white rounded-xl p-3 border border-red-200">
                      <p className="font-medium text-gray-900 text-sm">{p.name}</p>
                      <p className="text-red-600 text-xs mt-1">Only {p.stock} left!</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Products / माल</h1>
                <p className="text-gray-600">{products.length} products in your shop</p>
              </div>
            </div>

            {/* Add Product */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Product / नया सामान जोड़ें</h3>
              <div className="flex gap-4 mb-4">
                <button
                  onClick={() => setAddMode("ai")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${addMode === "ai" ? "bg-orange-600 text-white" : "border border-gray-300 text-gray-600"}`}
                >
                  🤖 AI से जोड़ें (Easy)
                </button>
                <button
                  onClick={() => setAddMode("manual")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${addMode === "manual" ? "bg-orange-600 text-white" : "border border-gray-300 text-gray-600"}`}
                >
                  ✍️ Manual Form
                </button>
              </div>

              {addMode === "ai" ? (
                <div>
                  <p className="text-sm text-gray-600 mb-3">
                    बस बताएं आपका product क्या है — AI खुद सब समझेगा!<br />
                    <span className="text-gray-400">Example: &quot;50 Colgate toothpaste at ₹85 each&quot; or &quot;100 गेहूं का आटा ₹45 किलो&quot;</span>
                  </p>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={aiDescription}
                      onChange={(e) => setAiDescription(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addProductByAI()}
                      placeholder="Describe your product in any language..."
                      className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <button
                      onClick={addProductByAI}
                      disabled={addingProduct || !aiDescription.trim()}
                      className="bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-700 disabled:opacity-50 transition-colors"
                    >
                      {addingProduct ? "Adding..." : "Add 🚀"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <input
                    placeholder="Product Name *"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct((p) => ({ ...p, name: e.target.value }))}
                    className="col-span-2 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <input
                    placeholder="Price ₹ *"
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct((p) => ({ ...p, price: e.target.value }))}
                    className="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <input
                    placeholder="Category"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct((p) => ({ ...p, category: e.target.value }))}
                    className="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <input
                    placeholder="Stock"
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct((p) => ({ ...p, stock: e.target.value }))}
                    className="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    onClick={addProductManual}
                    disabled={addingProduct}
                    className="col-span-2 md:col-span-5 bg-orange-600 text-white py-3 rounded-xl font-semibold hover:bg-orange-700 disabled:opacity-50"
                  >
                    {addingProduct ? "Adding..." : "Add Product"}
                  </button>
                </div>
              )}
            </div>

            {/* Products List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-gray-900">{product.name}</h4>
                      <p className="text-xs text-orange-600 bg-orange-50 inline-block px-2 py-0.5 rounded-full mt-1">{product.category}</p>
                    </div>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                  {product.description && <p className="text-sm text-gray-600 mb-3">{product.description}</p>}
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-gray-900">₹{product.price}</span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${product.stock < 5 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                      Stock: {product.stock}
                    </span>
                  </div>
                </div>
              ))}
              {products.length === 0 && !loading && (
                <div className="col-span-3 text-center py-16 text-gray-400">
                  <div className="text-5xl mb-4">📦</div>
                  <p className="text-lg font-medium">No products yet</p>
                  <p className="text-sm mt-1">Add your first product using AI above!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Invoices Tab */}
        {activeTab === "invoices" && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invoices / बिल</h1>
            <p className="text-gray-600 mb-8">Create and manage customer invoices</p>

            {/* Create Invoice */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">New Invoice / नया बिल बनाएं</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <input
                  placeholder="Customer Name *"
                  value={invoiceForm.customerName}
                  onChange={(e) => setInvoiceForm((f) => ({ ...f, customerName: e.target.value }))}
                  className="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <input
                  placeholder="Customer Phone"
                  value={invoiceForm.customerPhone}
                  onChange={(e) => setInvoiceForm((f) => ({ ...f, customerPhone: e.target.value }))}
                  className="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              {invoiceForm.items.map((item, i) => (
                <div key={i} className="grid grid-cols-4 gap-3 mb-3">
                  <div className="col-span-2">
                    <ProductSearch
                      products={products}
                      selectedProductId={item.productId || undefined}
                      onSelect={(product) => {
                        const items = [...invoiceForm.items];
                        if (!product) {
                          items[i] = { ...items[i], productId: "", productName: "", price: 0, quantity: 1 };
                        } else {
                          items[i] = { ...items[i], productId: product.id, productName: product.name, price: product.price, quantity: 1 };
                        }
                        setInvoiceForm((f) => ({ ...f, items }));
                      }}
                      placeholder="Search & select product..."
                    />
                  </div>
                  <input
                    placeholder="Qty"
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => {
                      const items = [...invoiceForm.items];
                      items[i] = { ...items[i], quantity: parseInt(e.target.value) || 1 };
                      setInvoiceForm((f) => ({ ...f, items }));
                    }}
                    className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50">
                    <span className="text-xs text-gray-500 mr-1">₹</span>
                    <span className="text-sm font-semibold text-gray-900">{item.price > 0 ? item.price : "—"}</span>
                  </div>
                </div>
              ))}
              <div className="flex gap-3">
                <button
                  onClick={() => setInvoiceForm((f) => ({ ...f, items: [...f.items, { productId: "", productName: "", quantity: 1, price: 0 }] }))}
                  className="border border-gray-300 text-gray-600 px-4 py-2.5 rounded-xl text-sm hover:border-orange-500 hover:text-orange-600"
                >
                  + Add Item
                </button>
                <button
                  onClick={createInvoice}
                  className="bg-orange-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-700"
                >
                  Create Invoice 🧾
                </button>
              </div>
            </div>

            {/* Invoices List */}
            <div className="space-y-4">
              {invoices.map((inv) => (
                <div key={inv.id} className="bg-white rounded-2xl border border-gray-200 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-gray-900">{inv.customerName}</p>
                      <p className="text-sm text-gray-500 font-mono">{inv.id.slice(0, 12).toUpperCase()}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(inv.createdAt).toLocaleDateString("en-IN")}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">₹{inv.total}</p>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        inv.status === "paid" ? "bg-green-100 text-green-700" :
                        inv.status === "cancelled" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {inv.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    {inv.status === "pending" && (
                      <button
                        onClick={() => markInvoicePaid(inv.id)}
                        className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-green-700"
                      >
                        ✓ Mark Paid
                      </button>
                    )}
                    <button
                      onClick={() => {
                        // Share on WhatsApp
                        const text = `Invoice from your shop\nAmount: ₹${inv.total}\nID: ${inv.id.slice(0, 12).toUpperCase()}`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
                      }}
                      className="border border-green-500 text-green-700 px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-green-50"
                    >
                      📱 WhatsApp
                    </button>
                  </div>
                </div>
              ))}
              {invoices.length === 0 && !loading && (
                <div className="text-center py-16 text-gray-400">
                  <div className="text-5xl mb-4">🧾</div>
                  <p className="text-lg font-medium">No invoices yet</p>
                  <p className="text-sm mt-1">Create your first invoice above!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Orders / ऑर्डर</h1>
                <p className="text-gray-600">{orders.length} total orders</p>
              </div>
              <button onClick={loadData} className="border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50">
                🔄 Refresh
              </button>
            </div>

            {orders.length === 0 && !loading ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-5xl mb-4">🛒</div>
                <p className="text-lg font-medium">No orders yet</p>
                <p className="text-sm mt-1">Orders placed on your storefront will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-2xl border border-gray-200 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-gray-900">{order.customerName}</p>
                        <p className="text-sm text-gray-500">{order.customerPhone}</p>
                        <p className="text-xs text-gray-400 font-mono mt-1">{order.id.slice(0, 16).toUpperCase()}</p>
                        <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">₹{order.total}</p>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          order.status === "new" ? "bg-blue-100 text-blue-700" :
                          order.status === "confirmed" ? "bg-yellow-100 text-yellow-700" :
                          order.status === "preparing" ? "bg-orange-100 text-orange-700" :
                          order.status === "ready" ? "bg-purple-100 text-purple-700" :
                          order.status === "delivered" ? "bg-green-100 text-green-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {order.status.toUpperCase()}
                        </span>
                        <div className="mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            order.fulfillmentType === "delivery" ? "bg-sky-100 text-sky-700" :
                            order.fulfillmentType === "pickup" ? "bg-emerald-100 text-emerald-700" :
                            "bg-gray-100 text-gray-600"
                          }`}>
                            {order.fulfillmentType === "delivery" ? "🚚 Delivery" : order.fulfillmentType === "pickup" ? "🏪 Pickup" : "⏳ Pending"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="border-t border-gray-100 pt-2 mb-3">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-xs text-gray-600 py-1">
                          <span>{item.productName} × {item.quantity}</span>
                          <span className="font-medium">₹{item.total}</span>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      {order.fulfillmentType === "pending" && (
                        <>
                          <button
                            onClick={() => updateOrderStatus(order.id, order.status, "pickup")}
                            className="border border-emerald-500 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-emerald-50"
                          >
                            🏪 Set Pickup
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order.id, order.status, "delivery")}
                            className="border border-sky-500 text-sky-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-sky-50"
                          >
                            🚚 Set Delivery
                          </button>
                        </>
                      )}
                      {order.status === "new" && (
                        <button
                          onClick={() => updateOrderStatus(order.id, "confirmed")}
                          className="bg-yellow-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-yellow-600"
                        >
                          ✓ Confirm
                        </button>
                      )}
                      {order.status === "confirmed" && (
                        <button
                          onClick={() => updateOrderStatus(order.id, "preparing")}
                          className="bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-orange-600"
                        >
                          👨‍🍳 Preparing
                        </button>
                      )}
                      {order.status === "preparing" && (
                        <button
                          onClick={() => updateOrderStatus(order.id, "ready")}
                          className="bg-purple-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-purple-600"
                        >
                          ✅ Ready
                        </button>
                      )}
                      {order.status === "ready" && (
                        <button
                          onClick={() => updateOrderStatus(order.id, "delivered")}
                          className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-700"
                        >
                          🎉 Delivered
                        </button>
                      )}
                      {!["delivered", "cancelled"].includes(order.status) && (
                        <button
                          onClick={() => updateOrderStatus(order.id, "cancelled")}
                          className="border border-red-300 text-red-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-50"
                        >
                          ✕ Cancel
                        </button>
                      )}
                      {order.customerPhone && (
                        <a
                          href={`https://wa.me/${order.customerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
                            `Hi ${order.customerName}! Your order (${order.id.slice(0, 12).toUpperCase()}) is ${order.status}.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="border border-green-500 text-green-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-50"
                        >
                          📱 WhatsApp
                        </a>
                      )}
                    </div>
                    {order.notes && (
                      <p className="mt-2 text-xs text-gray-500 italic">Note: {order.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Analytics / बिक्री की जानकारी</h1>
            <p className="text-gray-600 mb-8">Understand your shop performance</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Revenue Stats */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">📈 Revenue Overview</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Revenue</span>
                    <span className="font-bold text-green-600">₹{stats?.totalRevenue || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Orders</span>
                    <span className="font-bold">{stats?.totalOrders || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Products Listed</span>
                    <span className="font-bold">{products.length}</span>
                  </div>
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">🏆 Top Products</h3>
                {stats?.topProducts && stats.topProducts.length > 0 ? (
                  <div className="space-y-3">
                    {stats.topProducts.map((p, i) => (
                      <div key={p.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-xs font-bold text-orange-700">{i + 1}</span>
                          <span className="text-sm text-gray-900">{p.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-green-600">₹{p.revenue}</p>
                          <p className="text-xs text-gray-400">{p.sold} sold</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No sales data yet. Mark invoices as paid to see analytics.</p>
                )}
              </div>
            </div>

            {/* Monthly Revenue Chart (simplified) */}
            {stats?.monthlyRevenue && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
                <h3 className="font-bold text-gray-900 mb-6">📊 Monthly Revenue (Last 6 months)</h3>
                <div className="flex items-end gap-4 h-40">
                  {stats.monthlyRevenue.map((m) => {
                    const maxRev = Math.max(...stats.monthlyRevenue.map((x) => x.revenue), 1);
                    const height = Math.max((m.revenue / maxRev) * 100, 4);
                    return (
                      <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                        <p className="text-xs text-gray-600 font-medium">₹{m.revenue}</p>
                        <div
                          className="w-full bg-orange-400 rounded-t-lg transition-all"
                          style={{ height: `${height}%` }}
                        ></div>
                        <p className="text-xs text-gray-500">{m.month}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sales Tips */}
            {stats?.salesTips && (
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-6 border border-orange-100">
                <h3 className="font-bold text-gray-900 mb-4">🤖 AI Sales Tips – बिक्री बढ़ाने के तरीके</h3>
                <ul className="space-y-3">
                  {stats.salesTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                      <span className="text-orange-500 font-bold">{i + 1}.</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* AI Assistant Tab */}
        {activeTab === "ai" && (
          <div className="h-[calc(100vh-4rem)]">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">AI Assistant 🤖</h1>
            <p className="text-gray-600 mb-6">
              Ask anything in any Indian language. Add products, get sales tips, manage your shop.
            </p>
            <div className="h-[calc(100vh-12rem)]">
              <AIChat
                context="general"
                language={language}
                placeholder="अपनी दुकान के बारे में कुछ भी पूछें... Ask anything about your shop..."
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
