"use client";

import { useState, useEffect, useRef } from "react";

// ============================================================================
// THE LIVING PULSE - Central animated heartbeat visualization
// ============================================================================

function LivingPulse() {
  const [beat, setBeat] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setBeat(true);
      setTimeout(() => setBeat(false), 300);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-72 h-72 md:w-96 md:h-96">
      {/* Outer radiating rings */}
      {[1, 2, 3, 4].map((ring) => (
        <div
          key={ring}
          className="absolute inset-0 rounded-full border-2 border-teal-500/20"
          style={{
            animation: `pulse-ring-expand 3s ease-out infinite`,
            animationDelay: `${ring * 0.4}s`,
          }}
        />
      ))}
      
      {/* Glowing core */}
      <div 
        className={`absolute inset-8 md:inset-12 rounded-full bg-gradient-to-br from-teal-400 via-teal-500 to-teal-600 shadow-2xl transition-transform duration-300 ${beat ? 'scale-110' : 'scale-100'}`}
        style={{
          boxShadow: beat 
            ? '0 0 60px rgba(20, 184, 166, 0.5), 0 0 120px rgba(20, 184, 166, 0.25), inset 0 0 60px rgba(255,255,255,0.1)' 
            : '0 0 40px rgba(20, 184, 166, 0.35), 0 0 80px rgba(20, 184, 166, 0.15), inset 0 0 40px rgba(255,255,255,0.1)',
        }}
      >
        {/* Inner pulse icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 100 50" className="w-32 md:w-40 h-auto text-white/90">
            <path
              d="M0,25 L25,25 L35,10 L45,40 L55,5 L65,25 L100,25"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-ekg-draw"
            />
          </svg>
        </div>
      </div>

      {/* Ambient glow */}
      <div 
        className={`absolute inset-0 rounded-full bg-teal-500/15 blur-3xl transition-opacity duration-300 ${beat ? 'opacity-100' : 'opacity-50'}`}
      />
    </div>
  );
}

// ============================================================================
// MASSIVE EKG BACKGROUND - Large, dramatic, continuously animating
// ============================================================================

function MassiveEKGBackground() {
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
    wave.push(0.5, 0.53, 0.56, 0.58, 0.56, 0.53, 0.5); // P
    for (let i = 0; i < 10; i++) wave.push(0.5);
    wave.push(0.5, 0.47, 0.42, 0.3, 0.1, 0.95, 1.0, 0.7, 0.35, 0.4, 0.47, 0.5); // QRS
    for (let i = 0; i < 12; i++) wave.push(0.5);
    wave.push(0.5, 0.54, 0.58, 0.62, 0.65, 0.62, 0.58, 0.54, 0.5); // T
    for (let i = 0; i < 50; i++) wave.push(0.5);

    const waveLen = wave.length;

    // Multiple large traces - softer colors
    const traces = [
      { speed: 2.0, opacity: 0.06, y: 0.22, amplitude: 120, color: "20, 184, 166", width: 4, glow: 20 }, // teal
      { speed: 1.4, opacity: 0.04, y: 0.50, amplitude: 100, color: "244, 63, 94", width: 3, glow: 15 },  // soft rose
      { speed: 2.5, opacity: 0.03, y: 0.78, amplitude: 80, color: "20, 184, 166", width: 2.5, glow: 12 }, // teal
    ];

    const states = traces.map(() => ({
      x: Math.random() * -500 - 100,
      waveIdx: 0,
      points: [] as { x: number; y: number; age: number }[],
    }));

    let lastTime = performance.now();

    const draw = (time: number) => {
      const delta = Math.min(time - lastTime, 32);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      traces.forEach((trace, i) => {
        const state = states[i];

        // Advance
        state.x += trace.speed * (delta / 16);
        state.waveIdx = (state.waveIdx + trace.speed * 0.4 * (delta / 16)) % waveLen;

        const waveVal = wave[Math.floor(state.waveIdx) % waveLen];
        const baseY = height * trace.y;
        const y = baseY + (waveVal - 0.5) * trace.amplitude * 2;

        // Add point
        if (state.x > -50) {
          state.points.push({ x: state.x, y, age: 0 });
        }

        // Age points
        state.points = state.points
          .map((p) => ({ ...p, age: p.age + delta }))
          .filter((p) => p.age < 5000);

        // Draw with glow
        if (state.points.length > 1) {
          ctx.shadowColor = `rgba(${trace.color}, 0.4)`;
          ctx.shadowBlur = trace.glow;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";

          ctx.beginPath();
          state.points.forEach((p, j) => {
            if (j === 0) {
              ctx.moveTo(p.x, p.y);
            } else {
              ctx.lineTo(p.x, p.y);
            }
          });
          ctx.strokeStyle = `rgba(${trace.color}, ${trace.opacity})`;
          ctx.lineWidth = trace.width;
          ctx.stroke();

          // Bright head
          const head = state.points[state.points.length - 1];
          if (head) {
            ctx.beginPath();
            ctx.arc(head.x, head.y, trace.width * 1.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${trace.color}, ${trace.opacity * 2.5})`;
            ctx.shadowBlur = trace.glow * 2;
            ctx.fill();
          }

          ctx.shadowBlur = 0;
        }

        // Reset
        if (state.x > width + 200) {
          state.x = -200;
          state.points = [];
        }
      });

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
// ANIMATED COUNTER
// ============================================================================

function AnimatedCounter({ value, suffix = "", duration = 2000 }: { value: string; suffix?: string; duration?: number }) {
  const [display, setDisplay] = useState("0");
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;

    const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
    const isLessThan = value.startsWith("<");
    const hasPercent = value.includes("%");

    if (isNaN(numericValue)) {
      setDisplay(value);
      return;
    }

    const startTime = performance.now();
    const animate = (time: number) => {
      const progress = Math.min((time - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = numericValue * eased;

      let formatted = current < 10 ? current.toFixed(1) : Math.round(current).toString();
      if (isLessThan) formatted = "<" + formatted;
      if (hasPercent) formatted += "%";

      setDisplay(formatted);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplay(value);
      }
    };

    requestAnimationFrame(animate);
  }, [started, value, duration]);

  return <span ref={ref}>{display}{suffix}</span>;
}

// ============================================================================
// SCROLL REVEAL WITH PARALLAX
// ============================================================================

function Reveal({ 
  children, 
  className = "", 
  delay = 0,
  direction = "up" 
}: { 
  children: React.ReactNode; 
  className?: string; 
  delay?: number;
  direction?: "up" | "left" | "right";
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const transforms = {
    up: "translateY(60px)",
    left: "translateX(-60px)",
    right: "translateX(60px)",
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translate(0)" : transforms[direction],
        transition: `opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1), transform 0.9s cubic-bezier(0.16, 1, 0.3, 1)`,
        transitionDelay: `${delay}ms`,
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
// CONVERSATION DEMO - Premium floating card
// ============================================================================

function ConversationDemo() {
  const [stage, setStage] = useState(0);
  const [pulseGlow, setPulseGlow] = useState(false);

  const response = `I'm really glad you reached out. It's stressful when something sounds off with their breathing, especially at night.

When you watch him right now:
• Does his breathing look easy, or does it seem like he's working harder than usual?
• When he's calm and resting, do you hear any noisy breathing, or is it mostly just the cough?
• Is he still drinking and acting mostly like himself?
• Have you noticed any color changes around his lips or face?`;

  const { out, done } = useTyping(response, 16, stage >= 2 ? 300 : 99999);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 600);
    const t2 = setTimeout(() => setStage(2), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseGlow(true);
      setTimeout(() => setPulseGlow(false), 300);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className={`relative rounded-3xl bg-white/95 backdrop-blur-xl p-6 md:p-8 transition-shadow duration-300 ${
        pulseGlow ? 'shadow-2xl shadow-teal-500/15' : 'shadow-xl shadow-stone-900/8'
      }`}
      style={{
        border: '1px solid rgba(20, 184, 166, 0.12)',
      }}
    >
      {/* Glowing border effect */}
      <div 
        className={`absolute inset-0 rounded-3xl transition-opacity duration-300 pointer-events-none ${
          pulseGlow ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: 'linear-gradient(135deg, rgba(20,184,166,0.08) 0%, transparent 50%, rgba(20,184,166,0.05) 100%)',
        }}
      />

      {/* Header */}
      <div className="relative flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75 animate-ping" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-teal-500" />
          </span>
          <span className="text-sm font-semibold text-stone-600">Live patient conversation</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-teal-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3,12 L7,12 L10,4 L14,20 L17,12 L21,12" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-xs font-medium text-stone-400">PulseMed AI</span>
        </div>
      </div>

      {/* Messages */}
      <div className="relative space-y-4 min-h-[280px]">
        {/* Patient */}
        <div className={`transition-all duration-700 ease-out ${stage >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-stone-200 to-stone-300 flex-shrink-0" />
            <div className="bg-stone-100 rounded-2xl rounded-tl-md px-4 py-3 max-w-[85%]">
              <p className="text-sm text-stone-700 leading-relaxed">
                My 18-month-old has been coughing more tonight and it sounds different than usual. He doesn't seem super sick, but it's making me nervous.
              </p>
            </div>
          </div>
        </div>

        {/* AI */}
        <div className={`transition-all duration-700 ease-out ${stage >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="flex gap-3 justify-end">
            <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl rounded-tr-md px-4 py-3 max-w-[85%] shadow-lg shadow-teal-500/15">
              <p className="text-sm text-white leading-relaxed whitespace-pre-line">
                {out}
                {!done && stage >= 2 && (
                  <span className="inline-block w-0.5 h-4 bg-white/80 ml-1 animate-pulse" />
                )}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-500 flex-shrink-0 flex items-center justify-center shadow-md shadow-teal-500/20">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3,12 L7,12 L10,4 L14,20 L17,12 L21,12" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className={`relative mt-6 pt-6 border-t border-stone-100 transition-all duration-700 ${done ? "opacity-100" : "opacity-0"}`}>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Source", value: "Respiratory v2.1", color: "text-teal-600" },
            { label: "Triage", value: "Home observation", color: "text-amber-600" },
            { label: "PHI Sent", value: "None", color: "text-emerald-600" },
          ].map((m) => (
            <div key={m.label} className="text-center p-3 rounded-xl bg-stone-50/80">
              <p className={`text-xs font-bold ${m.color}`}>{m.label}</p>
              <p className="text-xs text-stone-500 mt-1">{m.value}</p>
            </div>
          ))}
        </div>
        <button className="mt-4 w-full py-2.5 text-sm font-semibold text-teal-600 hover:text-teal-700 rounded-xl hover:bg-teal-50 transition-all">
          View Full Audit Trail →
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// FEATURE CARD WITH HOVER EFFECTS
// ============================================================================

function FeatureCard({ icon, title, description, index }: { icon: string; title: string; description: string; index: number }) {
  const [hover, setHover] = useState(false);

  return (
    <Reveal delay={index * 100}>
      <div
        className="group relative h-full rounded-2xl bg-white/90 backdrop-blur-sm p-8 transition-all duration-500 cursor-default"
        style={{
          boxShadow: hover 
            ? '0 25px 50px -12px rgba(20, 184, 166, 0.12), 0 0 0 1px rgba(20, 184, 166, 0.08)' 
            : '0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.02)',
          transform: hover ? 'translateY(-8px)' : 'translateY(0)',
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-500 ${
          hover ? 'bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shadow-teal-500/25' : 'bg-teal-50'
        }`}>
          <svg className={`h-6 w-6 transition-colors duration-500 ${hover ? 'text-white' : 'text-teal-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-stone-800 mb-3">{title}</h3>
        <p className="text-base text-stone-500 leading-relaxed">{description}</p>
      </div>
    </Reveal>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: 'linear-gradient(180deg, #FAFAF9 0%, #FFFFFF 30%, #FAFAF9 100%)' }}>
      <MassiveEKGBackground />

      {/* NAVIGATION */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-stone-200/50">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3,12 L7,12 L10,4 L14,20 L17,12 L21,12" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-lg font-bold text-stone-800">PulseMed</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {["Platform", "For Practices", "Technology", "Pricing"].map((item) => (
              <button key={item} className="text-sm font-medium text-stone-500 hover:text-stone-800 transition-colors">
                {item}
              </button>
            ))}
            <button className="rounded-full bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-teal-500/20 hover:shadow-xl hover:shadow-teal-500/25 hover:-translate-y-0.5 transition-all">
              Get Started
            </button>
          </nav>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="relative px-6 py-20 md:py-32 overflow-hidden">
          <div className="mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left - Copy */}
              <div className="relative z-10">
                <Reveal>
                  <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-4 py-2 mb-8">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-teal-500 opacity-75 animate-ping" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500" />
                    </span>
                    <span className="text-sm font-semibold text-teal-700">Physician-Controlled Medical AI</span>
                  </div>
                </Reveal>

                <Reveal delay={100}>
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] text-stone-800 mb-8">
                    Care that{" "}
                    <span className="text-teal-600">never sleeps.</span>
                    <br />
                    Oversight that{" "}
                    <span className="text-teal-600">never lapses.</span>
                  </h1>
                </Reveal>

                <Reveal delay={200}>
                  <p className="text-xl text-stone-500 leading-relaxed mb-10 max-w-xl">
                    PulseMed delivers 24/7 patient support through AI that operates within{" "}
                    <span className="text-stone-700 font-semibold">physician-defined boundaries</span>—with complete auditability and{" "}
                    <span className="text-stone-700 font-semibold">zero autonomous decisions</span>.
                  </p>
                </Reveal>

                <Reveal delay={300}>
                  <div className="flex flex-wrap gap-4">
                    <button className="group rounded-full bg-gradient-to-r from-teal-500 to-teal-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-teal-500/20 hover:shadow-2xl hover:shadow-teal-500/25 hover:-translate-y-1 transition-all">
                      Watch Demo
                      <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
                    </button>
                    <button className="rounded-full border-2 border-stone-200 px-8 py-4 text-base font-bold text-stone-700 hover:border-teal-300 hover:bg-teal-50/50 transition-all">
                      Learn More
                    </button>
                  </div>
                </Reveal>

                <Reveal delay={400}>
                  <div className="flex items-center gap-6 mt-12 pt-8 border-t border-stone-200/50">
                    <div className="flex -space-x-3">
                      {[1,2,3,4].map((i) => (
                        <div key={i} className="w-11 h-11 rounded-full border-2 border-white bg-gradient-to-br from-stone-200 to-stone-300 shadow-md" />
                      ))}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-stone-700">Trusted by 50+ practices</p>
                      <p className="text-sm text-stone-400">Serving 15,000+ patients</p>
                    </div>
                  </div>
                </Reveal>
              </div>

              {/* Right - Living Pulse + Demo */}
              <div className="relative flex flex-col items-center gap-12">
                <Reveal delay={200}>
                  <LivingPulse />
                </Reveal>
                <Reveal delay={400} className="w-full max-w-md">
                  <ConversationDemo />
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="relative px-6 py-24 md:py-32">
          <div className="mx-auto max-w-7xl">
            <Reveal className="text-center mb-20">
              <h2 className="text-4xl sm:text-5xl font-bold text-stone-800 mb-6">
                The Anatomy of Trust
              </h2>
              <p className="text-xl text-stone-500 max-w-2xl mx-auto">
                Every layer exists for a reason. Every constraint protects a patient.
              </p>
            </Reveal>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", title: "Physician Input", description: "Your clinical expertise becomes the system's foundation. Every protocol, boundary, and source—defined by you." },
                { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", title: "Strict Boundaries", description: "The AI cannot diagnose, prescribe, or exceed its defined scope. Hard limits, not suggestions." },
                { icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z", title: "AI Processing", description: "Warm, clear guidance within boundaries—every response traced to your approved knowledge base." },
                { icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", title: "Full Auditability", description: "Every response logged, traceable, and reviewable. Complete transparency, always." },
              ].map((feature, i) => (
                <FeatureCard key={feature.title} {...feature} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* METRICS */}
        <section className="relative px-6 py-24 md:py-32 bg-gradient-to-b from-transparent via-teal-50/30 to-transparent">
          <div className="mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <Reveal direction="left">
                <h2 className="text-4xl sm:text-5xl font-bold text-stone-800 mb-8">
                  From Late-Night Questions to Lifelong Trust
                </h2>
                <p className="text-xl text-stone-500 leading-relaxed mb-6">
                  Built by physicians. Tested by risk committees. Deployed in live clinical settings where real families depend on it.
                </p>
                <p className="text-lg text-stone-400">
                  Designed to withstand clinical, legal, and operational scrutiny.
                </p>
              </Reveal>

              <div className="grid grid-cols-2 gap-6">
                {[
                  { value: "0", label: "Autonomous Decisions", accent: true },
                  { value: "<2%", label: "Hallucination Rate", accent: false },
                  { value: "100%", label: "Traceability", accent: false },
                  { value: "24/7", label: "Availability", accent: true },
                ].map((m, i) => (
                  <Reveal key={m.label} delay={i * 100} direction="right">
                    <div className="rounded-2xl bg-white/90 backdrop-blur-sm p-8 text-center shadow-lg shadow-stone-900/5 border border-stone-100">
                      <div className={`text-5xl font-bold ${m.accent ? 'text-rose-400' : 'text-teal-600'}`}>
                        <AnimatedCounter value={m.value} />
                      </div>
                      <p className="mt-3 text-sm font-medium text-stone-500">{m.label}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative px-6 py-24 md:py-32">
          <div className="mx-auto max-w-4xl">
            <Reveal>
              <div className="relative rounded-3xl bg-gradient-to-br from-teal-500 via-teal-500 to-teal-600 p-12 md:p-16 text-center overflow-hidden shadow-2xl shadow-teal-500/20">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-600/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
                
                <div className="relative z-10">
                  <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                    Ready to Transform Your Practice?
                  </h2>
                  <p className="text-xl text-teal-100 mb-10 max-w-2xl mx-auto">
                    See how PulseMed can provide round-the-clock patient support while keeping you in complete clinical control.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <button className="rounded-full bg-white px-10 py-4 text-base font-bold text-teal-600 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                      Schedule Demo →
                    </button>
                    <button className="rounded-full border-2 border-white/50 px-10 py-4 text-base font-bold text-white hover:bg-white/10 transition-all">
                      Contact Sales
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-stone-200/50 px-6 py-12">
          <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M3,12 L7,12 L10,4 L14,20 L17,12 L21,12" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-base font-bold text-stone-700">PulseMed</span>
            </div>
            <div className="flex gap-8 text-sm font-medium text-stone-500">
              {["Privacy", "Terms", "HIPAA", "Security", "Contact"].map((l) => (
                <button key={l} className="hover:text-stone-800 transition-colors">{l}</button>
              ))}
            </div>
            <p className="text-sm text-stone-400">© 2024 PulseMed. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
