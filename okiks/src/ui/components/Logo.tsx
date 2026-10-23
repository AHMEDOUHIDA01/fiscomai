import { starPath } from "./Zellige";

/**
 * Emblème OKIKS : étoile marocaine à 8 branches (khatam) en bleu Majorelle,
 * liseré safran, tête de fennec géométrique au centre.
 */
export function Emblem({ size = 40, id = "emb" }: { size?: number; id?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="OKIKS" className="emblem">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4C6DF5" />
          <stop offset="1" stopColor="#1C35A8" />
        </linearGradient>
        <linearGradient id={`${id}-fox`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F7B661" />
          <stop offset="1" stopColor="#E8893A" />
        </linearGradient>
      </defs>
      <path d={starPath(32, 32, 31, 26)} fill={`url(#${id}-bg)`} />
      <path d={starPath(32, 32, 26.5, 22.2)} fill="none" stroke="#F2A541" strokeWidth="1.6" />
      {/* oreilles */}
      <path d="M17.5 31 L14 13 L28 23.5 Z" fill={`url(#${id}-fox)`} />
      <path d="M46.5 31 L50 13 L36 23.5 Z" fill={`url(#${id}-fox)`} />
      <path d="M19.5 27 L17.5 17.5 L25 23.5 Z" fill="#FFE3BF" />
      <path d="M44.5 27 L46.5 17.5 L39 23.5 Z" fill="#FFE3BF" />
      {/* tête */}
      <path d="M17 29 Q32 19 47 29 Q45.5 43 32 50.5 Q18.5 43 17 29 Z" fill={`url(#${id}-fox)`} />
      <path d="M23.5 37.5 Q32 33.5 40.5 37.5 Q38.5 45.5 32 49.5 Q25.5 45.5 23.5 37.5 Z" fill="#FFF6EA" />
      <ellipse cx="26" cy="33.2" rx="1.9" ry="2.3" fill="#1E1433" />
      <ellipse cx="38" cy="33.2" rx="1.9" ry="2.3" fill="#1E1433" />
      <path d="M29.6 41.2 L34.4 41.2 L32 43.8 Z" fill="#1E1433" strokeLinejoin="round" />
    </svg>
  );
}

/** Logo complet : emblème + mot OKIKS (+ tifinagh en option). */
export function Logo({ size = 36, tifinagh = false, id }: { size?: number; tifinagh?: boolean; id?: string }) {
  return (
    <span className="logo-lockup" dir="ltr" style={{ fontSize: size * 0.72 }}>
      <Emblem size={size} id={id} />
      <span className="logo-lockup__text">
        <span className="logo-lockup__word">OKIKS</span>
        {tifinagh && <span className="logo-lockup__tif">ⵓⴽⵉⴽⵙ</span>}
      </span>
    </span>
  );
}
