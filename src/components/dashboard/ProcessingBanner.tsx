"use client";

import type { AnalysisRequest } from "@/types";
import { MODE_INFO } from "@/types";

interface ProcessingBannerProps {
  requests: AnalysisRequest[];
}

export default function ProcessingBanner({ requests }: ProcessingBannerProps) {
  const processing = requests.filter((r) => r.status === "processing");

  if (processing.length === 0) return null;

  return (
    <div className="space-y-3">
      {processing.map((req) => (
        <div
          key={req.id}
          className="flex items-center gap-4 rounded-xl border border-amber-500/20 bg-amber-500/5 px-5 py-4"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-amber-200">
              {req.ticker} &mdash; {MODE_INFO[req.mode]?.label ?? req.mode}
            </p>
            <p className="mt-0.5 text-xs text-gray-400">
              Our AI agents are working on your report. Come back in 10-15 minutes &mdash; it&apos;ll be ready, or you can browse previous reports below.
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
