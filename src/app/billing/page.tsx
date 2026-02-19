"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function BillingPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard since everything is free now
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white text-zinc-900 flex items-center justify-center">
      <div className="text-center p-8">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 mb-6">
          <svg className="h-10 w-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 mb-3">
          Everything is Free! 🎉
        </h1>
        <p className="text-lg text-zinc-600 mb-6">
          Unlimited scans for everyone. No payment required.
        </p>
        <p className="text-sm text-zinc-500">
          Redirecting to dashboard...
        </p>
      </div>
    </div>
  );
}
