"use client";

interface QRCodeProps {
  value: string;
  size?: number;
}

// Simple QR code display component
// Uses a free QR code API for rendering
export default function QRCode({ value, size = 150 }: QRCodeProps) {
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`;
  
  return (
    <div className="inline-flex flex-col items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`QR Code for: ${value}`}
        width={size}
        height={size}
        className="rounded-lg border border-gray-200 p-1 bg-white"
      />
      <p className="text-xs text-gray-500 max-w-[150px] text-center truncate">{value}</p>
    </div>
  );
}
