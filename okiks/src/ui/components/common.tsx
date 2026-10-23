import type { ButtonHTMLAttributes, ReactNode } from "react";
import { starPath } from "./Zellige";

type Variant = "primary" | "secondary" | "success" | "danger" | "ghost" | "gold";

export function Button({ variant = "primary", block, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; block?: boolean }) {
  return <button type="button" className={`btn btn--${variant} ${block ? "btn--block" : ""} ${className}`} {...props} />;
}

export function ProgressBar({ value, color }: { value: number; color?: string }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)}>
      <div className="progress__fill" style={{ width: `${pct}%`, ...(color ? { background: color } : {}) }} />
    </div>
  );
}

export function Star8({ size = 72, fill, stroke, children, className = "" }: { size?: number; fill: string; stroke?: string; children?: ReactNode; className?: string }) {
  return (
    <span className={`star8 ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
        <path d={starPath(50, 54, 46, 38)} fill={stroke ?? "rgba(0,0,0,.18)"} />
        <path d={starPath(50, 48, 46, 38)} fill={fill} />
        <path d={starPath(50, 48, 34, 28)} fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="2" />
      </svg>
      <span className="star8__content">{children}</span>
    </span>
  );
}

export function Modal({ children, onClose, labelledBy }: { children: ReactNode; onClose?: () => void; labelledBy?: string }) {
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby={labelledBy} onClick={onClose}>
      <div className="modal__card" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="toggle">
      <span>{label}</span>
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle__track" aria-hidden="true" />
    </label>
  );
}
