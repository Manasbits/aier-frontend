"use client";

import Link from "next/link";
import type { AnalysisRequest } from "@/types";
import { MODE_INFO } from "@/types";

interface ReportCardProps {
  report: AnalysisRequest;
}

function formatDate(date: Date | null): string {
  if (!date) return "Just now";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  processing: { bg: "bg-amber-500/10", text: "text-amber-400", label: "Processing" },
  completed: { bg: "bg-emerald-500/10", text: "text-emerald-400", label: "Completed" },
  failed: { bg: "bg-red-500/10", text: "text-red-400", label: "Failed" },
};

export default function ReportCard({ report }: ReportCardProps) {
  const style = statusStyles[report.status] ?? statusStyles.processing;
  const modeLabel = MODE_INFO[report.mode]?.label ?? report.mode;

  return (
    <div className="group rounded-xl border border-gray-800 bg-gray-900/40 p-5 transition-all hover:border-gray-700 hover:bg-gray-900/60">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-semibold text-white">{report.ticker}</h3>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}>
              {style.label}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">{modeLabel}</p>
          <p className="mt-1 text-xs text-gray-600">{formatDate(report.createdAt)}</p>
          {report.status === "failed" && report.errorDetail && (
            <p className="mt-2 text-xs text-red-400/80">{report.errorDetail}</p>
          )}
        </div>

        {report.status === "completed" && (
          <div className="flex shrink-0 gap-2">
            <Link
              href={`/reports/${report.id}`}
              className="rounded-lg border border-gray-700 px-4 py-2 text-xs font-medium text-gray-300 transition-colors hover:border-emerald-500/50 hover:text-emerald-400"
            >
              View
            </Link>
          </div>
        )}

        {report.status === "processing" && (
          <div className="shrink-0">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
          </div>
        )}
      </div>
    </div>
  );
}
