export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-16 sm:px-10">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
            Legal
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="text-sm text-zinc-600">Last updated: Feb 5, 2026</p>
        </div>

        <section className="mt-10 space-y-4 text-sm text-zinc-700">
          <p>
            We collect account details, scan inputs, and scan results to provide
            and improve the service. We do not collect real-time power
            measurements or billing records.
          </p>
          <p>
            Scan data may include URLs and metadata derived from public website
            content. We store results to support history and reporting.
          </p>
          <p>
            We use industry-standard security practices to protect data. You may
            request deletion of your account and associated scans.
          </p>
        </section>
      </main>
    </div>
  );
}
