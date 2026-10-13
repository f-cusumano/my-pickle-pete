import type {
  ArmorSet,
  BestSetMode,
  InternalErrorCode,
  ItemSortOrder,
  ItemType,
  Rarity,
  Specification,
  Stat,
  StatUnit,
} from '../api/types';

export const RARITY_LABELS: Record<Rarity, string> = {
  COMMON: 'Comune',
  UNCOMMON: 'Incomune',
  RARE: 'Raro',
  EPIC: 'Epico',
  LEGENDARY: 'Leggendario',
  ARTIFACT: 'Artefatto',
};

export const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  ARMOR: 'Armatura',
  WEAPON: 'Arma',
  ABILITY: 'Abilità',
};

export const SPECIFICATION_LABELS: Record<Specification, string> = {
  RANGED: 'A distanza',
  ELEMENTAL: 'Elementale',
  MECHANICAL: 'Meccanica',
  MELEE: 'Ravvicinata',
  HAT: 'Cappello',
  GLASSES: 'Occhiali',
  CHEST: 'Petto',
  BACK: 'Schiena',
  BOOTS: 'Stivali',
};

export const ARMOR_SET_LABELS: Record<ArmorSet, string> = {
  BANDIT: 'Bandito',
  KNIGHT: 'Cavaliere',
  VAMPIRE: 'Vampiro',
  MECHANIC: 'Meccanico',
  BANKER: 'Banchiere',
  TRAVELER: 'Viaggiatore',
  WIZARD: 'Mago',
  SUPERMAN: 'Superman',
  COWBOY: 'Cowboy',
  JESTER: 'Giullare',
  VIKING: 'Vichingo',
};

/** Unità del potenziamento: a valore ("+3 Fortuna") o in percentuale ("+3% Fortuna"). */
export const STAT_UNIT_LABELS: Record<StatUnit, string> = {
  FLAT: '#',
  PERCENT: '%',
};

/** Descrizione dell'unità, mostrata al passaggio del mouse. */
export const STAT_UNIT_DESCRIPTIONS: Record<StatUnit, string> = {
  FLAT: 'Aumento in valore',
  PERCENT: 'Aumento in percentuale',
};

export const STAT_LABELS: Record<Stat, string> = {
  DAMAGE: 'Danno',
  MAX_HP: 'HP',
  ATTACK_SPEED: "Velocità d'attacco",
  REGENERATION: 'Rigenerazione',
  ARMOR: 'Armatura',
  PICK_UP_HEAL: 'Cura alla raccolta',
  PICK_UP_RADIUS: 'Raggio di raccolta',
  MOVE_SPEED: 'Velocità di movimento',
  XP_GAIN: 'Guadagno XP',
  DODGE_CHANCE: 'Probabilità di schivata',
  CRIT_CHANCE: 'Probabilità di critico',
  CRIT_DAMAGE: 'Danno critico',
  LIFE_STEAL: 'Furto di vita',
  MELEE_DAMAGE: 'Danno ravvicinato',
  RANGED_DAMAGE: 'Danno a distanza',
  ELEMENTAL_DAMAGE: 'Danno elementale',
  MECHANICAL_DAMAGE: 'Danno meccanico',
  LUCK: 'Fortuna',
  PATROL_EARNINGS: 'Guadagni pattuglia',
  BOSS_DAMAGE: 'Danno ai boss',
  INTEREST: 'Interessi',
  KNOCKBACK: 'Contraccolpo',
};

/** Aggettivo concordato con la caratteristica, per i potenziamenti propri dell'arma ("Proprio danno", "Propria fortuna"). */
const OWN_ADJECTIVES: Record<Stat, 'Proprio' | 'Propria' | 'Propri'> = {
  DAMAGE: 'Proprio',
  MAX_HP: 'Propri',
  ATTACK_SPEED: 'Propria',
  REGENERATION: 'Propria',
  ARMOR: 'Propria',
  PICK_UP_HEAL: 'Propria',
  PICK_UP_RADIUS: 'Proprio',
  MOVE_SPEED: 'Propria',
  XP_GAIN: 'Proprio',
  DODGE_CHANCE: 'Propria',
  CRIT_CHANCE: 'Propria',
  CRIT_DAMAGE: 'Proprio',
  LIFE_STEAL: 'Proprio',
  MELEE_DAMAGE: 'Proprio',
  RANGED_DAMAGE: 'Proprio',
  ELEMENTAL_DAMAGE: 'Proprio',
  MECHANICAL_DAMAGE: 'Proprio',
  LUCK: 'Propria',
  PATROL_EARNINGS: 'Propri',
  BOSS_DAMAGE: 'Proprio',
  INTEREST: 'Propri',
  KNOCKBACK: 'Proprio',
};

/**
 * Caratteristica propria dell'arma: "Proprio danno", "Propri HP" (le sigle restano maiuscole);
 * in minuscolo dentro una frase ("+10% proprio danno").
 */
export function ownStatLabel(stat: Stat, lowerCase = false): string {
  const label = STAT_LABELS[stat];
  const acronym = /^.[A-Z]/.test(label);
  const adjective = lowerCase ? OWN_ADJECTIVES[stat].toLowerCase() : OWN_ADJECTIVES[stat];
  return `${adjective} ${acronym ? label : label.charAt(0).toLowerCase() + label.slice(1)}`;
}

/** Set con la preposizione, per i nomi proposti: "del Bandito", "di Superman". */
export const ARMOR_SET_OF_LABELS: Record<ArmorSet, string> = {
  BANDIT: 'del Bandito',
  KNIGHT: 'del Cavaliere',
  VAMPIRE: 'del Vampiro',
  MECHANIC: 'del Meccanico',
  BANKER: 'del Banchiere',
  TRAVELER: 'del Viaggiatore',
  WIZARD: 'del Mago',
  SUPERMAN: 'di Superman',
  COWBOY: 'del Cowboy',
  JESTER: 'del Giullare',
  VIKING: 'del Vichingo',
};

export const SORT_ORDER_LABELS: Record<ItemSortOrder, string> = {
  ARMOR_SET: 'Armor Set',
  WEAPONS_FIRST: 'Weapons first',
  RARITY: 'Rarity',
};

export const BEST_SET_TITLES: Record<BestSetMode, string> = {
  now: 'Best now',
  potential: 'Best potential',
};

export const ERROR_MESSAGES: Record<InternalErrorCode, string> = {
  GENERIC: 'Si è verificato un errore inatteso.',
  VALIDATION_FAILED: 'Alcuni dati non sono validi.',
  ITEM_NOT_FOUND: "L'item non esiste più.",
  ITEM_NAME_ALREADY_EXISTS: 'Esiste già un item con questo nome.',
  ARMOR_SLOT_ALREADY_TAKEN: 'Questo set ha già un pezzo per lo slot scelto.',
  LEVEL_OUT_OF_RANGE: 'Il livello è fuori dai limiti della rarità.',
  CUSTOM_SET_NOT_FOUND: 'Il set non esiste più.',
  CUSTOM_SET_NAME_ALREADY_EXISTS: 'Esiste già un set con questo nome.',
  CUSTOM_SET_INVALID_PIECES: 'Il set può contenere solo armature, al massimo una per slot.',
  CUSTOM_SET_INVALID_WEAPON: "L'item scelto come arma non è un'arma.",
};
