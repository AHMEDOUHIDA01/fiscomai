import { useEffect, useRef, useState, type ReactNode } from "react";

const reducedMotion = () =>
  document.documentElement.dataset.motion === "reduce" || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Nombre qui défile jusqu'à sa valeur. */
export function CountUp({ to, duration = 900 }: { to: number; duration?: number }) {
  const [v, setV] = useState(reducedMotion() ? to : 0);
  useEffect(() => {
    if (reducedMotion()) return setV(to);
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      setV(Math.round(to * (1 - (1 - p) ** 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  return <>{v}</>;
}

/** Pluie de confettis aux couleurs marocaines (canvas, sans dépendance). */
export function Confetti({ pieces = 140 }: { pieces?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (reducedMotion()) return;
    const c = ref.current!;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      c.width = innerWidth * dpr;
      c.height = innerHeight * dpr;
    };
    resize();
    const colors = ["#2A4BD7", "#C8553D", "#2E9E6A", "#F2A541", "#F48FB1", "#ffffff"];
    const parts = Array.from({ length: pieces }, () => ({
      x: Math.random() * c.width,
      y: -Math.random() * c.height * 0.6,
      w: (6 + Math.random() * 6) * dpr,
      h: (10 + Math.random() * 8) * dpr,
      vy: (2 + Math.random() * 3) * dpr,
      vx: (Math.random() - 0.5) * 2 * dpr,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
      star: Math.random() < 0.25,
    }));
    let raf = 0;
    const t0 = performance.now();
    const draw = (t: number) => {
      ctx.clearRect(0, 0, c.width, c.height);
      const fade = Math.max(0, 1 - (t - t0 - 2500) / 1200);
      for (const p of parts) {
        p.x += p.vx + Math.sin((t + p.y) / 400) * 0.6 * dpr;
        p.y += p.vy;
        p.r += p.vr;
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.color;
        if (p.star) {
          // petite étoile à 8 branches
          ctx.beginPath();
          for (let i = 0; i < 16; i++) {
            const rad = (i % 2 ? 0.45 : 1) * p.w * 0.8;
            const a = (Math.PI / 8) * i;
            ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
          }
          ctx.fill();
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r)));
        }
        ctx.restore();
      }
      if (fade > 0) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
    };
  }, [pieces]);
  return <canvas ref={ref} className="confetti" aria-hidden="true" />;
}

/** Anneau de progression (objectif du jour). */
export function Ring({ value, size = 76, stroke = 8, color = "var(--saffron)", children }: { value: number; size?: number; stroke?: number; color?: string; children?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <span className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={stroke} />
        <circle
          className="ring__value"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="ring__content">{children}</span>
    </span>
  );
}

/** Petite vibration (si l'appareil le permet). */
export function haptic(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* non disponible */
  }
}
