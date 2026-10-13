import type { Stat, StatUnit } from '../api/types';
import { STAT_LABELS, ownStatLabel } from '../i18n/labels';

const NUMBER_FORMAT = new Intl.NumberFormat('it-IT', { maximumFractionDigits: 2 });

/** Valore di una caratteristica con segno e unità: "+40%" oppure "+40"; lo zero resta "0". */
export function formatStatValue(value: number, unit: StatUnit): string {
  if (value === 0) {
    return '0';
  }
  const sign = value > 0 ? '+' : '';
  return `${sign}${NUMBER_FORMAT.format(value)}${unit === 'PERCENT' ? '%' : ''}`;
}

/** Potenziamento leggibile: "+5% Raggio di raccolta", "+3 Fortuna", "+10% proprio danno" (proprio dell'arma). */
export function formatStatBonus(stat: Stat, value: number, unit: StatUnit, own = false): string {
  const label = own ? ownStatLabel(stat, true) : STAT_LABELS[stat];
  return `${formatStatValue(value, unit)} ${label}`;
}

/** Livello come "N / M", con M il massimo della rarità. */
export function formatLevel(level: number, maxLevel: number): string {
  return `${String(level)} / ${String(maxLevel)}`;
}
