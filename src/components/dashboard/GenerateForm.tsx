"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/components/auth/AuthProvider";
import { useQuota } from "@/hooks/useQuota";
import { createAnalysisRequest, incrementDailyUsage } from "@/lib/firestore";
import { triggerAnalysis } from "@/lib/api";
import TickerSearch from "./TickerSearch";
import ModeCards from "./ModeCards";
import type { AnalysisMode } from "@/types";

export default function GenerateForm() {
  const { appUser } = useAuth();
  const { exhausted, refresh } = useQuota();
  const [ticker, setTicker] = useState("");
  const [mode, setMode] = useState<AnalysisMode>("full_report");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appUser || !ticker.trim()) return;

    if (exhausted) {
      setError("Daily limit reached. Try again tomorrow.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    const requestId = uuidv4();

    try {
      await createAnalysisRequest(
        requestId,
        appUser.uid,
        appUser.email,
        ticker.trim(),
        mode,
      );
      await incrementDailyUsage(appUser.uid, requestId);

      await triggerAnalysis({
        ticker: ticker.trim().toUpperCase(),
        mode,
        userId: appUser.uid,
        requestId,
      });

      setTicker("");
      setSuccess(true);
      await refresh();
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6">
        <h2 className="mb-6 text-lg font-semibold text-white">Generate Report</h2>

        <div className="space-y-6">
          <TickerSearch value={ticker} onChange={setTicker} />
          <ModeCards selected={mode} onChange={setMode} />
        </div>

        <div className="mt-6 flex items-center gap-4">
          <button
            type="submit"
            disabled={submitting || !ticker.trim() || exhausted}
            className="rounded-xl bg-emerald-600 px-8 py-3 text-sm font-medium text-white transition-all hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Submitting...
              </span>
            ) : (
              "Generate Report"
            )}
          </button>

          {exhausted && (
            <p className="text-sm text-red-400">Daily limit reached</p>
          )}
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}

        {success && (
          <p className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-400">
            Report generation started! Our AI agents are working on it. Come back in 10-15 minutes.
          </p>
        )}
      </div>
    </form>
  );
}
