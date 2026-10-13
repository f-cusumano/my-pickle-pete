/* Simboli di Danno e HP dal livello, con il tratto delle immagini degli item (linee scure, riempimento leggero). */

interface Props {
  size?: number;
}

const STROKE = '#3b4636';
/** Riempimento pieno (non trasparente): le dita coprono il palmo. */
const FILL = '#d8d3c4';
const DEFAULT_SIZE = 26;

/** Pugno chiuso alzato: nocche in alto, pollice davanti alle dita, avambraccio in basso. */
export function FistIcon({ size = DEFAULT_SIZE }: Props) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" style={{ flex: 'none' }}>
      <g fill="none" stroke={STROKE} strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 47l-2 15M43 47l2 15" />
        <path d="M13 22v15q0 9 9 10h20q9-1 9-10v-15z" fill={FILL} />
        <rect x={13} y={10} width={10} height={17} rx={5} fill={FILL} />
        <rect x={22} y={9} width={10} height={18} rx={5} fill={FILL} />
        <rect x={31} y={9} width={10} height={18} rx={5} fill={FILL} />
        <rect x={40} y={11} width={11} height={16} rx={5} fill={FILL} />
        <path d="M13 34q0-6 6-6h18q5 0 5 4.5t-5 4.5h-14" fill={FILL} />
      </g>
    </svg>
  );
}

/** Cuore. */
export function HeartIcon({ size = DEFAULT_SIZE }: Props) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" style={{ flex: 'none' }}>
      <g fill="none" stroke={STROKE} strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M32 54C16 43 8 33 8 23q0-11 11-12q8 0 13 8q5-8 13-8q11 1 11 12c0 10-8 20-24 31z"
          fill={FILL}
        />
        <path d="M17 21q1-4 5-4.5" />
      </g>
    </svg>
  );
}
