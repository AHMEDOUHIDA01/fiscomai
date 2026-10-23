import { useState } from "react";
import map from "../emoji-map.json";

const MAP = map as Record<string, string>;

/**
 * Émoji en 3D (Fluent Emoji de Microsoft, licence MIT) ; retombe sur l'émoji
 * du système s'il n'existe pas de version 3D.
 */
export function E({ e, size = 28, className = "", label }: { e: string; size?: number; className?: string; label?: string }) {
  const file = MAP[e];
  // Hors ligne, une icône jamais affichée n'est pas encore en cache : on retombe sur l'émoji du système.
  const [failed, setFailed] = useState(false);
  if (!file || failed) {
    return (
      <span className={`e3d e3d--text ${className}`} style={{ fontSize: size * 0.85 }} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
        {e}
      </span>
    );
  }
  return (
    <img
      className={`e3d ${className}`}
      src={`/emoji/${file}.webp`}
      width={size}
      height={size}
      alt={label ?? ""}
      aria-hidden={label ? undefined : true}
      draggable={false}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
