import type { Rarity } from '../api/types';

/** Colore interno di ogni rarità, come nel gioco (bordo sempre nero). */
export const RARITY_COLORS: Record<Rarity, string> = {
  COMMON: '#f4f4f4',
  UNCOMMON: '#3fbf3f',
  RARE: '#2f7de1',
  EPIC: '#9b45d8',
  LEGENDARY: '#f2b705',
  ARTIFACT: '#e03131',
};
