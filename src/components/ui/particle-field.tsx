"use client";

import { useMemo } from "react";

import { cn } from "@/lib/utils";

type Particle = {
  top: string;
  left: string;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
};

const PRESET_PARTICLES: Particle[] = [
  { top: "8%", left: "12%", size: 10, duration: 22, delay: 0, opacity: 0.45 },
  { top: "18%", left: "70%", size: 9, duration: 26, delay: 4, opacity: 0.55 },
  { top: "32%", left: "25%", size: 7.5, duration: 24, delay: 2, opacity: 0.4 },
  { top: "55%", left: "12%", size: 11, duration: 28, delay: 6, opacity: 0.55 },
  { top: "60%", left: "72%", size: 9.6, duration: 21, delay: 10, opacity: 0.5 },
  { top: "42%", left: "82%", size: 8.2, duration: 19, delay: 12, opacity: 0.48 },
  { top: "12%", left: "42%", size: 12, duration: 25, delay: 8, opacity: 0.52 },
  { top: "72%", left: "38%", size: 7.2, duration: 20, delay: 3, opacity: 0.42 },
  { top: "78%", left: "58%", size: 8.8, duration: 27, delay: 5, opacity: 0.5 },
  { top: "28%", left: "88%", size: 6.6, duration: 23, delay: 1, opacity: 0.35 },
  { top: "5%", left: "86%", size: 10.5, duration: 24, delay: 7, opacity: 0.55 },
  { top: "40%", left: "8%", size: 9.4, duration: 22, delay: 9, opacity: 0.48 },
  { top: "68%", left: "8%", size: 8.1, duration: 30, delay: 0.5, opacity: 0.38 },
  { top: "85%", left: "18%", size: 7.9, duration: 29, delay: 11, opacity: 0.46 },
  { top: "92%", left: "45%", size: 6.8, duration: 21, delay: 13, opacity: 0.4 },
  { top: "15%", left: "55%", size: 9.2, duration: 25, delay: 9.5, opacity: 0.44 },
  { top: "48%", left: "60%", size: 10.2, duration: 24, delay: 4.5, opacity: 0.54 },
  { top: "33%", left: "50%", size: 6.4, duration: 18, delay: 14, opacity: 0.32 },
  { top: "65%", left: "48%", size: 11.5, duration: 27, delay: 7.5, opacity: 0.5 },
  { top: "25%", left: "5%", size: 7.8, duration: 20, delay: 5.5, opacity: 0.42 },
  { top: "52%", left: "90%", size: 10.6, duration: 26, delay: 2.5, opacity: 0.5 },
  { top: "88%", left: "80%", size: 8.4, duration: 22, delay: 6.8, opacity: 0.45 },
  { top: "6%", left: "30%", size: 6.9, duration: 19, delay: 1.8, opacity: 0.38 },
  { top: "46%", left: "35%", size: 9.8, duration: 25, delay: 3.2, opacity: 0.49 },
  { top: "74%", left: "22%", size: 7.1, duration: 23, delay: 8.6, opacity: 0.43 },
  { top: "58%", left: "68%", size: 8.9, duration: 28, delay: 10.4, opacity: 0.5 },
  { top: "10%", left: "95%", size: 7.7, duration: 18, delay: 11.5, opacity: 0.36 },
  { top: "90%", left: "5%", size: 9.1, duration: 26, delay: 12.3, opacity: 0.52 },
];

export function ParticleField({ className }: { className?: string }) {
  const particles = useMemo(() => PRESET_PARTICLES, []);

  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {particles.map((particle, index) => (
        <span
          key={index}
          className="particle"
          style={{
            top: particle.top,
            left: particle.left,
            width: `${particle.size}rem`,
            height: `${particle.size}rem`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
            background: "radial-gradient(circle, var(--particle-color) 0%, transparent 60%)",
            opacity: particle.opacity,
          }}
        />
      ))}
    </div>
  );
}


