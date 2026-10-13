import type { Stat, StatUnit } from '../api/types';
import { STAT_LABELS, ownStatLabel } from '../i18n/labels';

const NUMBER_FORMAT = new Intl.NumberFormat('it-IT', { maximumFractionDigits: 2 });

const UNIT_SUFFIXES: Record<StatUnit, string> = { PERCENT: '%', FLAT: '', SECONDS: 's' };

/** Caratteristiche che si censiscono in positivo ma riducono il valore del gioco: si mostrano con il meno. */
const REDUCTION_STATS: Stat[] = ['COOLDOWN'];

/**
 * Valore di una caratteristica con segno e unità: "+40%", "+40", "+3s"; lo zero resta "0".
 * Con la caratteristica, le riduzioni (Tempo di recupero) si mostrano negative: "-2s".
 */
export function formatStatValue(value: number, unit: StatUnit, stat?: Stat): string {
  if (value === 0) {
    return '0';
  }
  const signed = stat && REDUCTION_STATS.includes(stat) ? -value : value;
  const sign = signed > 0 ? '+' : '';
  return `${sign}${NUMBER_FORMAT.format(signed)}${UNIT_SUFFIXES[unit]}`;
}

/** Segno con cui si censisce la caratteristica: "-" per le riduzioni, "+" per le altre. */
export function statSign(stat: Stat | null): '+' | '-' {
  return stat && REDUCTION_STATS.includes(stat) ? '-' : '+';
}

/** Potenziamento leggibile: "+5% Raggio di raccolta", "+3 Fortuna", "+10% proprio danno", "-2s Tempo di recupero". */
export function formatStatBonus(stat: Stat, value: number, unit: StatUnit, own = false): string {
  const label = own ? ownStatLabel(stat, true) : STAT_LABELS[stat];
  return `${formatStatValue(value, unit, stat)} ${label}`;
}

/** Livello come "N / M", con M il massimo della rarità. */
export function formatLevel(level: number, maxLevel: number): string {
  return `${String(level)} / ${String(maxLevel)}`;
}
