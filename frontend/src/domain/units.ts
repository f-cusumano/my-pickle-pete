import type { GameConstants, Stat, StatUnit } from '../api/types';

/** Unità predefinita di ogni caratteristica (statistica base del livello, proposta in censimento). */
export function statUnits(constants: GameConstants): Record<Stat, StatUnit> {
  return Object.fromEntries(constants.stats.map((stat) => [stat.code, stat.defaultUnit])) as Record<
    Stat,
    StatUnit
  >;
}
