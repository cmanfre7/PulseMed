"use client";

import { ReactNode } from "react";

// ============================================================================
// GLASS CARD - Frosted glass effect with blur
// ============================================================================

export function GlassCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-white/20 bg-white/60 backdrop-blur-xl p-6 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ${className}`}
      style={{
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
      }}
    >
      {children}
    </div>
  );
}

// ============================================================================
// ELEVATED CARD - Strong depth with lift on hover
// ============================================================================

export function ElevatedCard({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <div
      className={`rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
      }}
    >
      {children}
    </div>
  );
}

// ============================================================================
// GRADIENT BORDER CARD - Animated gradient outline
// ============================================================================

export function GradientBorderCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl p-6 group ${className}`}>
      {/* Animated gradient border */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#E11D48] via-[#0D9488] to-[#E11D48] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" style={{ padding: "2px" }} />
      
      {/* Inner content */}
      <div className="relative bg-white rounded-2xl p-6 shadow-md">
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// PULSING METRIC CARD - Subtle scale animation on hover
// ============================================================================

export function PulsingMetricCard({ metric, label, detail }: { metric: string; label: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300">
      <div className="font-[family-name:var(--font-dm-serif)] text-5xl text-[#E11D48] mb-3 animate-pulse-slow">{metric}</div>
      <h3 className="font-semibold text-[#1A1A1A] mb-2">{label}</h3>
      <p className="text-sm text-[#64748B] leading-relaxed">{detail}</p>
    </div>
  );
}

// ============================================================================
// 3D TILT CARD - Interactive tilt effect on hover
// ============================================================================

export function TiltCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-lg hover:shadow-2xl transition-all duration-300 perspective-1000 ${className}`}
      onMouseMove={(e) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
      }}
    >
      {children}
    </div>
  );
}
