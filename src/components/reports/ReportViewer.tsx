"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import type { AnalysisRequest } from "@/types";
import { MODE_INFO } from "@/types";
import PdfDownload from "./PdfDownload";

interface ReportViewerProps {
  reportId: string;
}

export default function ReportViewer({ reportId }: ReportViewerProps) {
  const [report, setReport] = useState<AnalysisRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(getFirebaseDb(), "requests", reportId));
        if (!snap.exists()) {
          setError("Report not found");
          return;
        }
        const data = snap.data();
        setReport({
          id: snap.id,
          userId: data.userId ?? "",
          userEmail: data.userEmail ?? "",
          ticker: data.ticker ?? "",
          mode: data.mode ?? "full_report",
          status: data.status ?? "processing",
          reportUrl: data.reportUrl ?? null,
          reportFilename: data.reportFilename ?? null,
          errorDetail: data.errorDetail ?? null,
          createdAt: data.createdAt?.toDate?.() ?? null,
          completedAt: data.completedAt?.toDate?.() ?? null,
        });
      } catch {
        setError("Failed to load report");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [reportId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0f]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#0a0a0f] gap-4">
        <p className="text-gray-400">{error || "Report not found"}</p>
        <Link href="/dashboard" className="text-sm text-emerald-400 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (report.status === "processing") {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#0a0a0f] gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
        <p className="text-amber-300">Report is still being generated...</p>
        <p className="text-sm text-gray-500">Come back in a few minutes.</p>
        <Link href="/dashboard" className="mt-2 text-sm text-emerald-400 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (report.status === "failed") {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#0a0a0f] gap-4">
        <p className="text-red-400">Report generation failed</p>
        {report.errorDetail && (
          <p className="max-w-md text-center text-sm text-gray-500">{report.errorDetail}</p>
        )}
        <Link href="/dashboard" className="mt-2 text-sm text-emerald-400 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const modeLabel = MODE_INFO[report.mode]?.label ?? report.mode;

  return (
    <div className="flex h-screen flex-col bg-[#0a0a0f]">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-800/60 bg-[#0a0a0f]/90 px-4 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-lg border border-gray-700/50 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:border-gray-600 hover:text-gray-200"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Dashboard
          </Link>
          <div>
            <span className="text-sm font-semibold text-white">{report.ticker}</span>
            <span className="mx-2 text-gray-600">/</span>
            <span className="text-sm text-gray-400">{modeLabel}</span>
          </div>
        </div>

        {report.reportUrl && (
          <PdfDownload
            reportUrl={report.reportUrl}
            filename={report.reportFilename || `${report.ticker}_${report.mode}.pdf`}
          />
        )}
      </header>

      {/* Iframe */}
      <div className="flex-1 overflow-hidden">
        {report.reportUrl ? (
          <iframe
            src={report.reportUrl}
            className="h-full w-full border-0 bg-white"
            title={`${report.ticker} ${modeLabel} Report`}
            sandbox="allow-same-origin allow-scripts"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-500">Report URL not available</p>
          </div>
        )}
      </div>
    </div>
  );
}
