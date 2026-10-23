import { useEffect, useId, useRef, useState } from "react";

export type Mood = "idle" | "happy" | "cheer" | "sad" | "think" | "write" | "wave";

/** Dégradés partagés : volume « 3D » (lumière en haut à gauche). */
function Defs({ id }: { id: string }) {
  return (
    <defs>
      <radialGradient id={`${id}-fur`} cx="35%" cy="28%" r="78%">
        <stop offset="0" stopColor="#FFB566" />
        <stop offset="0.45" stopColor="#F57A21" />
        <stop offset="1" stopColor="#B9470C" />
      </radialGradient>
      <radialGradient id={`${id}-fur2`} cx="30%" cy="20%" r="90%">
        <stop offset="0" stopColor="#FF9F45" />
        <stop offset="1" stopColor="#C2500F" />
      </radialGradient>
      <radialGradient id={`${id}-white`} cx="40%" cy="30%" r="80%">
        <stop offset="0" stopColor="#FFFFFF" />
        <stop offset="1" stopColor="#EADBCB" />
      </radialGradient>
      <radialGradient id={`${id}-dark`} cx="35%" cy="30%" r="80%">
        <stop offset="0" stopColor="#4A3530" />
        <stop offset="1" stopColor="#120C0A" />
      </radialGradient>
      <radialGradient id={`${id}-shadow`} cx="50%" cy="50%" r="50%">
        <stop offset="0" stopColor="#000" stopOpacity="0.28" />
        <stop offset="1" stopColor="#000" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${id}-pencil`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFD45C" />
        <stop offset="1" stopColor="#E9A417" />
      </linearGradient>
      <linearGradient id={`${id}-fez`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#E0533A" />
        <stop offset="1" stopColor="#9E2A17" />
      </linearGradient>
      <linearGradient id={`${id}-robe`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#4C6DF5" />
        <stop offset="1" stopColor="#1C35A8" />
      </linearGradient>
    </defs>
  );
}

/** Tête d'Okiko seule (aussi utilisée par le logo). */
export function FoxHead({ id, mood = "happy" }: { id: string; mood?: Mood }) {
  const closed = mood === "cheer";
  return (
    <g className="okiko__head">
      {/* oreilles de fennec, grandes, intérieur sombre comme le renard 3D */}
      <g className="okiko__ear okiko__ear--l">
        <path d="M50 66 L33 12 C32 7 37 5 41 8 L76 46 Z" fill={`url(#${id}-fur2)`} />
        <path d="M53 58 L40 20 L67 47 Z" fill={`url(#${id}-dark)`} />
      </g>
      <g className="okiko__ear okiko__ear--r">
        <path d="M110 66 L127 12 C128 7 123 5 119 8 L84 46 Z" fill={`url(#${id}-fur2)`} />
        <path d="M107 58 L120 20 L93 47 Z" fill={`url(#${id}-dark)`} />
      </g>
      {/* crâne */}
      <path d="M38 78 C38 52 57 40 80 40 C103 40 122 52 122 78 C122 101 104 114 80 116 C56 114 38 101 38 78 Z" fill={`url(#${id}-fur)`} />
      {/* joues blanches + museau */}
      <path d="M42 86 C50 104 64 114 80 114 C96 114 110 104 118 86 C108 96 96 100 80 100 C64 100 52 96 42 86 Z" fill={`url(#${id}-white)`} />
      <path d="M63 90 C66 80 94 80 97 90 C97 104 89 112 80 112 C71 112 63 104 63 90 Z" fill={`url(#${id}-white)`} />
      {/* reflet spéculaire */}
      <ellipse cx="62" cy="54" rx="15" ry="6" fill="#fff" opacity="0.28" transform="rotate(-22 62 54)" />
      {/* yeux */}
      {closed ? (
        <g stroke="#1A110E" strokeWidth="4" strokeLinecap="round" fill="none">
          <path d="M58 76 Q64 69 70 76" />
          <path d="M90 76 Q96 69 102 76" />
        </g>
      ) : (
        <g className="okiko__eyes">
          <g className="okiko__pupils">
            <ellipse cx="64" cy="76" rx="6.5" ry={mood === "sad" ? 6 : 8} fill={`url(#${id}-dark)`} />
            <ellipse cx="96" cy="76" rx="6.5" ry={mood === "sad" ? 6 : 8} fill={`url(#${id}-dark)`} />
            <circle cx="66.5" cy="72.5" r="2.4" fill="#fff" />
            <circle cx="98.5" cy="72.5" r="2.4" fill="#fff" />
            <circle cx="62" cy="80" r="1" fill="#fff" opacity="0.7" />
            <circle cx="94" cy="80" r="1" fill="#fff" opacity="0.7" />
          </g>
        </g>
      )}
      {mood === "sad" && (
        <g stroke="#3A2620" strokeWidth="2.6" strokeLinecap="round">
          <path d="M55 66 L69 61" />
          <path d="M105 66 L91 61" />
        </g>
      )}
      {/* joues roses */}
      <ellipse cx="52" cy="90" rx="6" ry="3.5" fill="#FF7A8A" opacity="0.35" />
      <ellipse cx="108" cy="90" rx="6" ry="3.5" fill="#FF7A8A" opacity="0.35" />
      {/* truffe */}
      <path d="M73 88 Q80 84 87 88 Q86 94 80 96 Q74 94 73 88 Z" fill={`url(#${id}-dark)`} />
      <ellipse cx="77.5" cy="88.5" rx="2.2" ry="1.2" fill="#fff" opacity="0.6" />
      {/* bouche */}
      {mood === "sad" ? (
        <path d="M72 106 Q80 100 88 106" stroke="#2A1A15" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      ) : mood === "think" || mood === "write" ? (
        <path d="M74 103 Q80 105 86 102" stroke="#2A1A15" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      ) : mood === "cheer" || mood === "wave" ? (
        <path d="M70 99 Q80 112 90 99 Z" fill="#7A2318" stroke="#2A1A15" strokeWidth="2" strokeLinejoin="round" />
      ) : (
        <path d="M71 100 Q75.5 105 80 100 Q84.5 105 89 100" stroke="#2A1A15" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      )}
    </g>
  );
}

function Pencil({ id }: { id: string }) {
  return (
    <g className="okiko__pencil">
      <g transform="translate(118 112) rotate(35)">
        <rect x="-4" y="-30" width="8" height="34" rx="1.5" fill={`url(#${id}-pencil)`} />
        <rect x="-4" y="-30" width="2.5" height="34" fill="#fff" opacity="0.35" />
        <rect x="-4" y="-36" width="8" height="7" rx="2" fill="#F48FB1" />
        <rect x="-4" y="-30" width="8" height="2.5" fill="#B0BEC5" />
        <path d="M-4 4 L4 4 L0 13 Z" fill="#F3D2A6" />
        <path d="M-1.4 10 L1.4 10 L0 13 Z" fill="#2B2B2B" />
      </g>
    </g>
  );
}

/**
 * Okiko, la mascotte d'OKIKS : un renard-fennec dessiné en SVG avec un rendu
 * volumique. `interactive` : les yeux et la tête suivent le pointeur, et un
 * toucher le fait saluer.
 */
export function Mascot({
  mood = "happy",
  outfit = null,
  size = 120,
  className = "",
  interactive = false,
  onTap,
}: {
  mood?: Mood;
  outfit?: string | null;
  size?: number;
  className?: string;
  interactive?: boolean;
  onTap?: () => void;
}) {
  const id = `ok${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const ref = useRef<SVGSVGElement>(null);
  const [tapMood, setTapMood] = useState<Mood | null>(null);
  const shown = tapMood ?? mood;
  const pencil = shown === "write" || shown === "think";

  // Suivi du regard : variables CSS mises à jour sans re-rendu React.
  useEffect(() => {
    if (!interactive) return;
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / Math.max(200, window.innerWidth / 2);
        const dy = (e.clientY - (r.top + r.height * 0.4)) / Math.max(200, window.innerHeight / 2);
        const cx = Math.max(-1, Math.min(1, dx));
        const cy = Math.max(-1, Math.min(1, dy));
        el.style.setProperty("--look-x", `${cx * 3.2}px`);
        el.style.setProperty("--look-y", `${cy * 2.6}px`);
        el.style.setProperty("--tilt", `${cx * 7}deg`);
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, [interactive]);

  const tap = () => {
    if (!interactive) return;
    setTapMood("wave");
    navigator.vibrate?.(15);
    onTap?.();
    window.setTimeout(() => setTapMood(null), 1400);
  };

  return (
    <svg
      ref={ref}
      className={`okiko okiko--${shown} ${interactive ? "okiko--interactive" : ""} ${className}`}
      width={size}
      height={size * 1.125}
      viewBox="0 0 160 180"
      role="img"
      aria-label="Okiko"
      onClick={tap}
    >
      <Defs id={id} />
      <ellipse cx="80" cy="172" rx="44" ry="7" fill={`url(#${id}-shadow)`} className="okiko__shadow" />
      <g className="okiko__all">
        {/* queue */}
        <g className="okiko__tail">
          <path d="M100 150 C138 152 160 120 152 86 C149 72 138 64 130 70 C142 92 134 126 100 134 Z" fill={`url(#${id}-fur)`} />
          <path d="M152 86 C149 72 138 64 130 70 C134 78 136 86 136 94 C142 92 148 90 152 86 Z" fill={`url(#${id}-white)`} />
        </g>
        {/* jambes */}
        <path d="M62 150 L62 166 C62 171 74 171 74 166 L74 150 Z" fill={`url(#${id}-fur2)`} />
        <path d="M86 150 L86 166 C86 171 98 171 98 166 L98 150 Z" fill={`url(#${id}-fur2)`} />
        <ellipse cx="68" cy="168" rx="9" ry="5" fill={`url(#${id}-dark)`} />
        <ellipse cx="92" cy="168" rx="9" ry="5" fill={`url(#${id}-dark)`} />
        {/* corps */}
        <g className="okiko__body">
          <path d="M54 156 C48 130 56 110 80 106 C104 110 112 130 106 156 C98 162 62 162 54 156 Z" fill={outfit === "djellaba" ? `url(#${id}-robe)` : `url(#${id}-fur)`} />
          {outfit === "djellaba" ? (
            <path d="M80 112 L80 158 M70 116 Q80 124 90 116" stroke="#F2A541" strokeWidth="2.5" fill="none" />
          ) : (
            <path d="M66 156 C62 136 68 118 80 114 C92 118 98 136 94 156 C88 159 72 159 66 156 Z" fill={`url(#${id}-white)`} />
          )}
          {/* bras gauche (salue) */}
          <g className="okiko__arm okiko__arm--l">
            <path d="M60 118 C50 124 42 132 40 142 C39 147 46 150 49 146 C53 138 58 132 66 128 Z" fill={outfit === "djellaba" ? `url(#${id}-robe)` : `url(#${id}-fur2)`} />
            <circle cx="44" cy="146" r="7" fill={`url(#${id}-dark)`} />
          </g>
          {/* bras droit (tient le crayon) */}
          <g className="okiko__arm okiko__arm--r">
            <path d="M100 118 C110 124 117 132 119 140 C120 145 113 148 110 144 C107 137 102 132 94 128 Z" fill={outfit === "djellaba" ? `url(#${id}-robe)` : `url(#${id}-fur2)`} />
            {pencil && <Pencil id={id} />}
            <circle cx="115" cy="144" r="7" fill={`url(#${id}-dark)`} />
          </g>
        </g>
        <FoxHead id={id} mood={shown} />
        {/* tenues sur la tête */}
        {outfit === "chechia" && <path d="M58 46 Q80 20 102 46 Q80 40 58 46 Z" fill={`url(#${id}-fez)`} className="okiko__hat" />}
        {outfit === "tarbouche" && (
          <g className="okiko__hat">
            <path d="M62 46 L68 14 L92 14 L98 46 Q80 42 62 46 Z" fill={`url(#${id}-fez)`} />
            <ellipse cx="80" cy="14" rx="12" ry="3" fill="#B23A24" />
            <path d="M80 14 Q93 16 95 34" stroke="#1E1E1E" strokeWidth="2.6" fill="none" />
            <circle cx="95" cy="35" r="3" fill="#1E1E1E" />
          </g>
        )}
        {outfit === "nador" && (
          <g className="okiko__glasses">
            <rect x="52" y="68" width="24" height="15" rx="7" fill="#1E2A44" />
            <rect x="84" y="68" width="24" height="15" rx="7" fill="#1E2A44" />
            <path d="M76 74 L84 74" stroke="#1E2A44" strokeWidth="3" />
            <path d="M56 71 L64 71" stroke="#8FB0FF" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}
      </g>
    </svg>
  );
}

/** Okiko avec une bulle de dialogue. */
export function OkikoSays({
  text,
  mood = "happy",
  outfit,
  size = 96,
  interactive = true,
  onTap,
}: {
  text?: string;
  mood?: Mood;
  outfit?: string | null;
  size?: number;
  interactive?: boolean;
  onTap?: () => void;
}) {
  return (
    <div className="okiko-says">
      <Mascot mood={mood} outfit={outfit} size={size} interactive={interactive} onTap={onTap} />
      {text && (
        <p className="okiko-says__bubble" key={text} role="status">
          {text}
        </p>
      )}
    </div>
  );
}
