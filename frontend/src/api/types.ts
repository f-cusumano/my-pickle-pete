// Contratto REST del backend (application/rest): enum come stringhe, importi come numeri.

export type Rarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'ARTIFACT';
export type ItemType = 'ARMOR' | 'WEAPON' | 'ABILITY';
export type Specification =
  'RANGED' | 'ELEMENTAL' | 'MECHANICAL' | 'MELEE' | 'HAT' | 'GLASSES' | 'CHEST' | 'BACK' | 'BOOTS';
export type ArmorSet =
  | 'BANDIT'
  | 'KNIGHT'
  | 'VAMPIRE'
  | 'MECHANIC'
  | 'BANKER'
  | 'TRAVELER'
  | 'WIZARD'
  | 'SUPERMAN'
  | 'COWBOY'
  | 'JESTER'
  | 'VIKING';
export type Stat =
  | 'DAMAGE'
  | 'MAX_HP'
  | 'ATTACK_SPEED'
  | 'REGENERATION'
  | 'ARMOR'
  | 'PICK_UP_HEAL'
  | 'PICK_UP_RADIUS'
  | 'MOVE_SPEED'
  | 'XP_GAIN'
  | 'DODGE_CHANCE'
  | 'CRIT_CHANCE'
  | 'CRIT_DAMAGE'
  | 'LIFE_STEAL'
  | 'MELEE_DAMAGE'
  | 'RANGED_DAMAGE'
  | 'ELEMENTAL_DAMAGE'
  | 'MECHANICAL_DAMAGE'
  | 'LUCK'
  | 'PATROL_EARNINGS'
  | 'BOSS_DAMAGE'
  | 'INTEREST'
  | 'KNOCKBACK';
export type StatUnit = 'PERCENT' | 'FLAT';
export type ItemSortOrder = 'ARMOR_SET' | 'WEAPONS_FIRST' | 'RARITY';
export type Highlight = 'BEST' | 'WORST' | 'NONE';

export interface RarityBonus {
  rarity: Rarity;
  stat: Stat;
  amount: number;
  unlocked: boolean;
}

export interface Item {
  id: number;
  name: string;
  type: ItemType;
  specification: Specification | null;
  armorSet: ArmorSet | null;
  rarity: Rarity;
  level: number;
  maxLevel: number;
  baseStat: Stat;
  baseStatValue: number;
  bonuses: RarityBonus[];
  imageVersion: number | null;
}

export interface RarityBonusRequest {
  rarity: Rarity;
  stat: Stat;
  amount: number;
}

export interface ItemRequest {
  name: string;
  type: ItemType;
  specification: Specification | null;
  armorSet: ArmorSet | null;
  bonuses: RarityBonusRequest[];
}

export interface ArmorSetInfo {
  armorSet: ArmorSet;
  bonusDescription: string | null;
}

export interface StatComparison {
  stat: Stat;
  current: number;
  top: number;
  currentHighlight: Highlight;
  topHighlight: Highlight;
}

export interface FullSet {
  armorSet: ArmorSet;
  bonusDescription: string | null;
  bonusActive: boolean;
  pieces: Item[];
  stats: StatComparison[];
}

export interface GameConstants {
  rarities: { code: Rarity; maxLevel: number }[];
  itemTypes: { code: ItemType; specified: boolean; partOfArmorSet: boolean }[];
  specifications: { code: Specification; itemType: ItemType; baseStat: Stat }[];
  armorSets: ArmorSet[];
  stats: { code: Stat; unit: StatUnit }[];
  sortOrders: { code: ItemSortOrder; typeOrder: ItemType[]; preselected: boolean }[];
  baseStatPerLevel: number;
  armorSetBonusThreshold: number;
}

export type InternalErrorCode =
  | 'GENERIC'
  | 'VALIDATION_FAILED'
  | 'ITEM_NOT_FOUND'
  | 'ITEM_NAME_ALREADY_EXISTS'
  | 'ARMOR_SLOT_ALREADY_TAKEN'
  | 'MAX_RARITY_REACHED'
  | 'LEVEL_OUT_OF_RANGE'
  | 'IMAGE_NOT_FOUND'
  | 'IMAGE_NOT_VALID'
  | 'IMAGE_TOO_LARGE';

export interface ErrorResponse {
  key: string;
  code: InternalErrorCode;
  messages: string[];
}
