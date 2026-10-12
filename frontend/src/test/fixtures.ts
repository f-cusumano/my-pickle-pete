import type { GameConstants, Item } from '../api/types';

/** Costanti del gioco come le restituisce il backend (/api/constants/game). */
export const CONSTANTS: GameConstants = {
  rarities: [
    { code: 'COMMON', maxLevel: 10 },
    { code: 'UNCOMMON', maxLevel: 20 },
    { code: 'RARE', maxLevel: 30 },
    { code: 'EPIC', maxLevel: 40 },
    { code: 'LEGENDARY', maxLevel: 50 },
    { code: 'ARTIFACT', maxLevel: 99 },
  ],
  itemTypes: [
    { code: 'ARMOR', specified: true, partOfArmorSet: true },
    { code: 'WEAPON', specified: true, partOfArmorSet: false },
    { code: 'ABILITY', specified: false, partOfArmorSet: false },
  ],
  specifications: [
    { code: 'RANGED', itemType: 'WEAPON', baseStat: 'DAMAGE' },
    { code: 'ELEMENTAL', itemType: 'WEAPON', baseStat: 'DAMAGE' },
    { code: 'MECHANICAL', itemType: 'WEAPON', baseStat: 'DAMAGE' },
    { code: 'MELEE', itemType: 'WEAPON', baseStat: 'DAMAGE' },
    { code: 'HAT', itemType: 'ARMOR', baseStat: 'DAMAGE' },
    { code: 'GLASSES', itemType: 'ARMOR', baseStat: 'DAMAGE' },
    { code: 'CHEST', itemType: 'ARMOR', baseStat: 'MAX_HP' },
    { code: 'BACK', itemType: 'ARMOR', baseStat: 'MAX_HP' },
    { code: 'BOOTS', itemType: 'ARMOR', baseStat: 'MAX_HP' },
  ],
  armorSets: [
    'BANDIT',
    'KNIGHT',
    'VAMPIRE',
    'MECHANIC',
    'BANKER',
    'TRAVELER',
    'WIZARD',
    'SUPERMAN',
    'COWBOY',
    'JESTER',
    'VIKING',
  ],
  statUnits: ['PERCENT', 'FLAT'],
  stats: [
    { code: 'DAMAGE', defaultUnit: 'PERCENT' },
    { code: 'MAX_HP', defaultUnit: 'FLAT' },
    { code: 'LUCK', defaultUnit: 'FLAT' },
    { code: 'PICK_UP_RADIUS', defaultUnit: 'PERCENT' },
  ],
  sortOrders: [
    { code: 'ARMOR_SET', typeOrder: ['ARMOR', 'WEAPON', 'ABILITY'], preselected: true },
    { code: 'WEAPONS_FIRST', typeOrder: ['WEAPON', 'ABILITY', 'ARMOR'], preselected: false },
    { code: 'RARITY', typeOrder: ['ARMOR', 'WEAPON', 'ABILITY'], preselected: false },
  ],
  baseStatPerLevel: 4,
  armorSetBonusThreshold: 4,
};

export function item(overrides: Partial<Item> & Pick<Item, 'id' | 'name'>): Item {
  return {
    type: 'ABILITY',
    specification: null,
    armorSet: null,
    rarity: 'COMMON',
    level: 1,
    maxLevel: 10,
    baseStat: 'DAMAGE',
    baseStatValue: 4,
    bonuses: [],
    ...overrides,
  };
}

export const HAT = item({
  id: 1,
  name: 'Cappellaccio',
  type: 'ARMOR',
  specification: 'HAT',
  armorSet: 'COWBOY',
  rarity: 'RARE',
});
export const BOOTS = item({
  id: 2,
  name: 'Stivali',
  type: 'ARMOR',
  specification: 'BOOTS',
  armorSet: 'BANDIT',
  baseStat: 'MAX_HP',
});
export const PISTOL = item({
  id: 3,
  name: 'Pistola',
  type: 'WEAPON',
  specification: 'RANGED',
  rarity: 'EPIC',
});
export const JAR = item({ id: 4, name: 'Barattolo', rarity: 'ARTIFACT' });
export const ITEMS = [BOOTS, HAT, PISTOL, JAR];
