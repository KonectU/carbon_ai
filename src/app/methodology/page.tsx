export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-16 sm:px-10">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
            Methodology
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Estimation approach
          </h1>
          <p className="text-sm text-zinc-600">Last updated: Feb 5, 2026</p>
        </div>

        <section className="mt-10 space-y-4 text-sm text-zinc-700">
          <p>
            This product provides directional, conservative estimates for
            website delivery and AI inference. It does not perform real-time
            power metering.
          </p>
          <p>
            Website estimates are derived from transferred bytes, DOM size, and
            approximate script execution time measured during headless browsing.
          </p>
          <p>
            AI inference estimates are derived from model parameters, precision,
            request volume, and hardware efficiency. Training energy is
            excluded.
          </p>
          <p>
            Grid carbon factors are coarse averages and may differ from local
            conditions. All assumptions are documented alongside results.
          </p>
        </section>
      </main>
    </div>
  );
}
