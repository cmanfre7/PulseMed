"use client";

import { useState, useEffect, useRef } from "react";

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
      <div className="absolute top-1/2 right-[15%] -translate-y-1/2">
        {/* Outer radiating rings */}
        {[1, 2, 3, 4, 5].map((ring) => (
          <div
            key={ring}
            className="absolute rounded-full border border-[#0D9488]"
            style={{
              width: `${200 + ring * 120}px`,
              height: `${200 + ring * 120}px`,
              top: `${-(100 + ring * 60)}px`,
              left: `${-(100 + ring * 60)}px`,
              animation: `pulse-ring-expand 4s ease-out infinite`,
              animationDelay: `${ring * 0.5}s`,
              opacity: 1 - ring * 0.15,
            }}
          />
        ))}
        
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

    // PQRST waveform
    const wave: number[] = [];
    for (let i = 0; i < 40; i++) wave.push(0.5);
    wave.push(0.5, 0.53, 0.56, 0.58, 0.56, 0.53, 0.5);
    for (let i = 0; i < 10; i++) wave.push(0.5);
    wave.push(0.5, 0.47, 0.42, 0.3, 0.1, 0.95, 1.0, 0.7, 0.35, 0.4, 0.47, 0.5);
    for (let i = 0; i < 12; i++) wave.push(0.5);
    wave.push(0.5, 0.54, 0.58, 0.62, 0.65, 0.62, 0.58, 0.54, 0.5);
    for (let i = 0; i < 50; i++) wave.push(0.5);

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

function ConversationDemo() {
  const [stage, setStage] = useState(0);

  const response = `I'm really glad you reached out. It's stressful when something sounds off with their breathing, especially at night.

When you watch him right now:
• Does his breathing look easy, or does it seem like he's working harder than usual?
• When he's calm and resting, do you hear any noisy breathing, or is it mostly just the cough?
• Is he still drinking and acting mostly like himself?
• Have you noticed any color changes around his lips or face?`;

  const { out, done } = useTyping(response, 18, stage >= 2 ? 400 : 99999);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 800);
    const t2 = setTimeout(() => setStage(2), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-[#0D9488]" />
          <span className="text-sm text-[#64748B]">Live patient conversation</span>
        </div>
        <span className="text-xs text-[#94A3B8]">PulseMed · Clinical AI</span>
      </div>

      {/* Messages */}
      <div className="space-y-3">
        {/* Patient */}
        <div className={`transition-all duration-600 ${stage >= 1 ? "opacity-100" : "opacity-0 translate-y-2"}`}>
          <div className="bg-[#F1F5F9] rounded-2xl rounded-tl-sm px-4 py-3">
            <p className="text-sm text-[#1E293B] leading-relaxed">
              My 18-month-old has been coughing more tonight and it sounds different than usual. He doesn't seem super sick, but it's making me nervous.
            </p>
          </div>
        </div>

        {/* AI */}
        <div className={`transition-all duration-600 ${stage >= 2 ? "opacity-100" : "opacity-0 translate-y-2"}`}>
          <div className="bg-[#0D9488] rounded-2xl rounded-tr-sm px-4 py-3">
            <p className="text-sm text-white leading-relaxed whitespace-pre-line">
              {out}
              {!done && stage >= 2 && (
                <span className="inline-block w-0.5 h-4 bg-white/70 ml-0.5 animate-pulse" />
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className={`mt-4 pt-4 border-t border-[#E2E8F0] transition-all duration-600 ${done ? "opacity-100" : "opacity-0"}`}>
        <div className="grid grid-cols-3 gap-3 mb-3">
          {[
            { label: "Knowledge source", value: "Practice protocol · Respiratory assessment v2.1" },
            { label: "Triage status", value: "Home observation with red flags" },
            { label: "PHI exposure", value: "0 patient identifiers sent" },
          ].map((m) => (
            <div key={m.label}>
              <p className="text-xs font-medium text-[#0D9488]">{m.label}</p>
              <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">{m.value}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <button className="text-xs text-[#0D9488] hover:text-[#0F766E] px-4 py-2 rounded-full border border-[#0D9488]/30 hover:bg-[#F0FDFA] transition-colors">
            View source protocol
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#FAFAF7]">
      <SoftEKGBackground />

      {/* NAVIGATION */}
      <header className="sticky top-0 z-50 bg-[#FAFAF7]/80 backdrop-blur-md border-b border-[#E2E8F0]">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 32 32" className="h-7 w-7 text-[#E11D48]">
              <path
                d="M4,16 L10,16 L13,8 L16,24 L19,12 L22,16 L28,16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-sm font-semibold tracking-[0.15em] text-[#1A1A1A] uppercase">PulseMed</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {["Platform", "For Practices", "Technology", "Pricing"].map((item) => (
              <button key={item} className="text-sm text-[#64748B] hover:text-[#1A1A1A] transition-colors">
                {item}
              </button>
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
                    <button className="rounded-full bg-[#0D9488] hover:bg-[#0F766E] px-6 py-2.5 text-sm font-medium text-white transition-colors">
                      See how it works
                    </button>
                    <button className="rounded-full border border-[#0D9488] px-6 py-2.5 text-sm font-medium text-[#0D9488] hover:bg-[#F0FDFA] transition-colors">
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

        {/* Subtle heartbeat divider */}
        <div className="px-6">
          <div className="mx-auto max-w-xs">
            <svg viewBox="0 0 200 30" className="w-full h-6 text-[#E11D48]/20">
              <path
                d="M0,15 L60,15 L80,5 L100,25 L120,10 L140,15 L200,15"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* ANATOMY OF TRUST */}
        <section className="px-6 py-16 md:py-24">
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
                  <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#F0FDFA]">
                      <svg className="h-6 w-6 text-[#0D9488]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                    </div>
                    <h3 className="font-[family-name:var(--font-dm-serif)] text-lg text-[#1A1A1A] mb-2">{item.title}</h3>
                    <p className="text-sm text-[#64748B] leading-relaxed">{item.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Subtle heartbeat divider */}
        <div className="px-6">
          <div className="mx-auto max-w-xs">
            <svg viewBox="0 0 200 30" className="w-full h-6 text-[#E11D48]/20">
              <path
                d="M0,15 L60,15 L80,5 L100,25 L120,10 L140,15 L200,15"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

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
                    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5">
                      <div className="font-[family-name:var(--font-dm-serif)] text-4xl text-[#E11D48]">{m.value}</div>
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
        <section className="px-6 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <svg viewBox="0 0 200 30" className="w-32 h-6 mx-auto mb-6 text-[#E11D48]/30">
                <path
                  d="M0,15 L60,15 L80,5 L100,25 L120,10 L140,15 L200,15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <h2 className="font-[family-name:var(--font-dm-serif)] text-3xl sm:text-4xl text-[#1A1A1A] mb-4">
                Ready to see PulseMed in your practice?
              </h2>
              <p className="text-base text-[#64748B] mb-8 max-w-xl mx-auto">
                Discuss your specialty, patient volume, and current workflows. We'll provide a demonstration and outline deployment options that maintain clinical control and HIPAA compliance.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button className="rounded-full bg-[#0D9488] hover:bg-[#0F766E] px-7 py-3 text-sm font-medium text-white transition-colors">
                  Schedule a clinical demo
                </button>
                <button className="rounded-full border border-[#CBD5E1] px-7 py-3 text-sm font-medium text-[#64748B] hover:border-[#94A3B8] hover:bg-white transition-colors">
                  Contact clinical operations
                </button>
              </div>
            </Reveal>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-[#E2E8F0] px-6 py-10">
          <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 32 32" className="h-6 w-6 text-[#E11D48]">
                <path
                  d="M4,16 L10,16 L13,8 L16,24 L19,12 L22,16 L28,16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-sm font-semibold tracking-[0.15em] text-[#1A1A1A] uppercase">PulseMed</span>
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
