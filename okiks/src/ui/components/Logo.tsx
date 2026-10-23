import { starPath } from "./Zellige";
import { FoxHead } from "./Mascot";

/**
 * Emblème OKIKS : étoile marocaine à 8 branches (khatam) en bleu Majorelle,
 * liseré safran, et la tête 3D d'Okiko qui en dépasse.
 */
export function Emblem({ size = 40, id = "emb" }: { size?: number; id?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="OKIKS" className="emblem">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4C6DF5" />
          <stop offset="1" stopColor="#1C35A8" />
        </linearGradient>
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
      </defs>
      <path d={starPath(32, 34, 29, 24.5)} fill={`url(#${id}-bg)`} />
      <path d={starPath(32, 34, 25, 21)} fill="none" stroke="#F2A541" strokeWidth="1.5" />
      <g transform="translate(1.6 8) scale(0.38)">
        <FoxHead id={id} mood="happy" />
      </g>
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
