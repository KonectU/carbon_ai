 "use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ScanPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [region, setRegion] = useState("us-east-1");
  const [status, setStatus] = useState<
    | "idle"
    | "submitting"
    | "queued"
    | "visiting"
    | "analyzing"
    | "completed"
    | "failed"
  >("idle");
  const [showDemo, setShowDemo] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [progress, setProgress] = useState<{
    pagesScanned: number;
    pagesTotal: number;
    currentUrl: string;
  } | null>(null);

  const statusSteps = [
    { key: "queued", label: "Queued" },
    { key: "visiting", label: "Visiting site" },
    { key: "analyzing", label: "Analyzing" },
    { key: "completed", label: "Completed" },
  ] as const;

  const normalizeUrl = (input: string) => {
    if (!input.startsWith("http://") && !input.startsWith("https://")) {
      return `https://${input}`;
    }
    return input;
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setShowDemo(params.get("demo") === "1");
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const normalizedUrl = normalizeUrl(url.trim());
      window.open(normalizedUrl, "_blank", "noopener,noreferrer");

      const response = await fetch("/api/scan/website", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: normalizedUrl, region }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        if (response.status === 429) {
          const payload = await response.json().catch(() => ({}));
          setStatus("failed");
          setErrorMessage(
            payload.error ??
              "Monthly scan limit reached. Upgrade to Pro to continue."
          );
          return;
        }
        throw new Error("Request failed");
      }

      const data = await response.json();
      if (!data?.scanId) {
        throw new Error("Missing scan id");
      }

      setStatus("queued");

      const pollScan = async () => {
        const statusResponse = await fetch(`/api/scan/status/${data.scanId}`);
        if (!statusResponse.ok) {
          setStatus("failed");
          setErrorMessage("Unable to retrieve scan status.");
          return;
        }

        const statusPayload = await statusResponse.json();
        const scanStatus = statusPayload.status as string;
        if (statusPayload.progress) {
          setProgress(statusPayload.progress);
        }

        if (scanStatus === "QUEUED") {
          setStatus("queued");
        } else if (scanStatus === "VISITING") {
          setStatus("visiting");
        } else if (scanStatus === "ANALYZING") {
          setStatus("analyzing");
        } else if (scanStatus === "COMPLETED") {
          setStatus("completed");
          localStorage.setItem(
            "websiteScanResult",
            JSON.stringify({
              ...(statusPayload.result ?? {}),
              assumptions: statusPayload.assumptions ?? [],
            })
          );
          router.push("/dashboard");
          return;
        } else if (scanStatus === "FAILED") {
          setStatus("failed");
          setErrorMessage(statusPayload.errorMessage ?? "Scan failed.");
          return;
        }

        setTimeout(pollScan, 2000);
      };

      setTimeout(pollScan, 1000);
    } catch (error) {
      setStatus("failed");
      setErrorMessage("We could not process the request. Try again.");
    }
  };

  const handleLoadSample = () => {
    const sampleWebsite = {
      metrics: {
        pageWeightKB: 1420,
        domNodes: 1850,
        jsExecutionMs: 980,
      },
      energy_kWh: 0.31,
      carbon_kg: 0.12,
      recommendations: [
        { title: "Image compression", estimatedReductionPercent: 12, effort: "low" },
        { title: "Remove unused JS", estimatedReductionPercent: 15, effort: "medium" },
        { title: "Reduce DOM depth", estimatedReductionPercent: 10, effort: "medium" },
      ],
      assumptions: [
        "Transferred bytes are based on response content-length headers only and may undercount.",
        "JS execution time is approximated by page load duration (domcontentloaded to load).",
        "Energy estimation uses lower-bound heuristics for network, CPU, and layout costs.",
        "Region grid factors are coarse averages and may differ from local conditions.",
      ],
    };

    const sampleAi = {
      energy_kWh: 1.84,
      carbon_kg: 0.74,
      assumptions: [
        "Inference-only estimate; training energy is excluded.",
        "FLOPs per inference approximated as 2x parameter count (single forward pass).",
        "Precision scaling uses conservative reductions for fp16 and int8.",
        "Hardware efficiency is provided by the user and treated as constant.",
        "Global average grid factor applied when region is missing or unsupported.",
      ],
    };

    localStorage.setItem("websiteScanResult", JSON.stringify(sampleWebsite));
    localStorage.setItem("aiScanResult", JSON.stringify(sampleAi));
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-emerald-50 text-zinc-900">
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-16 sm:px-10">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.2em] text-emerald-600">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Carbon Assessment
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl bg-gradient-to-r from-zinc-900 via-zinc-700 to-emerald-700 bg-clip-text text-transparent">
            Scan Your Website
          </h1>
          <p className="text-lg text-zinc-600 max-w-2xl">
            Get AI-powered insights on your website's carbon footprint and performance. Real-time analysis with actionable recommendations.
          </p>
        </div>

        {/* Scan Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-12 flex flex-col gap-6 rounded-3xl border border-zinc-200 bg-white/80 backdrop-blur-sm p-8 shadow-xl"
        >
          <div className="flex flex-col gap-6">
            <label className="flex flex-col gap-3 text-sm font-semibold text-zinc-800">
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                Website URL
              </span>
              <input
                className="h-12 rounded-xl border-2 border-zinc-200 px-4 text-base text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                placeholder="https://example.com"
                type="url"
                name="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                required
                disabled={status !== "idle" && status !== "failed"}
              />
            </label>

            <label className="flex flex-col gap-3 text-sm font-semibold text-zinc-800">
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Hosting Region
              </span>
              <select
                className="h-12 rounded-xl border-2 border-zinc-200 bg-white px-4 text-base text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                name="region"
                value={region}
                onChange={(event) => setRegion(event.target.value)}
                required
                disabled={status !== "idle" && status !== "failed"}
              >
                <option value="us-east-1">🇺🇸 US East (N. Virginia)</option>
                <option value="eu-north-1">🇪🇺 EU North (Stockholm)</option>
                <option value="ap-south-1">🇮🇳 Asia Pacific (Mumbai)</option>
              </select>
            </label>
          </div>

          {/* Submit Button */}
          <button
            className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-8 text-base font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:shadow-xl hover:shadow-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            type="submit"
            disabled={status !== "idle" && status !== "failed"}
          >
            {status === "submitting" ? (
              <>
                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Start Carbon Scan
              </>
            )}
          </button>

          {/* Status Messages */}
          {status === "idle" && (
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Enter a valid URL to begin scanning
            </div>
          )}

          {status === "failed" && (
            <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <svg className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-900">Scan Failed</p>
                  <p className="mt-1 text-sm text-red-700">
                    {errorMessage || "We could not process the request. Please try again."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Real-time Progress */}
          {status !== "idle" && status !== "failed" && status !== "completed" && (
            <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-8 shadow-xl">
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 h-40 w-40 rounded-full bg-emerald-400 blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-green-400 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>

              <div className="relative flex items-start gap-6">
                {/* Animated Spinner */}
                <div className="flex-shrink-0">
                  <div className="relative h-20 w-20">
                    {/* Outer Ring */}
                    <svg className="absolute inset-0 h-20 w-20 animate-spin" style={{ animationDuration: '3s' }} fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" stroke="#10b981"></circle>
                      <path className="opacity-90" fill="#10b981" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {/* Inner Ring */}
                    <svg className="absolute inset-0 h-20 w-20 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-30" cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="2" stroke="#059669"></circle>
                    </svg>
                    {/* Center Icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="rounded-full bg-emerald-600 p-2 shadow-lg animate-pulse">
                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  {/* Status Title */}
                  <h3 className="text-2xl font-black text-emerald-900 tracking-tight">
                    {status === "queued" && "🔄 Preparing Your Scan"}
                    {status === "visiting" && "🌐 Analyzing Website"}
                    {status === "analyzing" && "🤖 AI Processing"}
                  </h3>
                  <p className="mt-2 text-base text-emerald-800 font-medium leading-relaxed">
                    {status === "queued" && "Your scan is queued and will start momentarily. Hang tight!"}
                    {status === "visiting" && "Our headless browser is crawling your pages and collecting performance data."}
                    {status === "analyzing" && "Gemini AI is crunching the numbers and generating personalized recommendations."}
                  </p>
                  
                  {/* Progress Steps */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    {statusSteps.map((step, index) => {
                      const isActive = step.key === status;
                      const isDone = statusSteps.findIndex((s) => s.key === status) > index;
                      return (
                        <div
                          key={step.key}
                          className={`relative flex items-center gap-2 rounded-full border-2 px-5 py-2 text-sm font-bold transition-all duration-300 ${
                            isActive
                              ? "border-emerald-600 bg-emerald-600 text-white shadow-lg shadow-emerald-500/50 scale-105"
                              : isDone
                              ? "border-emerald-400 bg-emerald-100 text-emerald-800 shadow-sm"
                              : "border-zinc-300 bg-white text-zinc-400"
                          }`}
                        >
                          {isDone && (
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                          {isActive && (
                            <div className="h-2.5 w-2.5 rounded-full bg-white animate-pulse shadow-lg"></div>
                          )}
                          {!isActive && !isDone && (
                            <div className="h-2.5 w-2.5 rounded-full border-2 border-current"></div>
                          )}
                          {step.label}
                        </div>
                      );
                    })}
                  </div>

                  {/* Page Progress */}
                  {progress && status === "visiting" && (
                    <div className="mt-6 rounded-xl border-2 border-emerald-400 bg-white p-6 shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-base font-black text-emerald-900 uppercase tracking-wide">Scanning Progress</span>
                        <span className="text-2xl font-black text-emerald-600">
                          {progress.pagesScanned} <span className="text-zinc-400">/</span> {progress.pagesTotal || "—"}
                        </span>
                      </div>
                      <div className="relative h-4 w-full rounded-full bg-emerald-100 overflow-hidden shadow-inner border-2 border-emerald-200">
                        <div 
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 transition-all duration-700 ease-out shadow-lg flex items-center justify-end pr-2"
                          style={{ width: `${progress.pagesTotal ? Math.max((progress.pagesScanned / progress.pagesTotal) * 100, 5) : 5}%` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 animate-pulse"></div>
                          <span className="relative text-xs font-bold text-white drop-shadow-lg whitespace-nowrap">
                            {progress.pagesTotal ? Math.round((progress.pagesScanned / progress.pagesTotal) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 flex items-start gap-2 text-sm text-emerald-800 font-semibold bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                        <svg className="h-5 w-5 animate-pulse text-emerald-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-emerald-600 font-bold uppercase tracking-wide mb-1">Current Page:</p>
                          <p className="break-all text-sm leading-relaxed">{progress.currentUrl.replace(/^https?:\/\//, "")}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fun Facts */}
                  <div className="mt-6 rounded-xl bg-white/70 border border-emerald-200 p-4 backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">💡</span>
                      <div>
                        <p className="text-xs font-bold text-emerald-900 uppercase tracking-wide">Did you know?</p>
                        <p className="mt-1 text-sm text-emerald-800 font-medium">
                          {status === "queued" && "The average website produces about 1.76g of CO₂ per page view."}
                          {status === "visiting" && "Optimizing images can reduce your carbon footprint by up to 40%."}
                          {status === "analyzing" && "AI-powered insights can help reduce energy consumption by 25-50%."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {status === "completed" && (
            <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center gap-3">
                <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-emerald-900">Scan Complete!</p>
                  <p className="text-sm text-emerald-700">Redirecting to dashboard...</p>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Features */}
        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white/50 backdrop-blur-sm p-6 hover:shadow-lg transition-shadow">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="mt-4 text-base font-semibold text-zinc-900">Real-time Scanning</h3>
            <p className="mt-2 text-sm text-zinc-600">
              Live progress updates as we crawl and analyze your website
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white/50 backdrop-blur-sm p-6 hover:shadow-lg transition-shadow">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="mt-4 text-base font-semibold text-zinc-900">AI-Powered Insights</h3>
            <p className="mt-2 text-sm text-zinc-600">
              Gemini AI generates detailed analysis and recommendations
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white/50 backdrop-blur-sm p-6 hover:shadow-lg transition-shadow">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="mt-4 text-base font-semibold text-zinc-900">Actionable Metrics</h3>
            <p className="mt-2 text-sm text-zinc-600">
              Carbon footprint, energy usage, and optimization opportunities
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 flex flex-col items-center gap-4">
          <div className="h-px w-full max-w-xl bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />
          <p className="max-w-2xl text-center text-xs text-zinc-500">
            Conservative, model-based estimates for optimization. Not real-time electricity measurements.
          </p>
          <a
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
            href="/scan/ai"
          >
            Try AI Model Scan →
          </a>
        </div>
      </main>
    </div>
  );
}
