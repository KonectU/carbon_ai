 "use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Precision = "fp32" | "fp16" | "int8";

export default function AiScanPage() {
  const router = useRouter();
  const [modelParameters, setModelParameters] = useState("");
  const [precision, setPrecision] = useState<Precision>("fp16");
  const [requestsPerSecond, setRequestsPerSecond] = useState("");
  const [hardwareEfficiency, setHardwareEfficiency] = useState("");
  const [region, setRegion] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("/api/scan/ai-model", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          modelParameters: Number(modelParameters),
          precision,
          requestsPerSecond: Number(requestsPerSecond),
          hardwareEfficiencyFlopsPerWatt: Number(hardwareEfficiency),
          region: region || undefined,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Request failed");
      }

      const data = await response.json();
      localStorage.setItem("aiScanResult", JSON.stringify(data));
      setStatus("success");
      router.push("/dashboard");
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-20 sm:px-10">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
            AI model assessment
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Estimate inference energy and carbon
          </h1>
          <p className="text-base text-zinc-600">
            Inference-only estimates using conservative, lower-bound inputs.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 flex flex-col gap-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
        >
          <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
            Model parameters
            <input
              className="h-11 rounded-lg border border-zinc-200 px-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
              placeholder="e.g. 7000000000"
              type="number"
              name="modelParameters"
              value={modelParameters}
              onChange={(event) => setModelParameters(event.target.value)}
              min="1"
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
            Precision
            <select
              className="h-11 rounded-lg border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
              name="precision"
              value={precision}
              onChange={(event) => setPrecision(event.target.value as Precision)}
              required
            >
              <option value="fp32">fp32</option>
              <option value="fp16">fp16</option>
              <option value="int8">int8</option>
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
            Requests per second
            <input
              className="h-11 rounded-lg border border-zinc-200 px-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
              placeholder="e.g. 25"
              type="number"
              name="requestsPerSecond"
              value={requestsPerSecond}
              onChange={(event) => setRequestsPerSecond(event.target.value)}
              min="0"
              step="0.01"
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
            Hardware efficiency (FLOPs/W)
            <input
              className="h-11 rounded-lg border border-zinc-200 px-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
              placeholder="e.g. 200000000000"
              type="number"
              name="hardwareEfficiency"
              value={hardwareEfficiency}
              onChange={(event) => setHardwareEfficiency(event.target.value)}
              min="1"
              step="1"
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
            Region (optional)
            <select
              className="h-11 rounded-lg border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
              name="region"
              value={region}
              onChange={(event) => setRegion(event.target.value)}
            >
              <option value="">Global average</option>
              <option value="us-east-1">us-east-1</option>
              <option value="eu-north-1">eu-north-1</option>
              <option value="ap-south-1">ap-south-1</option>
            </select>
          </label>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
              type="submit"
              disabled={status === "loading"}
            >
              {status === "loading" ? "Submitting..." : "Submit AI scan"}
            </button>
            {status === "success" && (
              <p className="text-sm text-emerald-600">
                Request received. Redirecting to dashboard.
              </p>
            )}
            {status === "loading" && (
              <p className="text-sm text-zinc-500">
                Running inference footprint estimation…
              </p>
            )}
            {status === "error" && (
              <p className="text-sm text-red-600">
                We could not process the request. Try again.
              </p>
            )}
            {status === "idle" && (
              <p className="text-sm text-zinc-500">
                Estimates are directional and inference-only.
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
            href="/scan"
          >
            Go to website scan
          </a>
        </div>
      </main>
    </div>
  );
}
