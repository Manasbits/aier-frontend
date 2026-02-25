"use client";

import { use } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import ReportViewer from "@/components/reports/ReportViewer";

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <AuthGuard>
      <ReportViewer reportId={id} />
    </AuthGuard>
  );
}
