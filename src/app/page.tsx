"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { firebaseUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (firebaseUser) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [loading, firebaseUser, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-[#0a0a0f]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
    </div>
  );
}
