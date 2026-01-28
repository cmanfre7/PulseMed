"use client";

import { useState, useEffect, useRef } from "react";
import { MeshGradientBackground, MultiLayerEKG, FloatingParticles, NoiseTexture } from "@/components/EnhancedBackground";
import { GlassCard, TiltCard } from "@/components/EnhancedCards";

// ============================================================================
// RADIATING PULSE - Subtle background element at 15% opacity
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
    <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none" style={{ opacity: 0.15 }}>
      <div className="absolute top-1/2 right-[52%] -translate-y-1/2">
        {/* Outer radiating rings - perfectly centered */}
        {[1, 2, 3, 4, 5].map((ring) => {
          const size = 200 + ring * 120;
          const offset = (size - 200) / 2;
          return (
            <div
              key={ring}
              className="absolute rounded-full border border-[#0D9488]"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                top: `${-offset}px`,
                left: `${-offset}px`,
                animation: `pulse-ring-expand 4s ease-out infinite`,
                animationDelay: `${ring * 0.5}s`,
                opacity: 1 - ring * 0.15,
              }}
            />
          );
        })}
        
        {/* Central glowing orb */}
        <div 
          className={`relative w-[200px] h-[200px] rounded-full bg-gradient-to-br from-[#14B8A6] to-[#0D9488] transition-transform duration-300 ${beat ? 'scale-105' : 'scale-100'}`}
          style={{
            boxShadow: '0 0 60px rgba(13, 148, 136, 0.3)',
          }}
        >
          {/* EKG icon inside */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 80 40" className="w-24 h-auto text-white">
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
// SOFT EKG BACKGROUND - Very subtle, medical journal feel
// ============================================================================

function SoftEKGBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    resize();
    window.addEventListener("resize", resize);

    // M-shaped waveform (matches PulseM logo)
    const wave: number[] = [];
    for (let i = 0; i < 35; i++) wave.push(0.5);
    // First peak of M - sharp rise
    wave.push(0.5, 0.45, 0.38, 0.28, 0.15, 0.05);
    // Valley between M peaks
    wave.push(0.2, 0.4, 0.55, 0.7, 0.85);
    // Center dip of M (goes down past baseline)
    wave.push(0.95, 1.0, 0.95);
    // Second peak of M
    wave.push(0.85, 0.7, 0.55, 0.4, 0.2);
    // Sharp descent from second peak
    wave.push(0.05, 0.15, 0.28, 0.38, 0.45, 0.5);
    for (let i = 0; i < 45; i++) wave.push(0.5);

    const waveLen = wave.length;

    // Single very subtle rose trace
    const trace = { speed: 1.8, opacity: 0.08, y: 0.5, amplitude: 60, width: 2 };
    let x = -100;
    let waveIdx = 0;
    let points: { x: number; y: number; age: number }[] = [];

    let lastTime = performance.now();

    const draw = (time: number) => {
      const delta = Math.min(time - lastTime, 32);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      x += trace.speed * (delta / 16);
      waveIdx = (waveIdx + trace.speed * 0.4 * (delta / 16)) % waveLen;

      const waveVal = wave[Math.floor(waveIdx) % waveLen];
      const baseY = height * trace.y;
      const y = baseY + (waveVal - 0.5) * trace.amplitude * 2;

      if (x > -50) {
        points.push({ x, y, age: 0 });
      }

      points = points
        .map((p) => ({ ...p, age: p.age + delta }))
        .filter((p) => p.age < 6000);

      if (points.length > 1) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        points.forEach((p, j) => {
          if (j === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        // Very soft rose color
        ctx.strokeStyle = `rgba(225, 29, 72, ${trace.opacity})`;
        ctx.lineWidth = trace.width;
        ctx.stroke();
      }

      if (x > width + 200) {
        x = -200;
        points = [];
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
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
// SCROLL REVEAL
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
// CONVERSATION DEMO
// ============================================================================

const SCENARIOS = [
  {
    type: "Pediatrics",
    user: "My 18-month-old has been coughing more tonight and it sounds different than usual. He doesn't seem super sick, but it's making me nervous.",
    ai: `I'm really glad you reached out. It's stressful when something sounds off with their breathing.

When you watch him right now:
• Does his breathing look easy, or does it seem like he's working harder than usual?
• When he's calm and resting, do you hear any noisy breathing, or is it mostly just the cough?
• Is he still drinking and acting mostly like himself?`,
    meta: {
      source: "Practice protocol · Respiratory assessment v2.1",
      triage: "Home observation with red flags",
      phi: "0 patient identifiers sent"
    }
  },
  {
    type: "Post-op Orthopedics",
    user: "I had my ACL repair 3 days ago. My knee feels really warm to the touch and the swelling seems worse tonight than it was this morning. Is that normal?",
    ai: `It's good you're checking. While some swelling is expected, significant changes in warmth or swelling 3 days post-op need a closer look.

• Do you have a fever (temperature > 100.4°F)?
• Is the redness spreading or streaking away from the incision?
• Is there any new drainage or fluid leaking from the bandage?
• Is your pain controlled with the current medication schedule?`,
    meta: {
      source: "Post-op Protocol · ACL Reconstruction Day 3",
      triage: "Evaluate for infection/DVT",
      phi: "Anonymized session ID: #8821"
    }
  },
  {
    type: "Obstetrics",
    user: "I'm 34 weeks pregnant and I've had a headache for the past 3 hours that won't go away with Tylenol. My vision is a bit blurry too.",
    ai: `Please pay close attention to this. A persistent headache with vision changes at 34 weeks requires immediate evaluation to rule out preeclampsia.

• Do not wait until morning.
• Please proceed to Labor & Delivery triage now for a blood pressure check.
• Do you have safe transportation to the hospital right now?
• I am flagging this interaction for the on-call physician.`,
    meta: {
      source: "ACOG Guidelines · Preeclampsia Screening",
      triage: "Red Flag: Immediate Evaluation",
      phi: "Urgent Escalation Triggered"
    }
  }
];

function ConversationDemo() {
  const [index, setIndex] = useState(0);
  const [key, setKey] = useState(0); // Forces remount to reset animations

  useEffect(() => {
    // Cycle to next scenario every 14 seconds
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % SCENARIOS.length);
      setKey((prev) => prev + 1);
    }, 14000);
    return () => clearInterval(timer);
  }, []);

  const scenario = SCENARIOS[index];

  return (
    <ConversationCard key={key} scenario={scenario} />
  );
}

function ConversationCard({ scenario }: { scenario: typeof SCENARIOS[0] }) {
  const [stage, setStage] = useState(0);
  const { out, done } = useTyping(scenario.ai, 18, 2200);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 800);  // Show user msg
    const t2 = setTimeout(() => setStage(2), 2200); // Start AI typing
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <GlassCard className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-[#0D9488] animate-pulse" />
          <span className="text-sm text-[#64748B]">Live patient conversation</span>
        </div>
        <span className="text-xs font-medium text-[#0D9488] bg-[#F0FDFA] px-2 py-0.5 rounded-full">
          {scenario.type}
        </span>
      </div>

      {/* Messages */}
      <div className="space-y-4 mb-4">
        {/* Patient */}
        <div className={`transition-all duration-600 ease-out ${stage >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="bg-[#F1F5F9] rounded-2xl rounded-tl-sm px-4 py-3">
            <p className="text-sm text-[#1E293B] leading-relaxed">
              {scenario.user}
            </p>
          </div>
        </div>

        {/* AI */}
        <div className={`transition-all duration-600 ease-out ${stage >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="bg-[#0D9488] rounded-2xl rounded-tr-sm px-4 py-3 shadow-md shadow-teal-900/5">
            <p className="text-sm text-white leading-relaxed whitespace-pre-line">
              {out}
              {!done && (
                <span className="inline-block w-0.5 h-4 bg-white/70 ml-0.5 animate-pulse align-middle" />
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className={`mt-4 pt-4 border-t border-[#E2E8F0] transition-all duration-700 ${done ? "opacity-100" : "opacity-0"}`}>
        <div className="grid grid-cols-3 gap-3 mb-3">
          {[
            { label: "Knowledge source", value: scenario.meta.source },
            { label: "Triage status", value: scenario.meta.triage },
            { label: "PHI exposure", value: scenario.meta.phi },
          ].map((m) => (
            <div key={m.label}>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-[#0D9488]">{m.label}</p>
              <p className="text-xs text-[#64748B] mt-0.5 leading-tight">{m.value}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <button className="text-xs text-[#0D9488] hover:text-[#0F766E] font-medium px-4 py-1.5 rounded-full border border-[#0D9488]/30 hover:bg-[#F0FDFA] transition-colors">
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
      {/* Enhanced multi-layer backgrounds */}
      <MeshGradientBackground />
      <MultiLayerEKG />
      <FloatingParticles />
      <NoiseTexture />

      {/* NAVIGATION */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-1">
            <span className="text-xl font-semibold tracking-[0.02em] text-[#1E293B]">Pulse</span>
            <svg viewBox="0 0 56 48" className="h-7 w-auto text-[#E11D48]">
              {/* Clear M-shaped pulse: flat → up to peak → down to valley → up to peak → flat */}
              <path 
                d="M2 32 L8 32 L12 32 L12 10 L22 38 L28 10 L34 38 L44 10 L44 32 L48 32 L54 32" 
                stroke="currentColor" 
                strokeWidth="3.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                fill="none"
              />
              {/* Subtle glitch echo */}
              <path 
                d="M12 12 L22 36 L28 12" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                strokeOpacity="0.2"
                fill="none"
                transform="translate(2, -1)"
              />
            </svg>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: "Platform", href: "/" },
              { label: "For Practices", href: "/for-practices" },
              { label: "Technology", href: "/technology" },
            ].map((item) => (
              <a key={item.label} href={item.href} className="text-sm text-[#64748B] hover:text-[#1A1A1A] transition-colors">
                {item.label}
              </a>
            ))}
            <button className="rounded-full bg-[#0D9488] hover:bg-[#0F766E] px-5 py-2 text-sm font-medium text-white transition-colors">
              Schedule demo
            </button>
          </nav>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="relative px-6 py-16 md:py-24 overflow-hidden">
          {/* Radiating pulse background */}
          <RadiatingPulse />
          
          <div className="relative mx-auto max-w-6xl">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              {/* Left - Copy */}
              <div>
                <Reveal>
                  <h1 className="font-[family-name:var(--font-dm-serif)] text-4xl sm:text-5xl lg:text-6xl leading-[1.1] text-[#1A1A1A] mb-6">
                    Care that never sleeps. Oversight that never lapses.
                  </h1>
                </Reveal>

                <Reveal delay={100}>
                  <p className="text-base text-[#64748B] leading-relaxed mb-8 max-w-lg">
                    PulseMed is a white-label healthcare platform that provides 24/7 patient support through an AI assistant—operating within physician-defined boundaries, strict HIPAA safeguards, and no autonomous decision making.
                  </p>
                </Reveal>

                <Reveal delay={200}>
                  <div className="flex flex-wrap gap-3 mb-8">
                    <button className="rounded-full bg-gradient-to-r from-[#0D9488] to-[#14B8A6] hover:from-[#0F766E] hover:to-[#0D9488] px-6 py-2.5 text-sm font-medium text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                      See how it works
                    </button>
                    <button className="rounded-full border-2 border-[#0D9488] px-6 py-2.5 text-sm font-medium text-[#0D9488] hover:bg-[#0D9488] hover:text-white transition-all duration-300 shadow-md hover:shadow-lg">
                      Schedule a demo
                    </button>
                  </div>
                </Reveal>

                <Reveal delay={300}>
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-1">
                      <div className="w-7 h-7 rounded-full bg-[#0D9488]" />
                      <div className="w-7 h-7 rounded-full bg-[#F87171]" />
                      <div className="w-7 h-7 rounded-full bg-[#60A5FA]" />
                    </div>
                    <p className="text-sm text-[#64748B]">
                      Built by physicians, deployed in live clinics
                    </p>
                  </div>
                </Reveal>
              </div>

              {/* Right - Conversation Demo */}
              <Reveal delay={200}>
                <ConversationDemo />
              </Reveal>
            </div>
          </div>
        </section>

        {/* ANATOMY OF TRUST */}
        <section className="px-6 py-16 md:py-24 bg-white/60 backdrop-blur-sm relative z-10">
          <div className="mx-auto max-w-6xl">
            <Reveal className="text-center mb-12">
              <h2 className="font-[family-name:var(--font-dm-serif)] text-3xl sm:text-4xl text-[#1A1A1A] mb-4">
                The anatomy of trust
              </h2>
              <p className="text-base text-[#64748B] max-w-xl mx-auto">
                Every layer exists for a reason. Every constraint protects a patient.
              </p>
            </Reveal>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", title: "Physician Input", desc: "Your clinical expertise becomes the system's foundation. Protocols, boundaries, and approved sources — all defined by you." },
                { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", title: "Defined Boundaries", desc: "The AI operates within strict guardrails. It cannot diagnose, prescribe, or exceed its defined scope." },
                { icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z", title: "AI Processing", desc: "Within those boundaries, the system provides warm, clear guidance — traced to your approved knowledge." },
                { icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", title: "Auditable Output", desc: "Every response is logged, traceable, and reviewable. Full transparency, always." },
              ].map((item, i) => (
                <Reveal key={item.title} delay={i * 80}>
                  <TiltCard>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#F0FDFA] to-[#CCFBF1] shadow-inner">
                      <svg className="h-6 w-6 text-[#0D9488]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                    </div>
                    <h3 className="font-[family-name:var(--font-dm-serif)] text-lg text-[#1A1A1A] mb-2">{item.title}</h3>
                    <p className="text-sm text-[#64748B] leading-relaxed">{item.desc}</p>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* METRICS */}
        <section className="px-6 py-16 md:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <Reveal>
                <h2 className="font-[family-name:var(--font-dm-serif)] text-3xl sm:text-4xl text-[#1A1A1A] mb-6">
                  From late-night questions to long-term trust.
                </h2>
                <p className="text-base text-[#64748B] leading-relaxed mb-4">
                  PulseMed was developed by physicians, with input from practice managers and caregivers. The platform adapts to different specialties and workflows while maintaining strict boundaries around clinical decision-making and data handling.
                </p>
                <p className="text-sm text-[#94A3B8]">
                  Designed to pass risk committee review, not marketing decks.
                </p>
              </Reveal>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: "0", label: "Autonomous clinical decisions. Ever." },
                  { value: "<2%", label: "Hallucination rate. Constrained by physician-approved sources." },
                  { value: "100%", label: "Response traceability. No unvetted sources." },
                  { value: "24/7", label: "Patient support availability." },
                ].map((m, i) => (
                  <Reveal key={m.label} delay={i * 80}>
                    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                      <div className="font-[family-name:var(--font-dm-serif)] text-4xl bg-gradient-to-r from-[#E11D48] to-[#F43F5E] bg-clip-text text-transparent">{m.value}</div>
                      <p className="text-xs text-[#64748B] mt-2">{m.label}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* TRUST BANNER */}
        <section className="px-6 py-12">
          <div className="mx-auto max-w-4xl">
            <Reveal>
              <div className="rounded-2xl bg-[#F0FDFA] border border-[#99F6E4] px-8 py-10 text-center">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                  <svg className="h-7 w-7 text-[#0D9488]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-[family-name:var(--font-dm-serif)] text-2xl sm:text-3xl text-[#1A1A1A] mb-3">
                  Designed to withstand clinical, legal, and operational review.
                </h3>
                <p className="text-base text-[#64748B] max-w-2xl mx-auto">
                  Every constraint is intentional. Every boundary is auditable. Every response is traceable to physician-approved sources.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-16 md:py-24 bg-white/60 backdrop-blur-sm relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <h2 className="font-[family-name:var(--font-dm-serif)] text-3xl sm:text-4xl text-[#1A1A1A] mb-4">
                Ready to see PulseMed in your practice?
              </h2>
              <p className="text-base text-[#64748B] mb-8 max-w-xl mx-auto">
                Discuss your specialty, patient volume, and current workflows. We'll provide a demonstration and outline deployment options that maintain clinical control and HIPAA compliance.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button className="rounded-full bg-gradient-to-r from-[#0D9488] to-[#14B8A6] hover:from-[#0F766E] hover:to-[#0D9488] px-7 py-3 text-sm font-medium text-white transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 hover:-translate-y-1">
                  Schedule a clinical demo
                </button>
                <button className="rounded-full border-2 border-[#CBD5E1] px-7 py-3 text-sm font-medium text-[#64748B] hover:border-[#0D9488] hover:text-[#0D9488] hover:bg-white transition-all duration-300 shadow-md hover:shadow-lg">
                  Contact clinical operations
                </button>
              </div>
            </Reveal>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-[#E2E8F0] px-6 py-10">
          <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1">
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
            </div>
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
