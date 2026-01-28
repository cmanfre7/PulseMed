"use client";

import { useState, useEffect, useRef } from "react";
import { MeshGradientBackground, MultiLayerEKG, FloatingParticles, NoiseTexture } from "@/components/EnhancedBackground";
import { GlassCard, ElevatedCard, PulsingMetricCard, TiltCard } from "@/components/EnhancedCards";

// ============================================================================
// RADIATING PULSE - Enhanced with glow
// ============================================================================

function RadiatingPulse() {
  const [beat, setBeat] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setBeat(true);
      setTimeout(() => setBeat(false), 300);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none" style={{ opacity: 0.2 }}>
      <div className="absolute top-1/2 right-[52%] -translate-y-1/2">
        {[1, 2, 3, 4, 5].map((ring) => {
          const size = 200 + ring * 120;
          const offset = (size - 200) / 2;
          return (
            <div
              key={ring}
              className="absolute rounded-full border-2 border-[#0D9488]"
              style={{
                width: \`\${size}px\`,
                height: \`\${size}px\`,
                top: \`\${-offset}px\`,
                left: \`\${-offset}px\`,
                animation: \`pulse-ring-expand 4s ease-out infinite\`,
                animationDelay: \`\${ring * 0.5}s\`,
                opacity: 1 - ring * 0.15,
                boxShadow: "0 0 20px rgba(13, 148, 136, 0.3)",
              }}
            />
          );
        })}
        
        <div 
          className={\`relative w-[200px] h-[200px] rounded-full bg-gradient-to-br from-[#14B8A6] to-[#0D9488] transition-transform duration-300 \${beat ? 'scale-110' : 'scale-100'}\`}
          style={{
            boxShadow: '0 0 60px rgba(13, 148, 136, 0.4), 0 0 100px rgba(13, 148, 136, 0.2)',
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 80 40" className="w-24 h-auto text-white drop-shadow-lg">
              <path
                d="M0,20 L20,20 L28,8 L36,32 L44,12 L52,20 L80,20"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SCROLL REVEAL - Enhanced with intersection observer
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
        transform: visible ? "translateY(0) scale(1)" : "translateY(32px) scale(0.95)",
        transition: \`opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)\`,
        transitionDelay: \`\${delay}ms\`,
      }}
    >
      {children}
    </div>
  );
}

// ============================================================================
// TYPING EFFECT
// ============================================================================

function useTyping(text: string, speed = 20, delay = 0) {
  const [out, setOut] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (i < text.length) {
          setOut(text.slice(0, ++i));
        } else {
          setDone(true);
          clearInterval(interval);
        }
      }, speed);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, speed, delay]);

  return { out, done };
}

// ============================================================================
// CONVERSATION DEMO - Enhanced with glass effect
// ============================================================================

const SCENARIOS = [
  {
    type: "Pediatrics",
    user: "My 18-month-old has been coughing more tonight and it sounds different than usual. He doesn't seem super sick, but it's making me nervous.",
    ai: \`I'm really glad you reached out. It's stressful when something sounds off with their breathing.

When you watch him right now:
• Does his breathing look easy, or does it seem like he's working harder than usual?
• When he's calm and resting, do you hear any noisy breathing, or is it mostly just the cough?
• Is he still drinking and acting mostly like himself?\`,
    meta: {
      source: "Practice protocol · Respiratory assessment v2.1",
      triage: "Home observation with red flags",
      phi: "0 patient identifiers sent"
    }
  },
  {
    type: "Post-op Orthopedics",
    user: "I had my ACL repair 3 days ago. My knee feels really warm to the touch and the swelling seems worse tonight than it was this morning. Is that normal?",
    ai: \`It's good you're checking. While some swelling is expected, significant changes in warmth or swelling 3 days post-op need a closer look.

• Do you have a fever (temperature > 100.4°F)?
• Is the redness spreading or streaking away from the incision?
• Is there any new drainage or fluid leaking from the bandage?
• Is your pain controlled with the current medication schedule?\`,
    meta: {
      source: "Post-op Protocol · ACL Reconstruction Day 3",
      triage: "Evaluate for infection/DVT",
      phi: "Anonymized session ID: #8821"
    }
  },
  {
    type: "Obstetrics",
    user: "I'm 34 weeks pregnant and I've had a headache for the past 3 hours that won't go away with Tylenol. My vision is a bit blurry too.",
    ai: \`Please pay close attention to this. A persistent headache with vision changes at 34 weeks requires immediate evaluation to rule out preeclampsia.

• Do not wait until morning.
• Please proceed to Labor & Delivery triage now for a blood pressure check.
• Do you have safe transportation to the hospital right now?
• I am flagging this interaction for the on-call physician.\`,
    meta: {
      source: "ACOG Guidelines · Preeclampsia Screening",
      triage: "Red Flag: Immediate Evaluation",
      phi: "Urgent Escalation Triggered"
    }
  }
];

function ConversationDemo() {
  const [index, setIndex] = useState(0);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % SCENARIOS.length);
      setKey((prev) => prev + 1);
    }, 14000);
    return () => clearInterval(timer);
  }, []);

  const scenario = SCENARIOS[index];
  return <ConversationCard key={key} scenario={scenario} />;
}

function ConversationCard({ scenario }: { scenario: typeof SCENARIOS[0] }) {
  const [stage, setStage] = useState(0);
  const { out, done } = useTyping(scenario.ai, 18, 2200);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 800);
    const t2 = setTimeout(() => setStage(2), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <GlassCard className="flex flex-col">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-[#0D9488] animate-pulse shadow-lg shadow-teal-500/50" />
          <span className="text-sm text-[#64748B] font-medium">Live patient conversation</span>
        </div>
        <span className="text-xs font-semibold text-[#0D9488] bg-[#F0FDFA] px-3 py-1 rounded-full border border-[#0D9488]/20">
          {scenario.type}
        </span>
      </div>

      <div className="space-y-4 mb-4">
        <div className={\`transition-all duration-700 ease-out \${stage >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}\`}>
          <div className="bg-gradient-to-br from-[#F1F5F9] to-[#E2E8F0] rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
            <p className="text-sm text-[#1E293B] leading-relaxed font-medium">
              {scenario.user}
            </p>
          </div>
        </div>

        <div className={\`transition-all duration-700 ease-out \${stage >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}\`}>
          <div className="bg-gradient-to-br from-[#0D9488] to-[#0F766E] rounded-2xl rounded-tr-sm px-5 py-4 shadow-xl shadow-teal-900/20">
            <p className="text-sm text-white leading-relaxed whitespace-pre-line font-medium">
              {out}
              {!done && (
                <span className="inline-block w-0.5 h-4 bg-white/90 ml-1 animate-pulse align-middle shadow-sm" />
              )}
            </p>
          </div>
        </div>
      </div>

      <div className={\`pt-4 border-t border-white/40 transition-all duration-700 \${done ? "opacity-100" : "opacity-0"}\`}>
        <div className="grid grid-cols-3 gap-3 mb-3">
          {[
            { label: "Knowledge source", value: scenario.meta.source },
            { label: "Triage status", value: scenario.meta.triage },
            { label: "PHI exposure", value: scenario.meta.phi },
          ].map((m) => (
            <div key={m.label}>
              <p className="text-[10px] uppercase tracking-wider font-bold text-[#0D9488]">{m.label}</p>
              <p className="text-xs text-[#64748B] mt-1 leading-tight font-medium">{m.value}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <button className="text-xs text-[#0D9488] hover:text-white font-semibold px-5 py-2 rounded-full border-2 border-[#0D9488] hover:bg-[#0D9488] transition-all duration-300 shadow-sm hover:shadow-md">
            View source protocol
          </button>
        </div>
      </div>
    </GlassCard>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function Home() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#FAFAF7] via-[#FFFFFF] to-[#F0FDFA]">
      {/* All background layers */}
      <MeshGradientBackground />
      <MultiLayerEKG />
      <FloatingParticles />
      <NoiseTexture />

      {/* NAVIGATION */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-1">
            <span className="text-xl font-semibold tracking-[0.02em] text-[#1E293B]">Pulse</span>
            <svg viewBox="0 0 56 48" className="h-7 w-auto text-[#E11D48] drop-shadow-md">
              <path 
                d="M2 32 L8 32 L12 32 L12 10 L22 38 L28 10 L34 38 L44 10 L44 32 L48 32 L54 32" 
                stroke="currentColor" 
                strokeWidth="3.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: "Platform", href: "/" },
              { label: "For Practices", href: "/for-practices" },
              { label: "Technology", href: "/technology" },
            ].map((item) => (
              <a key={item.label} href={item.href} className="text-sm text-[#64748B] hover:text-[#0D9488] font-medium transition-colors">
                {item.label}
              </a>
            ))}
            <button className="rounded-full bg-gradient-to-r from-[#0D9488] to-[#14B8A6] hover:from-[#0F766E] hover:to-[#0D9488] px-6 py-2.5 text-sm font-semibold text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
              Schedule demo
            </button>
          </nav>
        </div>
      </header>

      <main className="relative z-10">
        {/* HERO */}
        <section className="relative px-6 py-20 md:py-28 overflow-hidden">
          <RadiatingPulse />
          
          <div className="relative mx-auto max-w-6xl">
            <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
              <div>
                <Reveal>
                  <h1 className="font-[family-name:var(--font-dm-serif)] text-5xl sm:text-6xl lg:text-7xl leading-[1.05] text-[#1A1A1A] mb-6 drop-shadow-sm">
                    Care that never sleeps. Oversight that never lapses.
                  </h1>
                </Reveal>

                <Reveal delay={100}>
                  <p className="text-lg text-[#64748B] leading-relaxed mb-8 max-w-lg font-medium">
                    PulseMed is a white-label healthcare platform that provides 24/7 patient support through an AI assistant—operating within physician-defined boundaries, strict HIPAA safeguards, and no autonomous decision making.
                  </p>
                </Reveal>

                <Reveal delay={200}>
                  <div className="flex flex-wrap gap-4 mb-10">
                    <button className="rounded-full bg-gradient-to-r from-[#0D9488] to-[#14B8A6] hover:from-[#0F766E] hover:to-[#0D9488] px-8 py-3.5 text-base font-semibold text-white transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 hover:-translate-y-0.5">
                      See how it works
                    </button>
                    <button className="rounded-full border-2 border-[#0D9488] px-8 py-3.5 text-base font-semibold text-[#0D9488] hover:bg-[#0D9488] hover:text-white transition-all duration-300 shadow-md hover:shadow-lg">
                      Schedule a demo
                    </button>
                  </div>
                </Reveal>

                <Reveal delay={300}>
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0D9488] to-[#14B8A6] border-2 border-white shadow-md" />
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F87171] to-[#DC2626] border-2 border-white shadow-md" />
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#60A5FA] to-[#3B82F6] border-2 border-white shadow-md" />
                    </div>
                    <p className="text-sm text-[#64748B] font-medium">
                      Built by physicians, deployed in live clinics
                    </p>
                  </div>
                </Reveal>
              </div>

              <Reveal delay={200}>
                <ConversationDemo />
              </Reveal>
            </div>
          </div>
        </section>

        {/* ANATOMY OF TRUST - Alternating background */}
        <section className="px-6 py-20 md:py-28 bg-white/60 backdrop-blur-sm relative z-10">
          <div className="mx-auto max-w-6xl">
            <Reveal className="text-center mb-16">
              <h2 className="font-[family-name:var(--font-dm-serif)] text-4xl sm:text-5xl text-[#1A1A1A] mb-5 drop-shadow-sm">
                The anatomy of trust
              </h2>
              <p className="text-lg text-[#64748B] max-w-2xl mx-auto font-medium">
                Every layer exists for a reason. Every constraint protects a patient.
              </p>
            </Reveal>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", title: "Physician Input", desc: "Your clinical expertise becomes the system's foundation. Protocols, boundaries, and approved sources — all defined by you." },
                { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", title: "Defined Boundaries", desc: "The AI operates within strict guardrails. It cannot diagnose, prescribe, or exceed its defined scope." },
                { icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z", title: "AI Processing", desc: "Within those boundaries, the system provides warm, clear guidance — traced to your approved knowledge." },
                { icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", title: "Auditable Output", desc: "Every response is logged, traceable, and reviewable. Full transparency, always." },
              ].map((item, i) => (
                <Reveal key={item.title} delay={i * 80}>
                  <TiltCard>
                    <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#F0FDFA] to-[#CCFBF1] shadow-inner">
                      <svg className="h-7 w-7 text-[#0D9488] drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                    </div>
                    <h3 className="font-[family-name:var(--font-dm-serif)] text-xl text-[#1A1A1A] mb-3 drop-shadow-sm">{item.title}</h3>
                    <p className="text-sm text-[#64748B] leading-relaxed font-medium">{item.desc}</p>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* METRICS */}
        <section className="px-6 py-20 md:py-28 relative">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
              <Reveal>
                <h2 className="font-[family-name:var(--font-dm-serif)] text-4xl sm:text-5xl text-[#1A1A1A] mb-6 drop-shadow-sm">
                  From late-night questions to long-term trust.
                </h2>
                <p className="text-base text-[#64748B] leading-relaxed mb-4 font-medium">
                  PulseMed was developed by physicians, with input from practice managers and caregivers. The platform adapts to different specialties and workflows while maintaining strict boundaries around clinical decision-making and data handling.
                </p>
                <p className="text-sm text-[#94A3B8] italic">
                  Designed to pass risk committee review, not marketing decks.
                </p>
              </Reveal>

              <div className="grid grid-cols-2 gap-6">
                {[
                  { value: "0", label: "Autonomous clinical decisions. Ever." },
                  { value: "<2%", label: "Hallucination rate. Constrained by physician-approved sources." },
                  { value: "100%", label: "Response traceability. No unvetted sources." },
                  { value: "24/7", label: "Patient support availability." },
                ].map((m, i) => (
                  <Reveal key={m.label} delay={i * 80}>
                    <div className="rounded-2xl border-2 border-[#E2E8F0] bg-white/80 backdrop-blur-sm p-6 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 hover:border-[#0D9488]/30">
                      <div className="font-[family-name:var(--font-dm-serif)] text-5xl bg-gradient-to-r from-[#E11D48] to-[#F43F5E] bg-clip-text text-transparent drop-shadow-sm">{m.value}</div>
                      <p className="text-xs text-[#64748B] mt-3 leading-relaxed font-medium">{m.label}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* TRUST BANNER */}
        <section className="px-6 py-16 relative">
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <div className="rounded-3xl bg-gradient-to-br from-[#F0FDFA] via-white to-[#CCFBF1] border-2 border-[#99F6E4] px-10 py-14 text-center shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-30" />
                
                <div className="relative">
                  <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-xl">
                    <svg className="h-8 w-8 text-[#0D9488]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="font-[family-name:var(--font-dm-serif)] text-3xl sm:text-4xl text-[#1A1A1A] mb-4 drop-shadow-sm">
                    Designed to withstand clinical, legal, and operational review.
                  </h3>
                  <p className="text-lg text-[#64748B] max-w-2xl mx-auto font-medium leading-relaxed">
                    Every constraint is intentional. Every boundary is auditable. Every response is traceable to physician-approved sources.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-20 md:py-28 bg-white/60 backdrop-blur-sm relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <h2 className="font-[family-name:var(--font-dm-serif)] text-4xl sm:text-5xl text-[#1A1A1A] mb-5 drop-shadow-sm">
                Ready to see PulseMed in your practice?
              </h2>
              <p className="text-lg text-[#64748B] mb-10 max-w-xl mx-auto font-medium leading-relaxed">
                Discuss your specialty, patient volume, and current workflows. We'll provide a demonstration and outline deployment options that maintain clinical control and HIPAA compliance.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button className="rounded-full bg-gradient-to-r from-[#0D9488] to-[#14B8A6] hover:from-[#0F766E] hover:to-[#0D9488] px-9 py-4 text-base font-semibold text-white transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 hover:-translate-y-1">
                  Schedule a clinical demo
                </button>
                <button className="rounded-full border-2 border-[#CBD5E1] px-9 py-4 text-base font-semibold text-[#64748B] hover:border-[#0D9488] hover:text-[#0D9488] hover:bg-white transition-all duration-300 shadow-md hover:shadow-lg">
                  Contact clinical operations
                </button>
              </div>
            </Reveal>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-[#E2E8F0] bg-white/40 backdrop-blur-sm px-6 py-12">
          <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-1">
              <span className="text-lg font-semibold tracking-[0.02em] text-[#1E293B]">Pulse</span>
              <svg viewBox="0 0 56 48" className="h-5 w-auto text-[#E11D48] drop-shadow-sm">
                <path 
                  d="M2 32 L8 32 L12 32 L12 10 L22 38 L28 10 L34 38 L44 10 L44 32 L48 32 L54 32" 
                  stroke="currentColor" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
            <div className="flex gap-8 text-sm text-[#64748B] font-medium">
              {["Privacy Policy", "Terms of Service", "Contact"].map((l) => (
                <button key={l} className="hover:text-[#0D9488] transition-colors">{l}</button>
              ))}
            </div>
            <p className="text-sm text-[#94A3B8]">© 2024 PulseMed. All rights reserved.</p>
          </div>
        </footer>
      </main>

      <style jsx global>{\`
        @keyframes pulse-ring-expand {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
      \`}</style>
    </div>
  );
}
