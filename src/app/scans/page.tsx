"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ScanItem = {
  id: string;
  type: "WEBSITE" | "AI";
  status: "QUEUED" | "VISITING" | "ANALYZING" | "COMPLETED" | "FAILED";
  createdAt: string;
  carbon_kg: number | null;
  energy_kWh: number | null;
};

export default function ScansPage() {
  const router = useRouter();
  const [items, setItems] = useState<ScanItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/scans");
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        if (!response.ok) {
          throw new Error("Failed");
        }
        const payload = await response.json();
        setItems(payload.items ?? []);
      } catch {
        setError("Unable to load scan history.");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-16 sm:px-10">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
            Scan history
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Past assessments
          </h1>
          <p className="text-base text-zinc-600">
            Review recent website and AI inference scans by date and type.
          </p>
        </div>

        {isLoading && (
          <div className="mt-10 space-y-3">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className="h-16 rounded-2xl border border-zinc-200 bg-zinc-50 animate-pulse"
              />
            ))}
          </div>
        )}

        {!isLoading && error && (
          <p className="mt-8 text-sm text-red-600">{error}</p>
        )}

        {!isLoading && !error && items.length === 0 && (
          <div className="mt-10 rounded-2xl border border-zinc-200 p-8 text-center">
            <p className="text-sm text-zinc-600">
              No scans yet. Run a website or AI scan to populate history.
            </p>
          </div>
        )}

        {!isLoading && !error && items.length > 0 && (
          <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-200">
            <div className="grid grid-cols-4 border-b border-zinc-200 bg-zinc-50 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              <span>Type</span>
              <span>Status</span>
              <span>Carbon</span>
              <span>Date</span>
            </div>
            <ul className="divide-y divide-zinc-200">
              {items.map((scan) => (
                <li key={scan.id} className="grid grid-cols-4 px-6 py-4 text-sm">
                  <span>{scan.type === "WEBSITE" ? "Website" : "AI model"}</span>
                  <span className="capitalize text-zinc-600">
                    {scan.status.toLowerCase()}
                  </span>
                  <span className="text-zinc-600">
                    {scan.carbon_kg !== null
                      ? `${scan.carbon_kg} kg`
                      : "—"}
                  </span>
                  <span className="text-zinc-500">
                    {new Date(scan.createdAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
