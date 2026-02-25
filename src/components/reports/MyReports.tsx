"use client";

import { useMyReports } from "@/hooks/useReports";
import ReportCard from "./ReportCard";

export default function MyReports() {
  const { reports, loading } = useMyReports();

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-800/30" />
        ))}
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-800 py-12 text-center">
        <p className="text-sm text-gray-500">No reports yet. Generate your first report above.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reports.map((r) => (
        <ReportCard key={r.id} report={r} />
      ))}
    </div>
  );
}
