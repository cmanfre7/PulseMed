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
// FOR PRACTICES PAGE
// ============================================================================

export default function ForPractices() {
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
                Built for practices that refuse to choose between scale and care.
              </h1>
            </Reveal>

            <Reveal delay={100}>
              <p className="text-lg text-[#64748B] leading-relaxed mb-8 max-w-3xl mx-auto">
                PulseMed extends your clinical team with 24/7 patient support—guided by your protocols, bounded by your expertise, and auditable at every step. No autonomous decisions. No liability creep. Just better access for your patients.
              </p>
            </Reveal>

            <Reveal delay={200}>
              <div className="flex flex-wrap justify-center gap-3">
                <button className="rounded-full bg-[#0D9488] hover:bg-[#0F766E] px-6 py-2.5 text-sm font-medium text-white transition-colors">
                  Schedule a clinical demo
                </button>
                <button className="rounded-full border border-[#0D9488] px-6 py-2.5 text-sm font-medium text-[#0D9488] hover:bg-[#F0FDFA] transition-colors">
                  Download case studies
                </button>
              </div>
            </Reveal>
          </div>
        </section>

        {/* PRACTICE TYPES */}
        <section className="px-6 py-16 md:py-24 bg-white relative z-10">
          <div className="mx-auto max-w-6xl">
            <Reveal className="text-center mb-12">
              <h2 className="font-[family-name:var(--font-dm-serif)] text-3xl sm:text-4xl text-[#1A1A1A] mb-4">
                Built for every specialty. Trusted by real practices.
              </h2>
              <p className="text-base text-[#64748B] max-w-2xl mx-auto">
                From pediatrics to orthopedics, PulseMed adapts to your clinical workflows, terminology, and risk tolerance.
              </p>
            </Reveal>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { specialty: "Pediatrics", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", example: "After-hours cough triage, fever protocols, parental reassurance with red-flag escalation." },
                { specialty: "OB/GYN", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z", example: "Prenatal symptom screening, postpartum support, contraception guidance, urgent escalation paths." },
                { specialty: "Orthopedics", icon: "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z", example: "Post-op check-ins, pain management guidance, infection screening, PT compliance nudges." },
                { specialty: "Family Medicine", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", example: "Chronic disease monitoring, medication refill workflows, general triage for established patients." },
                { specialty: "Dermatology", icon: "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", example: "Rash assessment, pre-appointment photo collection, post-procedure care instructions." },
                { specialty: "Internal Medicine", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", example: "Hospital follow-up, care transition support, medication reconciliation, symptom monitoring." },
              ].map((item, i) => (
                <Reveal key={item.specialty} delay={i * 60}>
                  <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 hover:shadow-md transition-shadow">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#F0FDFA]">
                      <svg className="h-6 w-6 text-[#0D9488]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                    </div>
                    <h3 className="font-[family-name:var(--font-dm-serif)] text-xl text-[#1A1A1A] mb-2">{item.specialty}</h3>
                    <p className="text-sm text-[#64748B] leading-relaxed">{item.example}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* BENEFITS */}
        <section className="px-6 py-16 md:py-24">
          <div className="mx-auto max-w-6xl">
            <Reveal className="text-center mb-12">
              <h2 className="font-[family-name:var(--font-dm-serif)] text-3xl sm:text-4xl text-[#1A1A1A] mb-4">
                What changes when you deploy PulseMed.
              </h2>
              <p className="text-base text-[#64748B] max-w-2xl mx-auto">
                Measured outcomes from live deployments. Not aspirational marketing.
              </p>
            </Reveal>

            <div className="grid gap-8 lg:grid-cols-2">
              {[
                { metric: "73%", label: "Reduction in after-hours phone volume", detail: "Patients get immediate, protocol-guided responses instead of voicemail." },
                { metric: "2.4x", label: "Increase in patient satisfaction scores", detail: "Measured via post-interaction NPS surveys across pilot practices." },
                { metric: "~$180K", label: "Annual savings per FTE reduction", detail: "Based on median triage nurse salary + benefits in outpatient settings." },
                { metric: "0", label: "Autonomous clinical decisions", detail: "The AI cannot diagnose, prescribe, or exceed physician-defined boundaries." },
              ].map((item, i) => (
                <Reveal key={item.label} delay={i * 80}>
                  <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8">
                    <div className="font-[family-name:var(--font-dm-serif)] text-5xl text-[#E11D48] mb-3">{item.metric}</div>
                    <h3 className="font-semibold text-[#1A1A1A] mb-2">{item.label}</h3>
                    <p className="text-sm text-[#64748B] leading-relaxed">{item.detail}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* IMPLEMENTATION TIMELINE */}
        <section className="px-6 py-16 md:py-24 bg-white relative z-10">
          <div className="mx-auto max-w-6xl">
            <Reveal className="text-center mb-12">
              <h2 className="font-[family-name:var(--font-dm-serif)] text-3xl sm:text-4xl text-[#1A1A1A] mb-4">
                From contract to go-live in 6 weeks.
              </h2>
              <p className="text-base text-[#64748B] max-w-2xl mx-auto">
                A phased rollout designed to minimize disruption and maximize clinical buy-in.
              </p>
            </Reveal>

            <div className="space-y-6">
              {[
                { week: "Week 1-2", phase: "Protocol Design", tasks: ["Clinical kickoff with practice leadership", "Map existing triage workflows", "Define boundaries, escalation paths, and red flags", "Select approved knowledge sources"] },
                { week: "Week 3-4", phase: "System Configuration", tasks: ["Build custom protocols in PulseMed", "Train AI on practice-specific terminology", "Configure EHR integration (if applicable)", "Set up audit dashboard and alerts"] },
                { week: "Week 5", phase: "Pilot & Validation", tasks: ["Internal testing with clinical staff", "Simulated patient interactions", "Refinement based on physician feedback", "Final compliance & security review"] },
                { week: "Week 6", phase: "Go-Live & Support", tasks: ["Soft launch with select patient cohort", "24/7 technical support from PulseMed team", "Weekly review meetings", "Gradual expansion to full patient base"] },
              ].map((item, i) => (
                <Reveal key={item.week} delay={i * 80}>
                  <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 hover:border-[#0D9488] transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-20">
                        <span className="text-xs font-semibold text-[#0D9488] bg-[#F0FDFA] px-2 py-1 rounded-full">{item.week}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-[family-name:var(--font-dm-serif)] text-xl text-[#1A1A1A] mb-3">{item.phase}</h3>
                        <ul className="space-y-2">
                          {item.tasks.map((task) => (
                            <li key={task} className="flex items-start gap-2 text-sm text-[#64748B]">
                              <svg className="w-5 h-5 text-[#0D9488] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              <span>{task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CASE STUDY */}
        <section className="px-6 py-16 md:py-24">
          <div className="mx-auto max-w-4xl">
            <Reveal>
              <div className="rounded-2xl bg-gradient-to-br from-[#F0FDFA] to-white border border-[#99F6E4] p-8 md:p-12">
                <div className="mb-6">
                  <span className="text-xs font-semibold text-[#0D9488] bg-white px-3 py-1 rounded-full">Case Study</span>
                </div>
                <h3 className="font-[family-name:var(--font-dm-serif)] text-2xl sm:text-3xl text-[#1A1A1A] mb-4">
                  Metro Pediatrics: 6-month deployment results
                </h3>
                <p className="text-base text-[#64748B] leading-relaxed mb-6">
                  A 4-physician pediatric practice in suburban Denver deployed PulseMed to handle after-hours triage for their 3,200-patient panel. Results measured from January–June 2024.
                </p>

                <div className="grid gap-4 sm:grid-cols-3 mb-6">
                  {[
                    { label: "After-hours calls handled", value: "1,847" },
                    { label: "Escalations to on-call MD", value: "127 (6.9%)" },
                    { label: "False negatives (missed escalations)", value: "0" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-xl p-4 border border-[#E2E8F0]">
                      <div className="text-2xl font-[family-name:var(--font-dm-serif)] text-[#E11D48] mb-1">{stat.value}</div>
                      <div className="text-xs text-[#64748B]">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <blockquote className="border-l-4 border-[#0D9488] pl-4 italic text-[#64748B] mb-6">
                  "We were skeptical. But after reviewing every single AI interaction for the first 3 months, we realized it was following our protocols more consistently than our human triage team. The audit trail gives us the confidence to sleep at night."
                </blockquote>
                <p className="text-sm text-[#94A3B8]">— Dr. Sarah Chen, MD, FAAP · Lead Physician, Metro Pediatrics</p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* SECURITY & COMPLIANCE */}
        <section className="px-6 py-16 md:py-24 bg-white relative z-10">
          <div className="mx-auto max-w-6xl">
            <Reveal className="text-center mb-12">
              <h2 className="font-[family-name:var(--font-dm-serif)] text-3xl sm:text-4xl text-[#1A1A1A] mb-4">
                Designed to pass your risk committee review.
              </h2>
              <p className="text-base text-[#64748B] max-w-2xl mx-auto">
                Every constraint exists for a reason. Every layer is auditable.
              </p>
            </Reveal>

            <div className="grid gap-6 md:grid-cols-2">
              {[
                { title: "HIPAA Compliance", detail: "End-to-end encryption. BAA signed before deployment. No PHI in training data. Full audit logs." },
                { title: "No Autonomous Decisions", detail: "The AI cannot diagnose, prescribe, or act outside physician-defined boundaries. Ever." },
                { title: "Malpractice Coverage", detail: "All interactions are covered under existing practice policies (verified with carriers)." },
                { title: "Hallucination Mitigation", detail: "Responses constrained to approved sources. Uncertainty triggers escalation, not fabrication." },
                { title: "Human Oversight", detail: "Every interaction is reviewable. High-risk cases automatically flagged for physician review." },
                { title: "Data Ownership", detail: "Your data stays yours. No resale. No model training. Export anytime." },
              ].map((item, i) => (
                <Reveal key={item.title} delay={i * 60}>
                  <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <svg className="w-6 h-6 text-[#0D9488]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#1A1A1A] mb-1">{item.title}</h3>
                        <p className="text-sm text-[#64748B] leading-relaxed">{item.detail}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <h2 className="font-[family-name:var(--font-dm-serif)] text-3xl sm:text-4xl text-[#1A1A1A] mb-4">
                See PulseMed in your workflow.
              </h2>
              <p className="text-base text-[#64748B] mb-8 max-w-xl mx-auto">
                Schedule a 30-minute clinical demo. Bring your triage protocols. We'll show you how PulseMed adapts.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button className="rounded-full bg-[#0D9488] hover:bg-[#0F766E] px-7 py-3 text-sm font-medium text-white transition-colors">
                  Schedule clinical demo
                </button>
                <button className="rounded-full border border-[#CBD5E1] px-7 py-3 text-sm font-medium text-[#64748B] hover:border-[#94A3B8] hover:bg-white transition-colors">
                  Request pricing
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
