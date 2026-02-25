"use client";

import { useAuth } from "./AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import PendingApproval from "./PendingApproval";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { firebaseUser, appUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.replace("/login");
    }
  }, [loading, firebaseUser, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0f]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!firebaseUser || !appUser) return null;

  if (appUser.status === "pending") {
    return <PendingApproval user={appUser} />;
  }

  if (appUser.status === "rejected") {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#0a0a0f] px-6 text-center">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 max-w-md">
          <h2 className="text-xl font-semibold text-red-400 mb-3">Access Denied</h2>
          <p className="text-gray-400 text-sm">
            Your account has been rejected. Contact the administrator for more information.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
