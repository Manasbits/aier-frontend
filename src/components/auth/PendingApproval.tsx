"use client";

import { useAuth } from "./AuthProvider";
import type { AppUser } from "@/types";

export default function PendingApproval({ user }: { user: AppUser }) {
  const { logout } = useAuth();

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#0a0a0f] px-6 text-center">
      <div className="max-w-md space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/10 ring-1 ring-amber-500/30">
          <svg className="h-10 w-10 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white">Pending Approval</h1>

        <p className="text-gray-400 leading-relaxed">
          Your account <span className="text-gray-200 font-medium">{user.email}</span> is
          awaiting admin approval. You&apos;ll get access once approved.
        </p>

        <button
          onClick={logout}
          className="mt-4 rounded-lg border border-gray-700 px-6 py-2.5 text-sm text-gray-300 transition-colors hover:border-gray-500 hover:text-white"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
