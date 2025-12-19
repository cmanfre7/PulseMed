export default function Home() {
  return (
    <div className="min-h-screen bg-black text-zinc-50">
      {/* Navigation */}
      <header className="border-b border-zinc-900/80 bg-black/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-400 via-cyan-400 to-sky-500 shadow-[0_0_40px_rgba(34,197,94,0.5)]" />
            <span className="text-sm font-semibold tracking-[0.18em] text-zinc-300 uppercase">
              PulseMed
            </span>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
            <button className="hover:text-zinc-100">Platform</button>
            <button className="hover:text-zinc-100">For Practices</button>
            <button className="hover:text-zinc-100">Technology</button>
            <button className="hover:text-zinc-100">Pricing</button>
            <button className="rounded-full border border-emerald-400/60 bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-300 shadow-[0_0_25px_rgba(34,197,94,0.35)] hover:border-emerald-300 hover:bg-emerald-400/20">
              Schedule demo
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6">
        {/* Hero */}
        <section className="flex min-h-[70vh] flex-col justify-center py-16 md:py-24">
          <div className="grid gap-12 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:items-center">
            {/* Left: copy */}
            <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/5 px-3 py-1 text-xs font-medium text-emerald-200 shadow-[0_0_30px_rgba(34,197,94,0.35)]">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Deployed in live clinical settings
            </div>
            <div className="space-y-5">
              <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
                An AI system constrained by
                <br />
                physician-owned sources and auditable outputs.
          </h1>
              <p className="max-w-xl text-pretty text-base text-zinc-400 sm:text-lg">
                PulseMed is a white-label healthcare platform that translates a
                practice&apos;s own protocols, education materials, and triage
                pathways into a 24/7 AI assistant—operating within
                physician-defined boundaries and strict HIPAA safeguards.
              </p>
              <p className="max-w-xl text-pretty text-sm text-zinc-500">
                The system delivers patient guidance grounded exclusively in
                practice-approved sources, with full traceability and no
                autonomous clinical decision-making.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button className="rounded-full bg-emerald-400 px-6 py-2.5 text-sm font-medium text-black shadow-[0_20px_60px_rgba(34,197,94,0.45)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_25px_80px_rgba(34,197,94,0.6)]">
                Schedule a demo
              </button>
              <button className="rounded-full border border-zinc-700 bg-zinc-950 px-6 py-2.5 text-sm font-medium text-zinc-100 hover:border-zinc-500">
                Explore the architecture
              </button>
              <div className="flex items-center gap-3 text-xs text-zinc-500">
                <div className="flex -space-x-2">
                  <div className="h-7 w-7 rounded-full border border-zinc-900 bg-gradient-to-br from-sky-500 to-cyan-400" />
                  <div className="h-7 w-7 rounded-full border border-zinc-900 bg-gradient-to-br from-emerald-500 to-lime-400" />
                  <div className="h-7 w-7 rounded-full border border-zinc-900 bg-gradient-to-br from-fuchsia-500 to-violet-500" />
                </div>
                <span>
                  Designed with physicians,
                  <br className="hidden sm:block" /> deployed in live clinics.
                </span>
              </div>
            </div>

              <div className="grid gap-6 text-xs text-zinc-400 sm:grid-cols-3">
              <div className="space-y-1">
                <div className="text-sm font-semibold text-zinc-100">
                  0–2% hallucination rate
                </div>
                <p>Physician-curated knowledge base with full citation trail.</p>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-semibold text-zinc-100">
                  Built-in HIPAA safeguards
                </div>
                <p>Automatic PHI de-identification before any AI provider.</p>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-semibold text-zinc-100">
                  Clinically restrained communication
                </div>
                <p>Emotionally appropriate dialogue that supports—not replaces—clinical judgment.</p>
              </div>
              </div>
            </div>
          </div>

            {/* Right: glass panel */}
            <div className="relative">
            <div className="pointer-events-none absolute -inset-20 -z-10 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.12),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(56,189,248,0.18),_transparent_55%)]" />
            <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-[0_30px_120px_rgba(0,0,0,0.9)] backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between text-xs text-zinc-500">
                <span className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Live patient conversation
                </span>
                <span>PulseMed · Clinical AI</span>
              </div>
              <div className="space-y-3 text-sm">
                <div className="max-w-[90%] rounded-2xl bg-zinc-900 px-4 py-3 text-zinc-100">
                  “It&apos;s 2am and my baby has a mild fever. I&apos;m scared I
                  might be missing something. What should I look for before
                  calling?”
                </div>
                <div className="flex justify-end">
                  <div className="max-w-[90%] rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 px-4 py-3 text-sm text-black shadow-[0_18px_50px_rgba(34,197,94,0.6)]">
                    I&apos;m glad you reached out—nighttime worries are really
                    common. I can walk you through red flags to watch for and
                    when to call, based on your practice&apos;s own fever
                    guidelines. Let&apos;s start with a couple of quick checks,
                    and we&apos;ll keep things simple.
                  </div>
                </div>
                <div className="flex justify-end">
                  <button className="rounded-full border border-emerald-300/60 bg-emerald-400/10 px-3 py-1 text-[11px] font-medium text-emerald-200">
                    View source protocol
                  </button>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 text-[11px]">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-3">
                  <div className="text-xs font-semibold text-zinc-200">
                    Knowledge source
                  </div>
                  <p className="mt-1 text-zinc-500">
                    Dr. Patel · Fever &amp; triage protocol v3.2
                  </p>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-3">
                  <div className="text-xs font-semibold text-zinc-200">
                    Triage status
                  </div>
                  <p className="mt-1 text-emerald-300">Home care with safety net</p>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-3">
                  <div className="text-xs font-semibold text-zinc-200">
                    PHI exposure
                  </div>
                  <p className="mt-1 text-zinc-500">0 patient identifiers sent</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pillars */}
        <section className="border-t border-zinc-900/80 py-16 md:py-20">
          <div className="mb-8 flex items-center justify-between gap-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-emerald-300">
                Architecture
              </p>
              <h2 className="mt-3 text-balance text-2xl font-semibold tracking-tight text-zinc-50 md:text-3xl">
                Architecture designed to keep clinical teams in control.
              </h2>
            </div>
            <p className="hidden max-w-sm text-xs text-zinc-400 md:block">
              PulseMed uses a curated-knowledge architecture with
              physician-reviewed iteration and a human-centered interaction
              layer. The system does not independently evolve its medical
              guidance—changes are proposed, reviewed, and approved by
              clinicians before deployment.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute -inset-24 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.17),_transparent_55%)]" />
              </div>
              <div className="relative space-y-3">
                <h3 className="text-sm font-semibold text-zinc-50">
                  Physician-curated knowledge
                </h3>
                <p className="text-xs text-zinc-400">
                  The assistant speaks from the practice&apos;s own protocols,
                  handouts, and education—nothing else. Every answer is anchored
                  to content the care team controls and can audit.
                </p>
                <ul className="mt-3 space-y-1.5 text-[11px] text-zinc-400">
                  <li>• Practice-owned content as the primary source of truth</li>
                  <li>• Transparent links back to underlying guidance</li>
                  <li>• Clear separation from generic internet information</li>
                </ul>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute -inset-24 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.17),_transparent_55%)]" />
              </div>
              <div className="relative space-y-3">
                <h3 className="text-sm font-semibold text-zinc-50">
                  Physician-reviewed iteration — no autonomous behavior changes
                </h3>
                <p className="text-xs text-zinc-400">
                  PulseMed surfaces recurring patient questions and content gaps
                  over time, then proposes refinements for clinician review.
                  Updates are never auto-published and do not alter clinical
                  guidance without explicit approval.
                </p>
                <ul className="mt-3 space-y-1.5 text-[11px] text-zinc-400">
                  <li>• Identify recurrent patient questions and friction points</li>
                  <li>• Propose protocol refinements for review</li>
                  <li>• Track downstream impact on patient understanding and call volume</li>
                </ul>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute -inset-24 bg-[radial-gradient(circle_at_top,_rgba(236,72,153,0.17),_transparent_55%)]" />
              </div>
              <div className="relative space-y-3">
                <h3 className="text-sm font-semibold text-zinc-50">
                  Emotionally appropriate, clinically restrained communication
                </h3>
                <p className="text-xs text-zinc-400">
                  Patient conversations are designed to reduce anxiety without
                  overwhelming users. The assistant leads with empathy, then
                  delivers clear, structured guidance aligned with the
                  practice&apos;s standards.
                </p>
                <ul className="mt-3 space-y-1.5 text-[11px] text-zinc-400">
                  <li>• Calibrated tone for routine questions vs high-stress situations</li>
                  <li>• Short, digestible responses with clear next steps</li>
                  <li>• Designed to support—not replace—clinical judgment</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Credibility + metrics */}
        <section className="border-t border-zinc-900/80 py-16 md:py-20">
          <div className="grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-center">
            <div className="space-y-6">
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-emerald-300">
                Built for real clinics
              </p>
              <h2 className="text-balance text-2xl font-semibold tracking-tight text-zinc-50 md:text-3xl">
                From late-night questions to long-term trust.
              </h2>
              <p className="max-w-xl text-sm text-zinc-400">
                PulseMed was developed in collaboration with physicians, practice
                managers, and caregivers. The platform adapts to different
                specialties and workflows—from resource-heavy education practices
                to triage-intensive clinics—while maintaining strict boundaries
                around clinical decision-making and data handling.
              </p>
              <div className="grid gap-6 text-xs text-zinc-400 sm:grid-cols-3">
                <div>
                  <div className="text-2xl font-semibold text-zinc-50">60–80%</div>
                  <p className="mt-1">Target reduction in after-hours patient calls.</p>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-zinc-50">&lt; 2%</div>
                  <p className="mt-1">Hallucination rate in tightly scoped deployments.</p>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-zinc-50">100%</div>
                  <p className="mt-1">Of responses traceable back to known sources.</p>
                </div>
              </div>
            </div>
            <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 text-xs">
              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span className="font-medium text-zinc-200">
                  A day in the life · De-identified example
                </span>
                <span>Aggregate telemetry, not raw charts</span>
              </div>
              <div className="mt-2 h-40 rounded-xl bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.18),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(15,118,110,0.7),_transparent_65%)]">
                <div className="flex h-full items-end gap-1 px-4 pb-4">
                  <div className="flex-1 rounded-t-full bg-emerald-400/30" style={{ height: "30%" }} />
                  <div className="flex-1 rounded-t-full bg-emerald-400/50" style={{ height: "55%" }} />
                  <div className="flex-1 rounded-t-full bg-emerald-400" style={{ height: "85%" }} />
                  <div className="flex-1 rounded-t-full bg-emerald-400/40" style={{ height: "45%" }} />
                  <div className="flex-1 rounded-t-full bg-emerald-400/25" style={{ height: "25%" }} />
                </div>
              </div>
              <p className="text-[11px] text-zinc-400">
                Visualizations are illustrative, not literal dashboards. We
                intentionally show patterns and outcomes without exposing
                implementation details or individual patient journeys.
              </p>
            </div>
          </div>
        </section>

        {/* Call to action */}
        <section className="border-t border-zinc-900/80 py-14 md:py-16">
          <div className="flex flex-col items-center justify-between gap-6 rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-sky-500/10 px-6 py-8 text-center md:flex-row md:text-left">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-emerald-200">
                Early access
              </p>
              <h3 className="text-balance text-lg font-semibold text-zinc-50 md:text-xl">
                Deploy physician-controlled AI in your clinical setting.
              </h3>
              <p className="max-w-xl text-xs text-zinc-200">
                Discuss your specialty, patient volume, and current workflows.
                We&apos;ll provide a demonstration and outline deployment options
                that maintain clinical control and HIPAA compliance.
          </p>
        </div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <button className="rounded-full bg-emerald-400 px-6 py-2.5 text-sm font-medium text-black shadow-[0_16px_60px_rgba(34,197,94,0.6)] hover:-translate-y-0.5 hover:shadow-[0_20px_80px_rgba(34,197,94,0.75)]">
                Schedule a clinical demo
              </button>
              <button className="rounded-full border border-emerald-200/50 bg-transparent px-6 py-2.5 text-sm font-medium text-emerald-100 hover:bg-emerald-500/10">
                Contact clinical operations
              </button>
            </div>
        </div>
        </section>
      </main>
    </div>
  );
}
