export default function BillingSuccessPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 py-16 text-center sm:px-10">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
          Billing
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Subscription activated
        </h1>
        <p className="mt-3 max-w-xl text-base text-zinc-600">
          Your account has been upgraded to Pro. You can now run higher monthly
          scan volumes.
        </p>
        <a
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition hover:bg-zinc-800"
          href="/dashboard"
        >
          Back to dashboard
        </a>
      </main>
    </div>
  );
}
