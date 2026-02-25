"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { getDailyUsage } from "@/lib/firestore";

export function useQuota() {
  const { appUser } = useAuth();
  const [used, setUsed] = useState(0);
  const [loading, setLoading] = useState(true);

  const limit = appUser?.dailyLimit ?? 3;
  const remaining = Math.max(0, limit - used);
  const exhausted = remaining <= 0;

  const refresh = async () => {
    if (!appUser) return;
    setLoading(true);
    try {
      const count = await getDailyUsage(appUser.uid);
      setUsed(count);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appUser?.uid]);

  return { used, limit, remaining, exhausted, loading, refresh };
}
