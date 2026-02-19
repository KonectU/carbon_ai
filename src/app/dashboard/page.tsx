"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AssumptionsPanel from "@/components/AssumptionsPanel";
import DashboardCharts from "@/components/DashboardCharts";
import AIAnalysisSection from "@/components/AIAnalysisSection";

type ScanResult = {
  energy_kWh: number;
  carbon_kg: number;
  assumptions: string[];
  metrics?: {
    visitedUrl?: string;
    pagesScanned?: number;
    pagesVisited?: string[];
    pageWeightKB?: number;
    domNodes?: number;
    jsExecutionMs?: number;
  };
  aiReport?: {
    summary: string;
    detailedAnalysis: string;
  };
  recommendations: Array<{
    title: string;
    description?: string;
    estimatedReductionPercent: number;
    effort: "low" | "medium" | "high";
  }>;
};

type AiScanResult = {
  energy_kWh: number;
  carbon_kg: number;
  assumptions: string[];
};

type ScanStatus = "QUEUED" | "VISITING" | "ANALYZING" | "COMPLETED" | "FAILED";

const COST_PER_KWH = 0.12;

export default function DashboardPage() {
  const router = useRouter();
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [aiScanResult, setAiScanResult] = useState<AiScanResult | null>(null);
  const [websiteStatus, setWebsiteStatus] = useState<ScanStatus | null>(null);
  const [websiteError, setWebsiteError] = useState("");
  const [aiStatus, setAiStatus] = useState<ScanStatus | null>(null);
  const [aiError, setAiError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLatest = async () => {
      try {
        const response = await fetch("/api/scans/latest");
        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (response.ok) {
          const payload = await response.json();
          console.log('🔍 Dashboard Data:', payload); // DEBUG
          
          if (payload.website) {
            console.log('📊 Website Result:', payload.website.result); // DEBUG
            setWebsiteStatus(payload.website.status ?? null);
            setWebsiteError(payload.website.errorMessage ?? "");
            if (payload.website.status === "COMPLETED") {
              const result = {
                ...payload.website.result,
                assumptions: payload.website.assumptions ?? [],
              };
              console.log('✅ Setting Scan Result:', result); // DEBUG
              console.log('🤖 AI Report:', result.aiReport); // DEBUG
              setScanResult(result);
            } else {
              setScanResult(null);
            }
          }

          if (payload.ai) {
            setAiStatus(payload.ai.status ?? null);
            setAiError(payload.ai.errorMessage ?? "");
            if (payload.ai.status === "COMPLETED") {
              setAiScanResult({
                ...payload.ai.result,
                assumptions: payload.ai.assumptions ?? [],
              });
            } else {
              setAiScanResult(null);
            }
          }
        }
      } catch {
        const storedWebsite = localStorage.getItem("websiteScanResult");
        const storedAi = localStorage.getItem("aiScanResult");

        if (storedWebsite) {
          try {
            const parsed = JSON.parse(storedWebsite) as ScanResult;
            setScanResult(parsed);
          } catch {
            setScanResult(null);
          }
        }

        if (storedAi) {
          try {
            const parsedAi = JSON.parse(storedAi) as AiScanResult;
            setAiScanResult(parsedAi);
          } catch {
            setAiScanResult(null);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadLatest();

    const interval = setInterval(loadLatest, 2000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white text-zinc-900">
        <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-16 sm:px-10">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
              Dashboard
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Loading results
            </h1>
            <p className="max-w-2xl text-base text-zinc-600">
              Retrieving the latest estimates for this session.
            </p>
          </div>

          <section className="mt-10 grid gap-6 sm:grid-cols-3">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="rounded-2xl border border-zinc-200 p-6"
              >
                <div className="h-4 w-24 rounded bg-zinc-200/80 animate-pulse" />
                <div className="mt-4 h-8 w-32 rounded bg-zinc-200/80 animate-pulse" />
                <div className="mt-3 h-3 w-20 rounded bg-zinc-200/80 animate-pulse" />
              </div>
            ))}
          </section>

          <section className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
            <div className="h-4 w-32 rounded bg-zinc-200/80 animate-pulse" />
            <div className="mt-4 h-3 w-full rounded bg-zinc-200/80 animate-pulse" />
            <div className="mt-2 h-3 w-5/6 rounded bg-zinc-200/80 animate-pulse" />
            <div className="mt-6 space-y-2">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className="h-3 w-4/5 rounded bg-zinc-200/80 animate-pulse"
                />
              ))}
            </div>
          </section>

          <section className="mt-10 rounded-2xl border border-zinc-200 p-6">
            <div className="h-4 w-40 rounded bg-zinc-200/80 animate-pulse" />
            <div className="mt-4 space-y-3">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className="h-16 rounded-xl bg-zinc-100 animate-pulse"
                />
              ))}
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (!scanResult && !aiScanResult) {
    return (
      <div className="min-h-screen bg-white text-zinc-900">
        <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-6 py-16 text-center sm:px-10">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
            Dashboard
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            No results available
          </h1>
          <p className="mt-3 max-w-xl text-base text-zinc-600">
            Run a website or AI model scan to generate lower-bound estimates.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition hover:bg-zinc-800"
              href="/scan"
            >
              Run website scan
            </a>
            <a
              className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-300 px-6 text-sm font-medium text-zinc-700 transition hover:border-zinc-400"
              href="/scan/ai"
            >
              Run AI scan
            </a>
          </div>
        </main>
      </div>
    );
  }

  const estimatedCost = scanResult
    ? Number((scanResult.energy_kWh * COST_PER_KWH).toFixed(4))
    : null;
  const formattedEnergy =
    scanResult?.energy_kWh !== undefined
      ? scanResult.energy_kWh.toFixed(6)
      : null;
  const formattedCarbon =
    scanResult?.carbon_kg !== undefined
      ? scanResult.carbon_kg.toFixed(6)
      : null;
  const visitedUrl = scanResult?.metrics?.visitedUrl ?? null;
  const pagesScanned = scanResult?.metrics?.pagesScanned ?? null;
  const pagesVisited = scanResult?.metrics?.pagesVisited ?? [];
  const websiteCarbon = scanResult?.carbon_kg ?? null;
  const aiCarbon = aiScanResult?.carbon_kg ?? null;

  const keyInsight = (() => {
    if (websiteCarbon !== null && aiCarbon !== null) {
      return aiCarbon > websiteCarbon
        ? "Largest impact appears to come from AI inference; prioritize precision and request volume."
        : "Largest impact appears to come from website delivery; prioritize images and page weight.";
    }

    if (websiteCarbon !== null) {
      return "Largest impact appears to come from website delivery; prioritize images and page weight.";
    }

    if (aiCarbon !== null) {
      return "Largest impact appears to come from AI inference; prioritize precision and request volume.";
    }

    return "Largest impact varies by workload; start with the highest data transfer or inference volume.";
  })();

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-16 sm:px-10">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-600 animate-pulse">
                Dashboard
              </p>
              <h1 className="mt-2 text-4xl font-black tracking-tight text-zinc-900 sm:text-5xl bg-gradient-to-r from-zinc-900 to-zinc-600 bg-clip-text">
                Carbon Estimation Dashboard
              </h1>
            </div>
          </div>
          <p className="max-w-2xl text-base text-zinc-600 font-medium">
            Values below are lower-bound estimates with documented assumptions.
          </p>
        </div>

        <section className="mt-10 rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-8 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-200 p-2">
                <svg className="h-6 w-6 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-emerald-900 tracking-tight">📊 Digital Carbon Snapshot</h2>
            </div>
            <p className="text-sm text-emerald-700 font-medium">
              Directional summary of conservative, model-based estimates.
            </p>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div className="group rounded-2xl border-2 border-emerald-200 bg-white p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🌐</span>
                <p className="text-xs uppercase tracking-[0.2em] font-bold text-emerald-600">
                  Website
                </p>
              </div>
              <p className="mt-4 text-3xl font-black text-zinc-900 group-hover:text-emerald-600 transition-colors duration-300">
                {websiteCarbon !== null
                  ? `${websiteCarbon} kg`
                  : "Not available"}
              </p>
              <p className="mt-1 text-sm font-semibold text-zinc-600">CO₂e / month</p>
            </div>
            <div className="group rounded-2xl border-2 border-emerald-200 bg-white p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🤖</span>
                <p className="text-xs uppercase tracking-[0.2em] font-bold text-emerald-600">
                  AI inference
                </p>
              </div>
              <p className="mt-4 text-3xl font-black text-zinc-900 group-hover:text-emerald-600 transition-colors duration-300">
                {aiCarbon !== null
                  ? `${aiCarbon} kg`
                  : "Not available"}
              </p>
              <p className="mt-1 text-sm font-semibold text-zinc-600">CO₂e / month</p>
            </div>
          </div>
          <div className="mt-6 rounded-xl bg-white border-2 border-emerald-200 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <p className="text-sm font-bold text-zinc-800">Key insight:</p>
                <p className="mt-1 text-sm text-zinc-700 font-medium">{keyInsight}</p>
              </div>
            </div>
          </div>
        </section>

        {(websiteStatus && websiteStatus !== "COMPLETED") ||
        (aiStatus && aiStatus !== "COMPLETED") ? (
          <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-zinc-900">
              Scan in progress
            </h2>
            <p className="mt-2 text-sm text-zinc-600">
              {websiteStatus && websiteStatus !== "COMPLETED"
                ? `Website scan status: ${websiteStatus.toLowerCase()}.`
                : null}{" "}
              {aiStatus && aiStatus !== "COMPLETED"
                ? `AI scan status: ${aiStatus.toLowerCase()}.`
                : null}
            </p>
            {(websiteStatus === "FAILED" && websiteError) ||
            (aiStatus === "FAILED" && aiError) ? (
              <p className="mt-2 text-sm text-red-600">
                {websiteError || aiError}
              </p>
            ) : null}
          </section>
        ) : null}

        {scanResult && (
          <>
            <section className="mt-10">
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold">
                  Website Delivery Footprint
                </h2>
                <p className="text-sm text-zinc-600">
                  Includes page transfer, DOM complexity, and JS execution;
                  excludes hosting infrastructure and end-user devices.
                </p>
              </div>
              <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                      Proof of visit
                    </p>
                    <p className="mt-1 text-sm text-zinc-700 break-all">
                      {visitedUrl ? (
                        <a
                          className="underline decoration-zinc-300 underline-offset-4 hover:text-emerald-600"
                          href={visitedUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {visitedUrl}
                        </a>
                      ) : (
                        "Not available yet"
                      )}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 text-xs text-zinc-500">
                    <span>
                      Pages scanned:{" "}
                      {pagesScanned !== null ? pagesScanned : "—"}
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-zinc-500">
                  We crawl a configurable portion of the site with guardrails.
                </p>
              </div>
              {pagesVisited.length > 0 && (
                <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                    Pages scanned (top 10)
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-zinc-600">
                    {pagesVisited.slice(0, 10).map((page) => (
                      <li key={page} className="break-all">{page.replace(/^https?:\/\//, "")}</li>
                    ))}
                  </ul>
                  {pagesVisited.length > 10 && (
                    <details className="mt-3 text-xs text-zinc-500">
                      <summary className="cursor-pointer">
                        Show all pages
                      </summary>
                      <ul className="mt-2 space-y-1">
                        {pagesVisited.map((page) => (
                          <li key={page} className="break-all">
                            {page.replace(/^https?:\/\//, "")}
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              )}
              <div className="mt-6 grid gap-6 sm:grid-cols-3">
                <div className="group rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">⚡</span>
                    <p className="text-sm font-bold text-blue-700 uppercase tracking-wide">Energy usage</p>
                  </div>
                  <p className="text-4xl font-black text-blue-900 group-hover:scale-110 transition-transform duration-300">
                    {formattedEnergy}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-blue-700">kWh per month</p>
                </div>
                <div className="group rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">🌍</span>
                    <p className="text-sm font-bold text-emerald-700 uppercase tracking-wide">Carbon emissions</p>
                  </div>
                  <p className="text-4xl font-black text-emerald-900 group-hover:scale-110 transition-transform duration-300">
                    {formattedCarbon}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-emerald-700">kg CO₂e per month</p>
                </div>
                <div className="group rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">💰</span>
                    <p className="text-sm font-bold text-amber-700 uppercase tracking-wide">Estimated cost</p>
                  </div>
                  <p className="text-4xl font-black text-amber-900 group-hover:scale-110 transition-transform duration-300">
                    ${estimatedCost}
                  </p>
                  <p className="mt-2 text-xs text-amber-700 font-medium">
                    Rounded for display; very small values can appear as $0.00.
                  </p>
                  <p className="mt-1 text-sm font-semibold text-amber-700">per month</p>
                </div>
              </div>
            </section>

            {/* Charts Section */}
            {scanResult.metrics && (
              <DashboardCharts
                pageWeightKB={scanResult.metrics.pageWeightKB || 0}
                domNodes={scanResult.metrics.domNodes || 0}
                jsExecutionMs={scanResult.metrics.jsExecutionMs || 0}
                energy_kWh={scanResult.energy_kWh}
                carbon_kg={scanResult.carbon_kg}
                recommendations={scanResult.recommendations}
              />
            )}

            <section className="mt-8">
              <AssumptionsPanel assumptions={scanResult.assumptions} />
            </section>

            {scanResult.aiReport && scanResult.metrics && (
              <AIAnalysisSection
                summary={scanResult.aiReport.summary}
                detailedAnalysis={scanResult.aiReport.detailedAnalysis}
                metrics={{
                  pageWeightKB: scanResult.metrics.pageWeightKB || 0,
                  domNodes: scanResult.metrics.domNodes || 0,
                  jsExecutionMs: scanResult.metrics.jsExecutionMs || 0,
                }}
                energy_kWh={scanResult.energy_kWh}
                carbon_kg={scanResult.carbon_kg}
              />
            )}

            <section className="mt-10 rounded-2xl border border-zinc-200 p-6">
              <h2 className="text-lg font-semibold">
                Optimization recommendations
              </h2>
              <ul className="mt-4 space-y-4">
                {scanResult.recommendations.map((item) => (
                  <li
                    key={item.title}
                    className="rounded-xl border border-zinc-100 bg-zinc-50 p-4"
                  >
                    <p className="text-sm font-semibold text-zinc-900">
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="mt-2 text-sm text-zinc-600">
                        {item.description}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-zinc-600">
                      {item.estimatedReductionPercent}% estimated reduction
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Potential impact: ~{item.estimatedReductionPercent}%
                      reduction (estimate)
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-zinc-400">
                      Effort: {item.effort}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}

        {aiScanResult && (
          <section className="mt-10 rounded-2xl border border-zinc-200 p-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold">AI Inference Footprint</h2>
              <p className="text-sm text-zinc-600">
                Includes inference energy based on provided inputs; excludes
                training, idle capacity, and broader infrastructure.
              </p>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
                <p className="text-sm text-zinc-500">Energy usage</p>
                <p className="mt-2 text-2xl font-semibold">
                  {aiScanResult.energy_kWh} kWh
                </p>
                <p className="mt-1 text-xs text-zinc-500">per month</p>
              </div>
              <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
                <p className="text-sm text-zinc-500">Carbon emissions</p>
                <p className="mt-2 text-2xl font-semibold">
                  {aiScanResult.carbon_kg} kg CO2e
                </p>
                <p className="mt-1 text-xs text-zinc-500">per month</p>
              </div>
            </div>
            <div className="mt-6">
              <AssumptionsPanel
                assumptions={aiScanResult.assumptions}
                title="AI inference assumptions"
              />
            </div>
          </section>
        )}

        <section className="mt-12">
          <details className="rounded-2xl border border-zinc-200 bg-white p-6">
            <summary className="cursor-pointer text-sm font-semibold text-zinc-900">
              Methodology Summary
            </summary>
            <div className="mt-4 space-y-2 text-sm text-zinc-600">
              <p>Model-based estimation using conservative inputs.</p>
              <p>Lower-bound assumptions to avoid overstatement.</p>
              <p>No real-time metering or direct power measurement.</p>
              <p>Designed to support optimization decisions, not billing.</p>
            </div>
          </details>
        </section>
      </main>
    </div>
  );
}
