"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import QuotaDisplay from "@/components/dashboard/QuotaDisplay";
import GenerateForm from "@/components/dashboard/GenerateForm";
import ProcessingBanner from "@/components/dashboard/ProcessingBanner";
import MyReports from "@/components/reports/MyReports";
import AllReports from "@/components/reports/AllReports";
import { useMyReports } from "@/hooks/useReports";
import Image from "next/image";

export default function DashboardPage() {
  const { appUser, logout } = useAuth();
  const { reports } = useMyReports();

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-gray-800/60 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
              <span className="text-sm font-bold text-emerald-400">AI</span>
            </div>
            <span className="text-sm font-semibold text-white tracking-wide">AIER</span>
          </div>

          <div className="flex items-center gap-6">
            <QuotaDisplay />

            <div className="flex items-center gap-3">
              {appUser?.photoURL && (
                <Image
                  src={appUser.photoURL}
                  alt=""
                  width={32}
                  height={32}
                  className="rounded-full ring-1 ring-gray-700"
                />
              )}
              <span className="hidden text-sm text-gray-400 sm:block">
                {appUser?.displayName || appUser?.email}
              </span>
              <button
                onClick={logout}
                className="rounded-lg border border-gray-700/50 px-3 py-1.5 text-xs text-gray-500 transition-colors hover:border-gray-600 hover:text-gray-300"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-6 py-8 space-y-10">
        {/* Generate form */}
        <GenerateForm />

        {/* Processing banners */}
        <ProcessingBanner requests={reports} />

        {/* My reports */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-white">My Reports</h2>
          <MyReports />
        </section>

        {/* All reports */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-white">All Reports</h2>
          <AllReports />
        </section>
      </main>
    </div>
  );
}
