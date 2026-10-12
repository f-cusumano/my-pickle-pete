import type { GameConstants, Stat, StatUnit } from '../api/types';

/** Unità di ogni caratteristica, letta dalle costanti del backend. */
export function statUnits(constants: GameConstants): Record<Stat, StatUnit> {
  return Object.fromEntries(constants.stats.map((stat) => [stat.code, stat.unit])) as Record<Stat, StatUnit>;
}
