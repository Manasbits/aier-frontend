"use client";

import { useEffect, useRef, useState } from "react";
import { fetchTickers } from "@/lib/api";

interface TickerSearchProps {
  value: string;
  onChange: (ticker: string) => void;
}

export default function TickerSearch({ value, onChange }: TickerSearchProps) {
  const [allTickers, setAllTickers] = useState<string[]>([]);
  const [filtered, setFiltered] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTickers()
      .then(setAllTickers)
      .catch(() => setLoadError(true));
  }, []);

  useEffect(() => {
    if (!value) {
      setFiltered(allTickers.slice(0, 50));
      return;
    }
    const q = value.toUpperCase();
    setFiltered(
      allTickers.filter((t) => t.includes(q)).slice(0, 50),
    );
  }, [value, allTickers]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <label className="mb-2 block text-sm font-medium text-gray-300">
        Stock Ticker
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value.toUpperCase());
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={loadError ? "Type ticker (e.g. RELIANCE)" : "Search ticker..."}
        className="w-full rounded-lg border border-gray-700 bg-gray-800/60 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
      />

      {open && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-700 bg-gray-900 shadow-xl">
          {filtered.map((t) => (
            <li key={t}>
              <button
                type="button"
                onClick={() => {
                  onChange(t);
                  setOpen(false);
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
              >
                {t}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
