"use client";

import { useEffect, useRef } from "react";

// ============================================================================
// MESH GRADIENT BACKGROUND - Animated multi-color gradient
// ============================================================================

export function MeshGradientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    let offset = 0;

    const draw = () => {
      offset += 0.3;

      // Create radial gradients that shift
      const grad1 = ctx.createRadialGradient(
        width * 0.2 + Math.sin(offset * 0.001) * 100,
        height * 0.3 + Math.cos(offset * 0.0015) * 100,
        0,
        width * 0.2,
        height * 0.3,
        width * 0.6
      );
      grad1.addColorStop(0, "rgba(225, 29, 72, 0.08)"); // Rose
      grad1.addColorStop(1, "rgba(225, 29, 72, 0)");

      const grad2 = ctx.createRadialGradient(
        width * 0.8 + Math.cos(offset * 0.0012) * 100,
        height * 0.7 + Math.sin(offset * 0.001) * 100,
        0,
        width * 0.8,
        height * 0.7,
        width * 0.6
      );
      grad2.addColorStop(0, "rgba(13, 148, 136, 0.08)"); // Teal
      grad2.addColorStop(1, "rgba(13, 148, 136, 0)");

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
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
// MULTI-LAYER EKG BACKGROUND - Parallax depth
// ============================================================================

export function MultiLayerEKG() {
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

    const wave: number[] = [];
    for (let i = 0; i < 35; i++) wave.push(0.5);
    wave.push(0.5, 0.45, 0.38, 0.28, 0.15, 0.05);
    wave.push(0.2, 0.4, 0.55, 0.7, 0.85);
    wave.push(0.95, 1.0, 0.95);
    wave.push(0.85, 0.7, 0.55, 0.4, 0.2);
    wave.push(0.05, 0.15, 0.28, 0.38, 0.45, 0.5);
    for (let i = 0; i < 45; i++) wave.push(0.5);

    const waveLen = wave.length;

    // Three layers at different speeds and opacities
    const traces = [
      { speed: 1.2, opacity: 0.06, y: 0.3, amplitude: 40, width: 1.5, points: [] as { x: number; y: number; age: number }[], x: -100, waveIdx: 0 },
      { speed: 1.8, opacity: 0.12, y: 0.5, amplitude: 60, width: 2.5, points: [] as { x: number; y: number; age: number }[], x: -150, waveIdx: 0 },
      { speed: 2.4, opacity: 0.08, y: 0.7, amplitude: 50, width: 2, points: [] as { x: number; y: number; age: number }[], x: -200, waveIdx: 0 },
    ];

    let lastTime = performance.now();

    const draw = (time: number) => {
      const delta = Math.min(time - lastTime, 32);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      for (const trace of traces) {
        trace.x += trace.speed * (delta / 16);
        trace.waveIdx = (trace.waveIdx + trace.speed * 0.4 * (delta / 16)) % waveLen;

        const waveVal = wave[Math.floor(trace.waveIdx) % waveLen];
        const baseY = height * trace.y;
        const y = baseY + (waveVal - 0.5) * trace.amplitude * 2;

        if (trace.x > -50) {
          trace.points.push({ x: trace.x, y, age: 0 });
        }

        trace.points = trace.points
          .map((p) => ({ ...p, age: p.age + delta }))
          .filter((p) => p.age < 6000);

        if (trace.points.length > 1) {
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.beginPath();
          trace.points.forEach((p, j) => {
            if (j === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          });
          ctx.strokeStyle = `rgba(225, 29, 72, ${trace.opacity})`;
          ctx.lineWidth = trace.width;
          ctx.stroke();
        }

        if (trace.x > width + 200) {
          trace.x = -200;
          trace.points = [];
        }
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
      style={{ zIndex: 1 }}
    />
  );
}

// ============================================================================
// FLOATING PARTICLES
// ============================================================================

export function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    const particles: { x: number; y: number; vx: number; vy: number; size: number; color: string }[] = [];

    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 3 + 1,
        color: Math.random() > 0.5 ? "rgba(225, 29, 72, 0.15)" : "rgba(13, 148, 136, 0.15)",
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }

      requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
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
// NOISE TEXTURE OVERLAY
// ============================================================================

export function NoiseTexture() {
  return (
    <div
      className="fixed inset-0 pointer-events-none opacity-[0.015]"
      style={{
        zIndex: 2,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
      }}
    />
  );
}
