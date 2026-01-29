"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { MeshGradientBackground, SingleLayerEKG, NoiseTexture } from "@/components/EnhancedBackground";

// ============================================================================
// SHARED COMPONENTS
// ============================================================================

function useReveal(threshold = 0.1) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.7s ease, transform 0.7s ease`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ============================================================================
// TECHNOLOGY PAGE
// ============================================================================

export default function Technology() {
  return (
    <div className="relative min-h-screen bg-[#FAFAF7]">
      <MeshGradientBackground />
      <SingleLayerEKG />
      <NoiseTexture />

      {/* NAVIGATION */}
      <header className="sticky top-0 z-50 bg-[#FAFAF7]/80 backdrop-blur-md border-b border-[#E2E8F0]">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-1">
            <img src="/logos/Logo.svg" alt="PulseMed" className="h-14 w-auto" />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: "Platform", href: "/" },
              { label: "For Practices", href: "/for-practices" },
              { label: "Technology", href: "/technology" },
            ].map((item) => (
              <Link key={item.label} href={item.href} className="text-sm text-[#64748B] hover:text-[#1A1A1A] transition-colors">
                {item.label}
              </Link>
            ))}
            <button className="rounded-full bg-[#0D9488] hover:bg-[#0F766E] px-5 py-2 text-sm font-medium text-white transition-colors">
              Schedule demo
            </button>
          </nav>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="relative px-6 py-16 md:py-24">
          <div className="relative mx-auto max-w-6xl text-center">
            <Reveal>
              <h1 className="font-[family-name:var(--font-dm-serif)] text-4xl sm:text-5xl lg:text-6xl leading-[1.1] text-[#1A1A1A] mb-6">
                Bounded intelligence. Unbounded transparency.
              </h1>
            </Reveal>

            <Reveal delay={100}>
              <p className="text-lg text-[#64748B] leading-relaxed mb-8 max-w-3xl mx-auto">
                PulseMed is not "AI that replaces doctors." It's a constrained reasoning engine that operates exclusively within physician-defined boundaries—traceable, auditable, and incapable of autonomous clinical decisions.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ARCHITECTURE */}
        <section className="px-6 py-16 md:py-24 bg-white relative z-10">
          <div className="mx-auto max-w-6xl">
            <Reveal className="text-center mb-12">
              <h2 className="font-[family-name:var(--font-dm-serif)] text-3xl sm:text-4xl text-[#1A1A1A] mb-4">
                How it works: Architecture overview
              </h2>
              <p className="text-base text-[#64748B] max-w-2xl mx-auto">
                Every layer is designed to prevent hallucination, enforce boundaries, and maintain auditability.
              </p>
            </Reveal>

            <div className="space-y-6">
              {[
                { 
                  step: "1", 
                  title: "Protocol Ingestion", 
                  detail: "Physicians define clinical protocols, escalation criteria, and approved knowledge sources. These are converted into machine-readable decision trees with hard constraints.",
                  tech: "Structured extraction · Knowledge graph construction · Boundary verification"
                },
                { 
                  step: "2", 
                  title: "Patient Input Processing", 
                  detail: "User messages are parsed for clinical entities (symptoms, medications, timeline). PHI is identified, tokenized, and logged. Input is checked against red-flag triggers before proceeding.",
                  tech: "NLP entity extraction · PHI detection · Pre-screening filters"
                },
                { 
                  step: "3", 
                  title: "Constrained Reasoning", 
                  detail: "The AI generates a response using only approved sources. It cannot invent information. If the query exceeds defined scope, it escalates to a human. Confidence scores are computed for every statement.",
                  tech: "Retrieval-augmented generation (RAG) · Source attribution · Uncertainty quantification"
                },
                { 
                  step: "4", 
                  title: "Safety Layer & Validation", 
                  detail: "Before delivery, the response is checked for: fabricated claims, contradictions with protocols, missing escalation triggers, and PHI leakage. High-risk responses are flagged for physician review.",
                  tech: "Hallucination detection · Protocol compliance check · PHI sanitization"
                },
                { 
                  step: "5", 
                  title: "Delivery & Logging", 
                  detail: "The validated response is delivered to the patient. Every input, reasoning step, and output is logged with full source attribution. Audit trail is immutable and exportable.",
                  tech: "Encrypted transmission · Immutable audit log · Source traceability"
                },
              ].map((item, i) => (
                <Reveal key={item.step} delay={i * 80}>
                  <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 hover:border-[#0D9488] transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-[#F0FDFA] flex items-center justify-center">
                          <span className="text-lg font-[family-name:var(--font-dm-serif)] text-[#0D9488]">{item.step}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-[family-name:var(--font-dm-serif)] text-xl text-[#1A1A1A] mb-2">{item.title}</h3>
                        <p className="text-sm text-[#64748B] leading-relaxed mb-3">{item.detail}</p>
                        <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                          </svg>
                          <span>{item.tech}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* SAFETY MECHANISMS */}
        <section className="px-6 py-16 md:py-24">
          <div className="mx-auto max-w-6xl">
            <Reveal className="text-center mb-12">
              <h2 className="font-[family-name:var(--font-dm-serif)] text-3xl sm:text-4xl text-[#1A1A1A] mb-4">
                Safety mechanisms: What prevents hallucination?
              </h2>
              <p className="text-base text-[#64748B] max-w-2xl mx-auto">
                Multiple redundant layers ensure the AI cannot fabricate information or exceed clinical scope.
              </p>
            </Reveal>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", title: "Source Attribution", desc: "Every statement is traced to an approved source. No source = no claim." },
                { icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z", title: "Red-Flag Detection", desc: "Certain symptoms (e.g., chest pain + SOB) trigger immediate escalation, bypassing AI response." },
                { icon: "M13 10V3L4 14h7v7l9-11h-7z", title: "Confidence Thresholds", desc: "Low-confidence responses are withheld. Uncertainty triggers escalation, not fabrication." },
                { icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z", title: "Human Review Queue", desc: "High-stakes interactions are flagged for physician review before or after delivery." },
                { icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", title: "Immutable Audit Log", desc: "Every interaction is permanently logged. Retroactive changes are cryptographically prevented." },
                { icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4", title: "Version Control", desc: "Protocol changes are tracked. Every response references the protocol version it used." },
              ].map((item, i) => (
                <Reveal key={item.title} delay={i * 60}>
                  <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#F0FDFA]">
                      <svg className="h-6 w-6 text-[#0D9488]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-[#1A1A1A] mb-2">{item.title}</h3>
                    <p className="text-sm text-[#64748B] leading-relaxed">{item.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* DATA & SECURITY */}
        <section className="px-6 py-16 md:py-24 bg-white relative z-10">
          <div className="mx-auto max-w-6xl">
            <Reveal className="text-center mb-12">
              <h2 className="font-[family-name:var(--font-dm-serif)] text-3xl sm:text-4xl text-[#1A1A1A] mb-4">
                Data handling & security architecture
              </h2>
              <p className="text-base text-[#64748B] max-w-2xl mx-auto">
                Built to meet HIPAA, SOC 2, and malpractice carrier requirements.
              </p>
            </Reveal>

            <div className="grid gap-8 lg:grid-cols-2">
              <Reveal>
                <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8">
                  <h3 className="font-[family-name:var(--font-dm-serif)] text-2xl text-[#1A1A1A] mb-4">Encryption & Access Control</h3>
                  <ul className="space-y-3">
                    {[
                      "End-to-end encryption (TLS 1.3) for all patient communications",
                      "Data-at-rest encrypted with AES-256 (FIPS 140-2 compliant)",
                      "Role-based access control (RBAC) with audit logs for every access",
                      "Multi-factor authentication (MFA) required for all clinical users",
                      "Automatic session timeout after 15 minutes of inactivity",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-[#64748B]">
                        <svg className="w-5 h-5 text-[#0D9488] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>

              <Reveal delay={80}>
                <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8">
                  <h3 className="font-[family-name:var(--font-dm-serif)] text-2xl text-[#1A1A1A] mb-4">Data Sovereignty & Ownership</h3>
                  <ul className="space-y-3">
                    {[
                      "Your data never leaves your designated AWS region (US-East, US-West, or EU)",
                      "No PHI is used for model training. Ever.",
                      "Full data export available in JSON/CSV at any time",
                      "Data deletion requests honored within 30 days (with audit confirmation)",
                      "Business Associate Agreement (BAA) signed before deployment",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-[#64748B]">
                        <svg className="w-5 h-5 text-[#0D9488] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>

            <Reveal delay={120} className="mt-8">
              <div className="rounded-2xl bg-[#F0FDFA] border border-[#99F6E4] p-6">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#0D9488] flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-[#1A1A1A] mb-1">Penetration Testing & Compliance</h4>
                    <p className="text-sm text-[#64748B]">
                      Annual third-party penetration testing. SOC 2 Type II certification in progress. HIPAA compliance verified by independent auditors (Coalfire, 2024).
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* INTEGRATIONS */}
        <section className="px-6 py-16 md:py-24">
          <div className="mx-auto max-w-6xl">
            <Reveal className="text-center mb-12">
              <h2 className="font-[family-name:var(--font-dm-serif)] text-3xl sm:text-4xl text-[#1A1A1A] mb-4">
                Integrations & API access
              </h2>
              <p className="text-base text-[#64748B] max-w-2xl mx-auto">
                PulseMed connects to your existing infrastructure. No platform lock-in.
              </p>
            </Reveal>

            <div className="grid gap-6 md:grid-cols-2">
              {[
                { 
                  title: "EHR Integration", 
                  providers: ["Epic (FHIR R4)", "Cerner", "Athenahealth", "eClinicalWorks"],
                  detail: "Bidirectional sync for patient demographics, problem lists, and medication reconciliation. Read-only by default; write access requires explicit approval."
                },
                { 
                  title: "Communication Channels", 
                  providers: ["SMS (Twilio)", "Patient Portal Embed", "Secure Messaging", "WhatsApp Business"],
                  detail: "Patients interact via their preferred channel. All conversations are encrypted and logged identically."
                },
                { 
                  title: "On-Call Scheduling", 
                  providers: ["Amion", "PagerDuty", "OnCall Health", "Custom API"],
                  detail: "PulseMed escalates to the correct on-call provider based on your existing schedule."
                },
                { 
                  title: "Analytics & BI", 
                  providers: ["Tableau", "Power BI", "Looker", "Direct SQL Access"],
                  detail: "De-identified data lake for practice-level analytics. Custom dashboards available."
                },
              ].map((item, i) => (
                <Reveal key={item.title} delay={i * 80}>
                  <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
                    <h3 className="font-[family-name:var(--font-dm-serif)] text-xl text-[#1A1A1A] mb-3">{item.title}</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {item.providers.map((p) => (
                        <span key={p} className="text-xs bg-[#F0FDFA] text-[#0D9488] px-2 py-1 rounded-full">{p}</span>
                      ))}
                    </div>
                    <p className="text-sm text-[#64748B] leading-relaxed">{item.detail}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* TECHNICAL SPECS */}
        <section className="px-6 py-16 md:py-24 bg-white relative z-10">
          <div className="mx-auto max-w-6xl">
            <Reveal className="text-center mb-12">
              <h2 className="font-[family-name:var(--font-dm-serif)] text-3xl sm:text-4xl text-[#1A1A1A] mb-4">
                Technical specifications
              </h2>
              <p className="text-base text-[#64748B] max-w-2xl mx-auto">
                For IT teams and technical stakeholders.
              </p>
            </Reveal>

            <div className="grid gap-6 md:grid-cols-3">
              {[
                { label: "Infrastructure", value: "AWS (multi-region), Kubernetes, auto-scaling" },
                { label: "Uptime SLA", value: "99.9% (measured monthly, penalties for breach)" },
                { label: "Response latency", value: "< 2s median (p95 < 5s)" },
                { label: "Concurrent users", value: "Unlimited (tested to 50K+ simultaneous)" },
                { label: "Data retention", value: "7 years default (configurable per practice)" },
                { label: "Backup frequency", value: "Continuous (point-in-time recovery available)" },
                { label: "Disaster recovery", value: "RPO < 15 min, RTO < 4 hours" },
                { label: "API rate limits", value: "1000 req/min (enterprise tier: unlimited)" },
                { label: "Supported languages", value: "English, Spanish (additional on request)" },
              ].map((item, i) => (
                <Reveal key={item.label} delay={i * 50}>
                  <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
                    <div className="text-xs font-semibold text-[#0D9488] uppercase tracking-wider mb-2">{item.label}</div>
                    <div className="text-sm text-[#1A1A1A] font-medium">{item.value}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* TRANSPARENCY */}
        <section className="px-6 py-16 md:py-24">
          <div className="mx-auto max-w-4xl">
            <Reveal>
              <div className="rounded-2xl bg-gradient-to-br from-[#F0FDFA] to-white border border-[#99F6E4] p-8 md:p-12">
                <div className="text-center">
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                    <svg className="h-7 w-7 text-[#0D9488]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <h3 className="font-[family-name:var(--font-dm-serif)] text-2xl sm:text-3xl text-[#1A1A1A] mb-4">
                    Radical transparency is non-negotiable.
                  </h3>
                  <p className="text-base text-[#64748B] leading-relaxed mb-6">
                    Every AI response includes full source attribution. Physicians can audit any interaction. Patients can request explanation of AI reasoning. No black boxes. No trust-me-it-works handwaving.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {[
                      { label: "Audit access", value: "Real-time" },
                      { label: "Source traceability", value: "100%" },
                      { label: "Unexplainable decisions", value: "0" },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-white rounded-xl p-4 border border-[#E2E8F0]">
                        <div className="text-2xl font-[family-name:var(--font-dm-serif)] text-[#E11D48] mb-1">{stat.value}</div>
                        <div className="text-xs text-[#64748B]">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <h2 className="font-[family-name:var(--font-dm-serif)] text-3xl sm:text-4xl text-[#1A1A1A] mb-4">
                Technical questions? Let's talk.
              </h2>
              <p className="text-base text-[#64748B] mb-8 max-w-xl mx-auto">
                Schedule a technical deep-dive with our engineering team. Bring your security team, your IT director, and your hardest questions.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button className="rounded-full bg-[#0D9488] hover:bg-[#0F766E] px-7 py-3 text-sm font-medium text-white transition-colors">
                  Schedule technical review
                </button>
                <button className="rounded-full border border-[#CBD5E1] px-7 py-3 text-sm font-medium text-[#64748B] hover:border-[#94A3B8] hover:bg-white transition-colors">
                  Download technical whitepaper
                </button>
              </div>
            </Reveal>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-[#E2E8F0] px-6 py-10">
          <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-1">
              <span className="text-lg font-semibold tracking-[0.02em] text-[#1E293B]">Pulse</span>
              <svg viewBox="0 0 56 48" className="h-5 w-auto text-[#E11D48]">
                <path 
                  d="M2 32 L8 32 L12 32 L12 10 L22 38 L28 10 L34 38 L44 10 L44 32 L48 32 L54 32" 
                  stroke="currentColor" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </Link>
            <div className="flex gap-6 text-sm text-[#64748B]">
              {["Privacy Policy", "Terms of Service", "Contact"].map((l) => (
                <button key={l} className="hover:text-[#1A1A1A] transition-colors">{l}</button>
              ))}
            </div>
            <p className="text-sm text-[#94A3B8]">© 2024 PulseMed. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
