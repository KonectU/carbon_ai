export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50/30 to-zinc-50 text-zinc-900">
      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-24 sm:px-10">
        {/* Hero Section */}
        <div className="flex flex-col gap-8 items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI-Powered Carbon Intelligence
          </div>
          
          <h1 className="text-5xl font-bold tracking-tight text-zinc-900 sm:text-7xl max-w-4xl">
            Measure. Optimize.{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
              Reduce Impact.
            </span>
          </h1>
          
          <p className="max-w-2xl text-xl text-zinc-900 font-semibold leading-relaxed">
            Get real-time carbon and cost estimates for websites and AI systems. 
            Powered by Gemini AI for actionable insights.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center mt-4">
            <a
              className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-8 text-base font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:shadow-xl hover:shadow-emerald-500/40"
              href="/scan"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Scan Your Website
            </a>
            <a
              className="inline-flex h-14 items-center justify-center gap-2 rounded-xl border-2 border-zinc-200 bg-white px-8 text-base font-semibold text-zinc-900 transition hover:border-zinc-300 hover:shadow-lg"
              href="/methodology"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              View Methodology
            </a>
          </div>

          <p className="text-sm text-zinc-900 font-semibold max-w-xl">
            Lower-bound estimates with documented assumptions. No direct power measurements.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid gap-8 sm:grid-cols-3">
          <div className="group rounded-3xl border border-zinc-200 bg-white/80 backdrop-blur-sm p-8 transition-all hover:shadow-2xl hover:border-emerald-200">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <h3 className="mt-6 text-xl font-semibold text-zinc-900">
              Website Scan
            </h3>
            <p className="mt-3 text-base text-zinc-600 leading-relaxed">
              Real-time crawling with headless browser to estimate carbon impact using lower-bound assumptions.
            </p>
            <a href="/scan" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-emerald-600 group-hover:gap-2 transition-all">
              Start scanning
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          <div className="group rounded-3xl border border-zinc-200 bg-white/80 backdrop-blur-sm p-8 transition-all hover:shadow-2xl hover:border-emerald-200">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="mt-6 text-xl font-semibold text-zinc-900">
              AI Model Analysis
            </h3>
            <p className="mt-3 text-base text-zinc-600 leading-relaxed">
              Identify cost and energy hotspots across inference workflows with Gemini AI insights.
            </p>
            <a href="/scan/ai" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-emerald-600 group-hover:gap-2 transition-all">
              Analyze models
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          <div className="group rounded-3xl border border-zinc-200 bg-white/80 backdrop-blur-sm p-8 transition-all hover:shadow-2xl hover:border-emerald-200">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="mt-6 text-xl font-semibold text-zinc-900">
              ESG Reports
            </h3>
            <p className="mt-3 text-base text-zinc-600 leading-relaxed">
              Simple, auditable summaries for internal and external environmental reporting.
            </p>
            <a href="/dashboard" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-emerald-600 group-hover:gap-2 transition-all">
              View reports
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-24 rounded-3xl border border-zinc-200 bg-gradient-to-br from-white to-emerald-50/50 p-12">
          <div className="grid gap-12 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-600">Real-time</div>
              <div className="mt-2 text-sm font-medium text-zinc-600">Live Progress Updates</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-600">AI-Powered</div>
              <div className="mt-2 text-sm font-medium text-zinc-600">Gemini Analysis</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-600">Actionable</div>
              <div className="mt-2 text-sm font-medium text-zinc-600">Optimization Tips</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
