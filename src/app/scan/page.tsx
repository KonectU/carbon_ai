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
    <div className="min-h-screen bg-white text-zinc-900">
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-20 sm:px-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Start a Digital Carbon Assessment
          </h1>
          <p className="text-base text-zinc-600">
            Choose what you want to assess. Results are conservative estimates
            designed for optimization, not billing.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
            Website assessment
          </p>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Start a conservative estimate
          </h2>
          <p className="text-base text-zinc-600">
            We use lower-bound assumptions and document each input we rely on.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 flex flex-col gap-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
        >
          <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
            Website URL
            <input
              className="h-11 rounded-lg border border-zinc-200 px-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
              placeholder="https://example.com"
              type="url"
              name="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
            Hosting region
            <select
              className="h-11 rounded-lg border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
              name="region"
              value={region}
              onChange={(event) => setRegion(event.target.value)}
              required
            >
              <option value="us-east-1">us-east-1</option>
              <option value="eu-north-1">eu-north-1</option>
              <option value="ap-south-1">ap-south-1</option>
            </select>
          </label>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
              type="submit"
              disabled={status !== "idle" && status !== "failed"}
            >
              {status === "submitting" ? "Submitting..." : "Submit scan"}
            </button>
            {status === "completed" && (
              <p className="text-sm text-emerald-600">
                Scan complete. Redirecting to dashboard.
              </p>
            )}
            {status !== "idle" && status !== "failed" && (
              <div className="flex flex-col gap-2 text-sm text-zinc-500">
                <p>
                  {status === "queued" &&
                    "Scan queued. We will start visiting the site shortly."}
                  {status === "visiting" &&
                    "We are visiting and analyzing the website using a headless browser. This may take a few seconds depending on site complexity."}
                  {status === "analyzing" &&
                    "Analyzing page weight, DOM complexity, and execution time."}
                  {status === "completed" &&
                    "Scan complete. Redirecting to dashboard."}
                </p>
                <div className="flex flex-wrap gap-3 text-xs">
                  {statusSteps.map((step) => {
                    const isActive = step.key === status;
                    const isDone =
                      status === "completed" ||
                      (statusSteps.findIndex((s) => s.key === status) >
                        statusSteps.findIndex((s) => s.key === step.key));
                    return (
                      <span
                        key={step.key}
                        className={`rounded-full border px-3 py-1 ${
                          isActive
                            ? "border-zinc-900 text-zinc-900"
                            : isDone
                              ? "border-zinc-300 text-zinc-600"
                              : "border-zinc-200 text-zinc-400"
                        }`}
                      >
                        {step.label}
                      </span>
                    );
                  })}
                </div>
                {progress && (
                  <div className="text-xs text-zinc-500">
                    Scanning page {progress.pagesScanned} /{" "}
                    {progress.pagesTotal || "—"} · Current:{" "}
                    {progress.currentUrl.replace(/^https?:\/\//, "")}
                  </div>
                )}
              </div>
            )}
            {status === "failed" && (
              <div className="flex flex-col gap-2 text-sm text-red-600">
                <p>
                  {errorMessage || "We could not process the request. Try again."}
                </p>
                {errorMessage?.toLowerCase().includes("limit") && (
                  <a className="text-sm font-medium text-zinc-700 underline" href="/billing">
                    Upgrade to Pro
                  </a>
                )}
              </div>
            )}
            {status === "idle" && (
              <p className="text-sm text-zinc-500">
                Submission requires a valid URL.
              </p>
            )}
          </div>
        </form>

        <div className="mt-10 flex flex-col items-center gap-4">
          <div className="h-px w-full max-w-xl bg-zinc-200" />
          <p className="max-w-2xl text-center text-xs text-zinc-500">
            Both scans provide conservative, model-based estimates for comparison
            and optimization. They do not measure real-time electricity usage or
            represent billing data.
          </p>
          <a
            className="text-sm font-medium text-zinc-700 underline decoration-zinc-300 underline-offset-4 transition hover:text-zinc-900"
            href="/scan/ai"
          >
            Go to AI model scan
          </a>
          {showDemo && (
            <button
              className="text-xs font-medium text-zinc-400 underline decoration-dashed underline-offset-4 transition hover:text-zinc-600"
              type="button"
              onClick={handleLoadSample}
            >
              Load sample assessment
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
