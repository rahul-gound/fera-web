"use client";
import { useState, useRef, useEffect } from "react";
import { SUPPORTED_LANGUAGES } from "@/lib/plans";

interface LanguageSelectorProps {
  value: string;
  onChange: (code: string) => void;
  compact?: boolean;
}

export default function LanguageSelector({ value, onChange, compact = false }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const current = SUPPORTED_LANGUAGES.find((l) => l.code === value) || SUPPORTED_LANGUAGES[0];

  const filtered = search.trim()
    ? SUPPORTED_LANGUAGES.filter(
        (l) =>
          l.name.toLowerCase().includes(search.toLowerCase()) ||
          l.native.includes(search)
      )
    : SUPPORTED_LANGUAGES;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 rounded-xl border border-gray-200 hover:border-orange-400 transition-colors bg-white ${
          compact ? "px-2 py-1.5 text-xs" : "px-3 py-2 text-sm"
        }`}
        title="Change language"
      >
        <span>🌐</span>
        <span className="font-medium text-gray-700">{current.native}</span>
        <span className="text-gray-400">▾</span>
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search language..."
              className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-orange-400"
              autoFocus
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filtered.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  onChange(lang.code);
                  setOpen(false);
                  setSearch("");
                }}
                className={`w-full text-left px-3 py-2 hover:bg-orange-50 transition-colors flex items-center justify-between ${
                  lang.code === value ? "bg-orange-50 text-orange-700" : "text-gray-700"
                }`}
              >
                <span className="text-sm font-medium">{lang.native}</span>
                <span className="text-xs text-gray-400">{lang.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
