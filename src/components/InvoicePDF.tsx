"use client";
import { Invoice } from "@/types";

interface InvoiceViewProps {
  invoice: Invoice;
  shopName?: string;
  shopPhone?: string;
}

export default function InvoiceView({ invoice, shopName = "Your Shop", shopPhone }: InvoiceViewProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a simple HTML invoice for download
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoice.id}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; border-bottom: 2px solid #f97316; padding-bottom: 15px; margin-bottom: 20px; }
    .shop-name { font-size: 24px; font-weight: bold; color: #f97316; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th { background: #f97316; color: white; padding: 8px; text-align: left; }
    td { padding: 8px; border-bottom: 1px solid #eee; }
    .total-row { font-weight: bold; background: #fff7ed; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="shop-name">${shopName}</div>
    ${shopPhone ? `<div>${shopPhone}</div>` : ""}
    <div style="color:#666; font-size:12px">GST Invoice</div>
  </div>
  <div>
    <strong>Invoice #:</strong> ${invoice.id.slice(0, 12).toUpperCase()}<br>
    <strong>Date:</strong> ${new Date(invoice.createdAt).toLocaleDateString("en-IN")}<br>
    <strong>Customer:</strong> ${invoice.customerName}<br>
    ${invoice.customerPhone ? `<strong>Phone:</strong> ${invoice.customerPhone}<br>` : ""}
  </div>
  <table>
    <thead>
      <tr>
        <th>Product</th>
        <th>Qty</th>
        <th>Price</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.items.map((item) => `
        <tr>
          <td>${item.productName}</td>
          <td>${item.quantity}</td>
          <td>₹${item.price}</td>
          <td>₹${item.total}</td>
        </tr>
      `).join("")}
    </tbody>
    <tfoot>
      <tr><td colspan="3">Subtotal</td><td>₹${invoice.subtotal}</td></tr>
      <tr><td colspan="3">GST (18%)</td><td>₹${invoice.tax}</td></tr>
      <tr class="total-row"><td colspan="3"><strong>Total</strong></td><td><strong>₹${invoice.total}</strong></td></tr>
    </tfoot>
  </table>
  <div class="footer">
    <p>Thank you for your business! 🙏</p>
    <p style="color:#f97316">Powered by Fera Web • fera-search.tech</p>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${invoice.id.slice(0, 8)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
        <h2 className="text-white font-bold text-xl">{shopName}</h2>
        {shopPhone && <p className="text-orange-100 text-sm">{shopPhone}</p>}
        <p className="text-orange-200 text-xs">Tax Invoice / GST Invoice</p>
      </div>
      <div className="p-6">
        <div className="flex justify-between mb-6 text-sm">
          <div>
            <p><span className="text-gray-500">Invoice #:</span> <span className="font-mono font-medium">{invoice.id.slice(0, 12).toUpperCase()}</span></p>
            <p><span className="text-gray-500">Date:</span> {new Date(invoice.createdAt).toLocaleDateString("en-IN")}</p>
          </div>
          <div className="text-right">
            <p><span className="text-gray-500">Customer:</span> <span className="font-medium">{invoice.customerName}</span></p>
            {invoice.customerPhone && <p className="text-gray-600">{invoice.customerPhone}</p>}
          </div>
        </div>
        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="bg-orange-50">
              <th className="text-left py-2 px-3 text-gray-700">Product</th>
              <th className="text-right py-2 px-3 text-gray-700">Qty</th>
              <th className="text-right py-2 px-3 text-gray-700">Price</th>
              <th className="text-right py-2 px-3 text-gray-700">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-2 px-3">{item.productName}</td>
                <td className="py-2 px-3 text-right">{item.quantity}</td>
                <td className="py-2 px-3 text-right">₹{item.price}</td>
                <td className="py-2 px-3 text-right font-medium">₹{item.total}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="text-sm">
              <td colSpan={3} className="py-2 px-3 text-right text-gray-500">Subtotal</td>
              <td className="py-2 px-3 text-right">₹{invoice.subtotal}</td>
            </tr>
            <tr className="text-sm">
              <td colSpan={3} className="py-2 px-3 text-right text-gray-500">GST (18%)</td>
              <td className="py-2 px-3 text-right">₹{invoice.tax}</td>
            </tr>
            <tr className="bg-orange-50 font-bold">
              <td colSpan={3} className="py-3 px-3 text-right">Total</td>
              <td className="py-3 px-3 text-right text-orange-600 text-lg">₹{invoice.total}</td>
            </tr>
          </tfoot>
        </table>
        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 bg-orange-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-700 transition-colors"
          >
            📥 Download Invoice
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:border-orange-500 hover:text-orange-600 transition-colors"
          >
            🖨️ Print
          </button>
        </div>
      </div>
    </div>
  );
}
