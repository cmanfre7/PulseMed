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
      offset += 0.2; // Slower animation

      // Create radial gradients that shift
      const grad1 = ctx.createRadialGradient(
        width * 0.2 + Math.sin(offset * 0.001) * 100,
        height * 0.3 + Math.cos(offset * 0.0015) * 100,
        0,
        width * 0.2,
        height * 0.3,
        width * 0.6
      );
      grad1.addColorStop(0, "rgba(225, 29, 72, 0.05)"); // Rose, very subtle
      grad1.addColorStop(1, "rgba(225, 29, 72, 0)");

      const grad2 = ctx.createRadialGradient(
        width * 0.8 + Math.cos(offset * 0.0012) * 100,
        height * 0.7 + Math.sin(offset * 0.001) * 100,
        0,
        width * 0.8,
        height * 0.7,
        width * 0.6
      );
      grad2.addColorStop(0, "rgba(13, 148, 136, 0.05)"); // Teal, very subtle
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
// SINGLE LAYER EKG - Clean, solitary, professional
// ============================================================================

export function SingleLayerEKG() {
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

    // M-shaped waveform sequence
    const wave: number[] = [];
    // Long flatline
    for (let i = 0; i < 60; i++) wave.push(0.5);
    
    // The Pulse
    wave.push(0.5, 0.45, 0.38, 0.28, 0.15, 0.05); // Up 1
    wave.push(0.2, 0.4, 0.55, 0.7, 0.85);        // Down middle
    wave.push(0.95, 1.0, 0.95);                  // Deep dip
    wave.push(0.85, 0.7, 0.55, 0.4, 0.2);        // Up 2
    wave.push(0.05, 0.15, 0.28, 0.38, 0.45, 0.5);// Down end

    // Another long flatline
    for (let i = 0; i < 80; i++) wave.push(0.5);

    const waveLen = wave.length;
    
    // Single trace settings
    const trace = { 
      speed: 1.5, 
      opacity: 0.08, // Very subtle
      y: 0.6, 
      amplitude: 50, 
      width: 1.5 
    };
    
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

      // Add new point
      if (x > -50) {
        points.push({ x, y, age: 0 });
      }

      // Age points (trail length)
      points = points
        .map((p) => ({ ...p, age: p.age + delta }))
        .filter((p) => p.age < 5000); // Shorter trail

      if (points.length > 1) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        points.forEach((p, j) => {
          if (j === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        
        // Fading gradient stroke could be nice, but simple subtle color is safer
        ctx.strokeStyle = `rgba(225, 29, 72, ${trace.opacity})`;
        ctx.lineWidth = trace.width;
        ctx.stroke();
      }

      // Reset when off screen
      if (x > width + 100) {
        x = -100;
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
      style={{ zIndex: 1 }}
    />
  );
}

// ============================================================================
// NOISE TEXTURE OVERLAY - Static, premium feel
// ============================================================================

export function NoiseTexture() {
  return (
    <div
      className="fixed inset-0 pointer-events-none opacity-[0.03]"
      style={{
        zIndex: 2,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
      }}
    />
  );
}
