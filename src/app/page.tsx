export default function Home() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-24 sm:px-10">
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
              Carbon and cost intelligence
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
              Measure. Optimize. Reduce impact.
            </h1>
            <p className="max-w-2xl text-lg text-zinc-600">
              Carbon and cost estimates for websites and AI systems.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              className="inline-flex h-11 w-full items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-800 sm:w-auto"
              href="/scan"
            >
              Scan your website
            </a>
            <p className="text-sm text-zinc-500">
              Lower-bound estimates with documented assumptions.
            </p>
          </div>
          <p className="text-sm text-zinc-500">
            Estimates are directional and based on conservative engineering
            assumptions. No direct power measurements are performed.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 p-6">
            <h3 className="text-base font-semibold text-zinc-900">
              Website scan
            </h3>
            <p className="mt-2 text-sm text-zinc-600">
              Lightweight crawl to estimate carbon impact with lower-bound
              assumptions.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 p-6">
            <h3 className="text-base font-semibold text-zinc-900">
              AI model optimization
            </h3>
            <p className="mt-2 text-sm text-zinc-600">
              Identify cost and energy hotspots across inference workflows.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 p-6">
            <h3 className="text-base font-semibold text-zinc-900">
              ESG reports
            </h3>
            <p className="mt-2 text-sm text-zinc-600">
              Simple, auditable summaries for internal and external reporting.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
