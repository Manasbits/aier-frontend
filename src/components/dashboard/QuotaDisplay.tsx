"use client";

import { useQuota } from "@/hooks/useQuota";

export default function QuotaDisplay() {
  const { used, limit, remaining, loading } = useQuota();

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <div className="h-4 w-20 animate-pulse rounded bg-gray-800" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1">
        {Array.from({ length: limit }).map((_, i) => (
          <div
            key={i}
            className={`h-2 w-5 rounded-full transition-colors ${
              i < used ? "bg-emerald-500" : "bg-gray-700"
            }`}
          />
        ))}
      </div>
      <span className="text-sm text-gray-400">
        <span className={remaining === 0 ? "text-red-400" : "text-emerald-400"}>
          {remaining}
        </span>
        /{limit} remaining today
      </span>
    </div>
  );
}
