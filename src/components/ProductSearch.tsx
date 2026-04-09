"use client";
import { useState, useRef, useEffect } from "react";
import { Product } from "@/types";

interface ProductSearchProps {
  products: Product[];
  selectedProductId?: string;
  onSelect: (product: Product | null) => void;
  placeholder?: string;
}

export default function ProductSearch({
  products,
  selectedProductId,
  onSelect,
  placeholder = "Search product...",
}: ProductSearchProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = products.find((p) => p.id === selectedProductId);

  const filtered = query.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase())
      )
    : products;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (product: Product) => {
    onSelect(product);
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        className="flex items-center border border-gray-300 rounded-xl px-3 py-2.5 cursor-pointer hover:border-orange-400 focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500 bg-white"
        onClick={() => setOpen(true)}
      >
        {selected && !open ? (
          <div className="flex-1 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 truncate">{selected.name}</p>
              <p className="text-xs text-gray-500">₹{selected.price} · {selected.category}</p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(null);
                setOpen(false);
              }}
              className="ml-2 text-gray-400 hover:text-gray-600 text-lg leading-none"
              title="Clear selection"
            >
              ×
            </button>
          </div>
        ) : (
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder={selected ? selected.name : placeholder}
            className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400"
            autoComplete="off"
          />
        )}
      </div>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-400 text-center">
              No products found
            </div>
          ) : (
            filtered.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => handleSelect(product)}
                className="w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors flex items-center justify-between group"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 group-hover:text-orange-700">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-500">{product.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-orange-600">₹{product.price}</p>
                  {product.stock < 5 && (
                    <p className="text-xs text-red-500">Low stock: {product.stock}</p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
