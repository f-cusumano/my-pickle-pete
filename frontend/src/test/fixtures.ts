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
    { code: 'ARMOR', specified: true, partOfArmorSet: true, fixedBonuses: [] },
    { code: 'WEAPON', specified: true, partOfArmorSet: false, fixedBonuses: [] },
    {
      code: 'ABILITY',
      specified: false,
      partOfArmorSet: false,
      fixedBonuses: [
        { stat: 'COOLDOWN', unit: 'SECONDS', own: false },
        { stat: 'DURATION', unit: 'SECONDS', own: false },
        { stat: 'DAMAGE', unit: 'PERCENT', own: false },
        { stat: 'DAMAGE', unit: 'PERCENT', own: true },
        { stat: 'ACTION_RADIUS', unit: 'PERCENT', own: false },
      ],
    },
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
  statUnits: ['PERCENT', 'FLAT', 'SECONDS'],
  stats: [
    { code: 'DAMAGE', defaultUnit: 'PERCENT', general: true },
    { code: 'MAX_HP', defaultUnit: 'FLAT', general: true },
    { code: 'LUCK', defaultUnit: 'FLAT', general: true },
    { code: 'PICK_UP_RADIUS', defaultUnit: 'PERCENT', general: true },
    { code: 'COOLDOWN', defaultUnit: 'SECONDS', general: false },
    { code: 'DURATION', defaultUnit: 'SECONDS', general: false },
    { code: 'ACTION_RADIUS', defaultUnit: 'PERCENT', general: false },
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
    description: null,
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
