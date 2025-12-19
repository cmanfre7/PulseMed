"use client";

import { useState } from "react";

export default function Home() {
  const [isResponseExpanded, setIsResponseExpanded] = useState(false);

  const fullResponse = `I'm really glad you reached out. It's stressful when something sounds off with their breathing, especially at night.

When you watch him right now:
• Does his breathing look easy, or does it seem like he's working harder than usual?
• When he's calm and resting, do you hear any noisy breathing, or is it mostly just the cough?
• Is he still drinking and acting mostly like himself?
• Have you noticed any color changes around his lips or face?

If he's breathing comfortably, drinking, and otherwise acting okay, it's usually reasonable to keep an eye on him at home tonight. I'd want you to seek care if you notice his breathing getting noisy when he's resting, trouble drinking, or if he just seems more uncomfortable than before.

You can message back with what you're seeing. I'm always happy to help you think through whether watching him or having him checked makes more sense.`;

  const truncatedResponse = `I'm really glad you reached out. It's stressful when something sounds off with their breathing, especially at night.

When you watch him right now:
• Does his breathing look easy, or does it seem like he's working harder than usual?
• When he's calm and resting, do you hear any noisy breathing, or is it mostly just the cough?
• Is he still drinking and acting mostly like himself?
• Have you noticed any color changes around his lips or face?`;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      {/* Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500" />
            <span className="text-sm font-semibold tracking-[0.18em] text-slate-300 uppercase">
              PulseMed
            </span>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-slate-400 md:flex">
            <button className="hover:text-slate-100">Platform</button>
            <button className="hover:text-slate-100">For Practices</button>
            <button className="hover:text-slate-100">Technology</button>
            <button className="hover:text-slate-100">Pricing</button>
            <button className="rounded-full border border-blue-500/40 bg-blue-500/10 px-4 py-1.5 text-xs font-medium text-blue-300 hover:border-blue-400 hover:bg-blue-500/20">
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
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-200">
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-blue-400" />
                A physician-controlled medical AI platform, deployed in live clinical settings.
              </div>
              <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
                An AI system constrained by
                <br />
                physician-defined boundaries and auditable outputs.
          </h1>
              <p className="max-w-xl text-pretty text-base text-slate-300 sm:text-lg">
                PulseMed is a white-label healthcare platform that provides
                24/7 patient support through an AI assistant—operating within
                physician-defined boundaries, strict HIPAA safeguards, and no
                autonomous decision making.
              </p>
              <p className="max-w-xl text-pretty text-sm text-slate-400">
                The system delivers patient guidance aligned with your
                practice&apos;s clinical standards, with full traceability.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700">
                Explore the architecture
              </button>
              <button className="rounded-full border border-slate-600 bg-slate-800 px-6 py-2.5 text-sm font-medium text-slate-100 hover:border-slate-500 hover:bg-slate-700">
                Schedule a demo
              </button>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <div className="flex -space-x-2">
                  <div className="h-7 w-7 rounded-full border border-slate-800 bg-gradient-to-br from-blue-500 to-blue-400" />
                  <div className="h-7 w-7 rounded-full border border-slate-800 bg-gradient-to-br from-teal-500 to-teal-400" />
                  <div className="h-7 w-7 rounded-full border border-slate-800 bg-gradient-to-br from-indigo-500 to-indigo-400" />
                </div>
                <span>
                  Built by physicians,
                  <br className="hidden sm:block" /> deployed in live clinics.
                </span>
              </div>
            </div>

              <div className="relative mt-6 rounded-2xl border border-slate-700 bg-slate-800/50 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-blue-500/30 bg-blue-500/10">
                      <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium text-slate-200">
                      Designed to withstand clinical, legal, and operational review.
                    </p>
                    <p className="text-xs text-slate-400">
                      Every constraint is intentional. Every boundary is auditable. Every response is traceable to physician-approved sources.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

            {/* Right: glass panel */}
            <div className="relative">
            <div className="pointer-events-none absolute -inset-20 -z-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.08),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(37,99,235,0.12),_transparent_55%)]" />
            <div className="relative overflow-hidden rounded-3xl border border-slate-700 bg-slate-800/70 p-5 backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between text-xs text-slate-400">
                <span className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  Live patient conversation
                </span>
                <span>PulseMed · Clinical AI</span>
              </div>
              <div className="space-y-3 text-sm">
                <div className="max-w-[90%] rounded-2xl bg-slate-700 px-4 py-3 text-slate-100">
                  My 18-month-old has been coughing more tonight and it sounds different than usual.
                  He doesn&apos;t seem super sick, but it&apos;s making me nervous.
                </div>
                <div className="flex justify-end">
                  <div className="max-w-[90%] rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 px-4 py-3 text-xs text-white">
                    <div className="whitespace-pre-line">
                      {isResponseExpanded ? fullResponse : truncatedResponse}
                    </div>
                    {!isResponseExpanded && (
                      <button
                        onClick={() => setIsResponseExpanded(true)}
                        className="mt-2 text-[11px] font-medium underline opacity-80 hover:opacity-100"
                      >
                        Read more
                      </button>
                    )}
                    {isResponseExpanded && (
                      <button
                        onClick={() => setIsResponseExpanded(false)}
                        className="mt-2 text-[11px] font-medium underline opacity-80 hover:opacity-100"
                      >
                        Read less
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex justify-end">
                  <button className="rounded-full border border-blue-400/40 bg-blue-500/10 px-3 py-1 text-[11px] font-medium text-blue-200">
                    View source protocol
                  </button>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 text-[11px]">
                <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-3">
                  <div className="text-xs font-semibold text-slate-200">
                    Knowledge source
                  </div>
                  <p className="mt-1 text-slate-400">
                    Practice protocol · Respiratory assessment v2.1
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-3">
                  <div className="text-xs font-semibold text-slate-200">
                    Triage status
                  </div>
                  <p className="mt-1 text-blue-300">Home observation with red flags</p>
                </div>
                <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-3">
                  <div className="text-xs font-semibold text-slate-200">
                    PHI exposure
                  </div>
                  <p className="mt-1 text-slate-400">0 patient identifiers sent</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pillars */}
        <section className="border-t border-slate-800 py-16 md:py-20">
          <div className="mb-8 flex items-center justify-between gap-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-blue-400">
                Architecture
              </p>
              <h2 className="mt-3 text-balance text-2xl font-semibold tracking-tight text-slate-50 md:text-3xl">
                Architecture designed to keep clinical teams in control.
              </h2>
            </div>
            <p className="hidden max-w-sm text-xs text-slate-400 md:block">
              Clinician-defined inputs, reviewed changes, human-centered output. Refuses to diagnose, prescribe, or operate outside defined protocols.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="group relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/70 p-5 transition-colors hover:border-slate-600">
              <div className="relative space-y-2">
                <h3 className="text-sm font-semibold text-slate-50">
                  Physician-curated knowledge
                </h3>
                <p className="text-xs text-slate-300">
                  Answers match your practice&apos;s standards. Fully traceable.
                </p>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/70 p-5 transition-colors hover:border-slate-600">
              <div className="relative space-y-2">
                <h3 className="text-sm font-semibold text-slate-50">
                  Physician-reviewed iteration
                </h3>
                <p className="text-xs text-slate-300">
                  Patterns flagged. Updates require approval.
                </p>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/70 p-5 transition-colors hover:border-slate-600">
              <div className="relative space-y-2">
                <h3 className="text-sm font-semibold text-slate-50">
                  Clinically restrained communication
                </h3>
                <p className="text-xs text-slate-300">
                  Clear, concise, context-appropriate. Supports clinical judgment.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Credibility + metrics */}
        <section className="border-t border-slate-800 py-16 md:py-20">
          <div className="grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-center">
            <div className="space-y-6">
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-blue-400">
                Built for real clinics
              </p>
              <h2 className="text-balance text-2xl font-semibold tracking-tight text-slate-50 md:text-3xl">
                From late-night questions to long-term trust.
              </h2>
              <p className="max-w-xl text-sm text-slate-300">
                PulseMed was developed by physicians, with input from practice
                managers and caregivers. The platform adapts to different
                specialties and workflows—from resource-heavy education practices
                to triage-intensive clinics—while maintaining strict boundaries
                around clinical decision-making and data handling. Designed to pass
                risk committee review, not marketing decks.
              </p>
              <div className="grid gap-6 text-xs text-slate-400 sm:grid-cols-3">
                <div>
                  <div className="text-2xl font-semibold text-slate-50">0</div>
                  <p className="mt-1">Autonomous clinical decisions made. Zero.</p>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-slate-50">&lt; 2%</div>
                  <p className="mt-1">Hallucination rate—constrained by physician-approved sources only.</p>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-slate-50">100%</div>
                  <p className="mt-1">Of responses traceable. No unvetted sources.</p>
                </div>
              </div>
            </div>
            <div className="space-y-4 rounded-2xl border border-slate-700 bg-slate-800/70 p-5 text-xs">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-medium text-slate-200">
                  A day in the life · De-identified example
                </span>
                <span>Aggregate telemetry, not raw charts</span>
              </div>
              <div className="mt-2 h-40 rounded-xl bg-gradient-to-b from-blue-600/20 to-blue-500/10">
                <div className="flex h-full items-end gap-1 px-4 pb-4">
                  <div className="flex-1 rounded-t-full bg-blue-500/40" style={{ height: "30%" }} />
                  <div className="flex-1 rounded-t-full bg-blue-500/50" style={{ height: "55%" }} />
                  <div className="flex-1 rounded-t-full bg-blue-500" style={{ height: "85%" }} />
                  <div className="flex-1 rounded-t-full bg-blue-500/45" style={{ height: "45%" }} />
                  <div className="flex-1 rounded-t-full bg-blue-500/30" style={{ height: "25%" }} />
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Visualizations are illustrative, not literal dashboards. We
                intentionally show patterns and outcomes without exposing
                implementation details or individual patient journeys.
              </p>
            </div>
          </div>
        </section>

        {/* Call to action */}
        <section className="border-t border-slate-800 py-14 md:py-16">
          <div className="flex flex-col items-center justify-between gap-6 rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 via-blue-500/3 to-slate-800/50 px-6 py-8 text-center md:flex-row md:text-left">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-blue-300">
                Early access
              </p>
              <h3 className="text-balance text-lg font-semibold text-slate-50 md:text-xl">
                Deploy physician-controlled AI in your clinical setting.
              </h3>
              <p className="max-w-xl text-xs text-slate-200">
                Discuss your specialty, patient volume, and current workflows.
                We&apos;ll provide a demonstration and outline deployment options
                that maintain clinical control and HIPAA compliance.
          </p>
        </div>
            <div className="flex flex-col gap-3 md:items-center">
              <div className="flex flex-col items-center gap-1.5">
                <button className="rounded-full border border-slate-600 bg-slate-800/50 px-5 py-2 text-xs font-medium text-slate-200 hover:border-slate-500 hover:bg-slate-700/50">
                  Schedule a clinical demo
                </button>
                <p className="text-[10px] text-slate-400">
                  Architecture-first walkthrough. No obligation.
                </p>
              </div>
              <button className="rounded-full border border-blue-400/40 bg-transparent px-5 py-2 text-xs font-medium text-blue-200 hover:bg-blue-500/10">
                Contact clinical operations
              </button>
            </div>
        </div>
        </section>
      </main>
    </div>
  );
}
