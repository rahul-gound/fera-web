import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fera Web – AI-Powered Shop Builder for Indian Retailers",
  description:
    "Create your online shop in minutes using AI. Speak in any of 22 Indian languages. No coding needed. Built for Indian shopkeepers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-gray-900" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
