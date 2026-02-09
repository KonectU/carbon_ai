export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-16 sm:px-10">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
            Legal
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Terms of Service
          </h1>
          <p className="text-sm text-zinc-600">Last updated: Feb 5, 2026</p>
        </div>

        <section className="mt-10 space-y-4 text-sm text-zinc-700">
          <p>
            This service provides model-based, conservative estimates. It does
            not provide metered measurements or billing statements.
          </p>
          <p>
            You are responsible for ensuring you have permission to scan the
            websites and systems you submit.
          </p>
          <p>
            We may change or discontinue features with notice. Liability is
            limited to the maximum extent permitted by law.
          </p>
        </section>
      </main>
    </div>
  );
}
