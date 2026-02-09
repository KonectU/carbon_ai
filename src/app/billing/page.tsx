"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BillingPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  const handleCheckout = async () => {
    setStatus("loading");
    setError("");

    try {
      const response = await fetch("/api/billing/checkout", { method: "POST" });
      if (response.status === 401) {
        router.push("/login");
        return;
      }
      if (!response.ok) {
        throw new Error("Checkout failed");
      }
      const payload = await response.json();
      if (payload.url) {
        window.location.href = payload.url;
        return;
      }
      throw new Error("Missing checkout URL");
    } catch (err) {
      setStatus("error");
      setError("We could not start billing checkout. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-16 sm:px-10">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
            Billing
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Upgrade to Pro
          </h1>
          <p className="text-base text-zinc-600">
            Unlock higher monthly scan limits for production use.
          </p>
        </div>

        <div className="mt-10 rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h2 className="text-lg font-semibold">Pro plan</h2>
              <p className="mt-2 text-sm text-zinc-600">
                50 scans per month across website and AI assessments.
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold">$—</p>
              <p className="text-xs text-zinc-500">per month</p>
            </div>
          </div>

          <button
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
            onClick={handleCheckout}
            disabled={status === "loading"}
          >
            {status === "loading" ? "Redirecting..." : "Start subscription"}
          </button>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </div>
      </main>
    </div>
  );
}
