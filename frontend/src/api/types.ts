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
  | 'KNOCKBACK'
  | 'COOLDOWN'
  | 'DURATION'
  | 'ACTION_RADIUS';
/** SECONDS solo per le caratteristiche delle abilità (Tempo di recupero, Durata). */
export type StatUnit = 'PERCENT' | 'FLAT' | 'SECONDS';
export type ItemSortOrder = 'ARMOR_SET' | 'WEAPONS_FIRST' | 'RARITY';
export type Highlight = 'BEST' | 'WORST' | 'NONE';

export interface RarityBonus {
  rarity: Rarity;
  stat: Stat;
  unit: StatUnit;
  amount: number;
  /** Armi e abilità: potenziamento del solo item, es. "+10% al proprio danno". */
  own: boolean;
  unlocked: boolean;
}

export interface Item {
  id: number;
  name: string;
  type: ItemType;
  specification: Specification | null;
  armorSet: ArmorSet | null;
  /** Solo abilità: effetti descritti a parole. */
  description: string | null;
  rarity: Rarity;
  level: number;
  maxLevel: number;
  baseStat: Stat;
  baseStatValue: number;
  bonuses: RarityBonus[];
}

export interface RarityBonusRequest {
  rarity: Rarity;
  stat: Stat;
  unit: StatUnit;
  amount: number;
  own: boolean;
}

export interface ItemRequest {
  name: string;
  type: ItemType;
  specification: Specification | null;
  armorSet: ArmorSet | null;
  description: string | null;
  bonuses: RarityBonusRequest[];
}

export interface ArmorSetInfo {
  armorSet: ArmorSet;
  bonusDescription: string | null;
}

/**
 * Riga della tabella di un set. weaponCurrent e weaponTop sono il contributo dell'arma scelta (null se non porta la
 * caratteristica): le evidenziazioni tengono conto del totale. Le righe own (proprie dell'arma) stanno in fondo
 * con i soli valori dell'arma.
 */
export interface StatComparison {
  stat: Stat;
  unit: StatUnit;
  own: boolean;
  current: number;
  top: number;
  weaponCurrent: number | null;
  weaponTop: number | null;
  currentHighlight: Highlight;
  topHighlight: Highlight;
}

/** Tipi di arma consigliati e sconsigliati dalle armature di un set (liste vuote se tutti i tipi sono pari). */
export interface WeaponAdvice {
  recommendedNow: Specification[];
  discouragedNow: Specification[];
  recommendedTop: Specification[];
  discouragedTop: Specification[];
}

/** Danno (%) e HP (valore) dovuti al livello di pezzi e arma: fuori dalla tabella delle caratteristiche. */
export interface LevelStats {
  damageNow: number;
  damageTop: number;
  hpNow: number;
  hpTop: number;
}

export interface FullSet {
  armorSet: ArmorSet;
  bonusDescription: string | null;
  bonusActive: boolean;
  pieces: Item[];
  levelStats: LevelStats;
  stats: StatComparison[];
  weaponAdvice: WeaponAdvice;
}

/** Set custom (id e nome null se non salvato): bonusArmorSet è il set con almeno 4 pezzi, se c'è. */
export interface CustomSet {
  id: number | null;
  name: string | null;
  bonusArmorSet: ArmorSet | null;
  bonusDescription: string | null;
  pieces: Item[];
  weapon: Item | null;
  ability: Item | null;
  levelStats: LevelStats;
  stats: StatComparison[];
  /** Caratteristiche dell'abilità, a parte: nessuna intersezione con quelle del set. */
  abilityStats: StatComparison[];
  weaponAdvice: WeaponAdvice;
}

export interface CustomSetRequest {
  name: string;
  itemIds: number[];
  weaponId: number | null;
  abilityId: number | null;
}

/** Caratteristica con la sua unità ("+5% Fortuna" e "+5 Fortuna" sono caratteristiche diverse). */
export interface StatKey {
  stat: Stat;
  unit: StatUnit;
}

export interface BestSetRequest {
  primary: StatKey;
  secondary: StatKey | null;
}

/** Best now (rarità e livello attuali) o Best potential (rarità e livello massimi). */
export type BestSetMode = 'now' | 'potential';

export interface GameConstants {
  rarities: { code: Rarity; maxLevel: number }[];
  /** fixedBonuses: potenziamenti possibili quando sono un elenco chiuso (abilità), vuoto altrimenti. */
  itemTypes: {
    code: ItemType;
    specified: boolean;
    partOfArmorSet: boolean;
    fixedBonuses: (StatKey & { own: boolean })[];
  }[];
  specifications: { code: Specification; itemType: ItemType; baseStat: Stat }[];
  armorSets: ArmorSet[];
  statUnits: StatUnit[];
  /** general: caratteristica di armature e armi (le altre valgono solo per le abilità). */
  stats: { code: Stat; defaultUnit: StatUnit; general: boolean }[];
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
  | 'LEVEL_OUT_OF_RANGE'
  | 'CUSTOM_SET_NOT_FOUND'
  | 'CUSTOM_SET_NAME_ALREADY_EXISTS'
  | 'CUSTOM_SET_INVALID_PIECES'
  | 'CUSTOM_SET_INVALID_WEAPON'
  | 'CUSTOM_SET_INVALID_ABILITY';

export interface ErrorResponse {
  key: string;
  code: InternalErrorCode;
  messages: string[];
}
