"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { subscribeToUserRequests, subscribeToAllRequests } from "@/lib/firestore";
import type { AnalysisRequest } from "@/types";

export function useMyReports() {
  const { appUser } = useAuth();
  const [reports, setReports] = useState<AnalysisRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!appUser) return;
    const unsub = subscribeToUserRequests(appUser.uid, (reqs) => {
      setReports(reqs);
      setLoading(false);
    });
    return () => unsub();
  }, [appUser]);

  return { reports, loading };
}

export function useAllReports() {
  const [reports, setReports] = useState<AnalysisRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToAllRequests((reqs) => {
      setReports(reqs);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { reports, loading };
}
