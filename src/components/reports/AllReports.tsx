"use client";

import { useAllReports } from "@/hooks/useReports";
import ReportCard from "./ReportCard";

export default function AllReports() {
  const { reports, loading } = useAllReports();
  const completed = reports.filter((r) => r.status === "completed");

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-800/30" />
        ))}
      </div>
    );
  }

  if (completed.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-800 py-12 text-center">
        <p className="text-sm text-gray-500">No reports available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {completed.map((r) => (
        <ReportCard key={r.id} report={r} />
      ))}
    </div>
  );
}
