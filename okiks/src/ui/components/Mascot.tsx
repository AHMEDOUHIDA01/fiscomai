export type Mood = "happy" | "cheer" | "sad" | "think";

/** Okiko, le fennec d'OKIKS — dessin original en SVG, avec ses tenues marocaines. */
export function Mascot({ mood = "happy", outfit = null, size = 120, className = "" }: { mood?: Mood; outfit?: string | null; size?: number; className?: string }) {
  const body = outfit === "djellaba" ? "#2A4BD7" : "#EFAE6B";
  return (
    <svg
      className={`mascot mascot--${mood} ${className}`}
      width={size}
      height={size * 1.08}
      viewBox="0 0 120 130"
      role="img"
      aria-label="Okiko"
    >
      {/* corps */}
      <path d="M30 130 Q28 96 60 94 Q92 96 90 130 Z" fill={body} />
      {outfit === "djellaba" && (
        <>
          <path d="M60 98 L60 130" stroke="#F2A541" strokeWidth="3" />
          <path d="M44 104 Q60 112 76 104" stroke="#F2A541" strokeWidth="2.5" fill="none" />
        </>
      )}
      {outfit !== "djellaba" && <path d="M44 130 Q44 104 60 102 Q76 104 76 130 Z" fill="#FFF4E6" />}
      {/* queue touffue */}
      <path d="M88 126 Q112 120 110 98 Q104 112 86 116 Z" fill="#E59A55" />
      <path d="M108 102 Q111 98 110 96 Q106 104 102 108 Z" fill="#FFF4E6" />
      {/* oreilles */}
      <g className="mascot__ears">
        <path d="M24 56 L8 6 L52 38 Z" fill="#E59A55" />
        <path d="M27 48 L17 17 L45 38 Z" fill="#F9D6B0" />
        <path d="M96 56 L112 6 L68 38 Z" fill="#E59A55" />
        <path d="M93 48 L103 17 L75 38 Z" fill="#F9D6B0" />
      </g>
      {/* tête */}
      <ellipse cx="60" cy="64" rx="38" ry="31" fill="#F2B777" />
      <path d="M30 70 Q60 106 90 70 Q78 84 60 84 Q42 84 30 70 Z" fill="#FFF4E6" />
      <ellipse cx="60" cy="74" rx="22" ry="15" fill="#FFF4E6" />
      {/* joues */}
      <circle cx="36" cy="74" r="5" fill="#F28B82" opacity="0.45" />
      <circle cx="84" cy="74" r="5" fill="#F28B82" opacity="0.45" />
      {/* yeux */}
      {mood === "cheer" ? (
        <>
          <path d="M40 62 Q46 54 52 62" stroke="#2B1B12" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M68 62 Q74 54 80 62" stroke="#2B1B12" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <g className="mascot__eyes">
          <ellipse cx="46" cy="61" rx="5.5" ry={mood === "sad" ? 5 : 6.5} fill="#2B1B12" />
          <ellipse cx="74" cy="61" rx="5.5" ry={mood === "sad" ? 5 : 6.5} fill="#2B1B12" />
          <circle cx="48" cy="58.5" r="2" fill="#fff" />
          <circle cx="76" cy="58.5" r="2" fill="#fff" />
        </g>
      )}
      {mood === "sad" && (
        <>
          <path d="M38 52 L50 55" stroke="#2B1B12" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M82 52 L70 55" stroke="#2B1B12" strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}
      {/* nez + bouche */}
      <ellipse cx="60" cy="71" rx="5" ry="3.6" fill="#2B1B12" />
      {mood === "sad" ? (
        <path d="M52 84 Q60 78 68 84" stroke="#2B1B12" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      ) : mood === "think" ? (
        <path d="M54 82 L66 81" stroke="#2B1B12" strokeWidth="2.5" strokeLinecap="round" />
      ) : (
        <path d="M50 78 Q60 90 70 78" stroke="#2B1B12" strokeWidth="2.5" fill={mood === "cheer" ? "#C8553D" : "none"} strokeLinecap="round" />
      )}
      {/* tenues */}
      {outfit === "chechia" && <path d="M42 36 Q60 18 78 36 Z" fill="#C8553D" stroke="#9E3B27" strokeWidth="1.5" />}
      {outfit === "tarbouche" && (
        <g>
          <path d="M44 38 L50 12 L70 12 L76 38 Z" fill="#C8553D" stroke="#9E3B27" strokeWidth="1.5" />
          <path d="M60 12 Q70 14 72 30" stroke="#1E1E1E" strokeWidth="2.5" fill="none" />
          <circle cx="72" cy="31" r="2.5" fill="#1E1E1E" />
        </g>
      )}
      {outfit === "nador" && (
        <g>
          <rect x="35" y="54" width="22" height="13" rx="6" fill="#1E2A44" />
          <rect x="63" y="54" width="22" height="13" rx="6" fill="#1E2A44" />
          <path d="M57 59 L63 59" stroke="#1E2A44" strokeWidth="3" />
          <path d="M39 57 L46 57" stroke="#7FA3FF" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}
