import type { ReactNode } from "react";

/** Étoile à 8 branches (khatam) — chemin SVG centré en (cx, cy). */
export function starPath(cx: number, cy: number, outer: number, inner: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 16; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / 8) * i - Math.PI / 2;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
}

/** Motif zellige original : étoiles à 8 branches et croix, en mosaïque. */
export function Zellige({ id = "zellige", opacity = 0.12, color = "currentColor" }: { id?: string; opacity?: number; color?: string }) {
  return (
    <svg className="zellige" aria-hidden="true" width="100%" height="100%">
      <defs>
        <pattern id={id} width="56" height="56" patternUnits="userSpaceOnUse">
          <path d={starPath(28, 28, 20, 12)} fill="none" stroke={color} strokeWidth="2" />
          <path d={starPath(28, 28, 9, 5)} fill={color} />
          <path d={starPath(0, 0, 10, 6)} fill="none" stroke={color} strokeWidth="2" />
          <path d={starPath(56, 0, 10, 6)} fill="none" stroke={color} strokeWidth="2" />
          <path d={starPath(0, 56, 10, 6)} fill="none" stroke={color} strokeWidth="2" />
          <path d={starPath(56, 56, 10, 6)} fill="none" stroke={color} strokeWidth="2" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} opacity={opacity} />
    </svg>
  );
}

/** Arc outrepassé marocain, utilisé comme cadre décoratif. */
export function ArchFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`arch ${className}`}>
      <svg className="arch__shape" viewBox="0 0 200 240" preserveAspectRatio="none" aria-hidden="true">
        <path d="M10 240 L10 110 Q10 70 40 45 Q70 18 100 10 Q130 18 160 45 Q190 70 190 110 L190 240" fill="none" stroke="currentColor" strokeWidth="6" />
        <path d="M24 240 L24 112 Q24 78 50 56 Q76 32 100 24 Q124 32 150 56 Q176 78 176 112 L176 240" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.6" />
      </svg>
      <div className="arch__content">{children}</div>
    </div>
  );
}
