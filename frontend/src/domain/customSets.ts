import type {
  ArmorSet,
  CustomSet,
  FullSet,
  GameConstants,
  Item,
  RarityBonus,
  Specification,
  Stat,
  StatComparison,
  StatKey,
  StatUnit,
} from '../api/types';
import { ARMOR_SET_OF_LABELS, SPECIFICATION_LABELS, STAT_LABELS, STAT_UNIT_LABELS } from '../i18n/labels';

/** Variazione di un valore rispetto al set di partenza: freccia verde in su o rossa in giù. */
export type Trend = 'up' | 'down' | null;

export interface StatTrend {
  current: Trend;
  top: Trend;
}

/** Chiave di una riga: caratteristica, unità e, per quelle proprie dell'arma, "own". */
export const statKeyId = (key: StatKey & { own?: boolean }) =>
  `${key.stat}-${key.unit}${key.own ? '-own' : ''}`;

/** Unità tra parentesi, solo se non è quella predefinita della caratteristica: "", " (%)", " (valore)". */
export function unitSuffix(key: StatKey, units: Record<Stat, StatUnit>): string {
  if (key.unit === units[key.stat]) {
    return '';
  }
  return ` (${key.unit === 'PERCENT' ? STAT_UNIT_LABELS.PERCENT : 'valore'})`;
}

/** Nome della caratteristica con l'eventuale unità: "Fortuna", "Fortuna (%)". */
export function statKeyLabel(key: StatKey, units: Record<Stat, StatUnit>): string {
  return `${STAT_LABELS[key.stat]}${unitSuffix(key, units)}`;
}

/**
 * Caratteristiche tra cui scegliere per Best now / Best potential: tutte nell'unità predefinita,
 * più quelle che qualche armatura dà nell'altra unità, subito dopo.
 */
export function statKeyOptions(constants: GameConstants, items: Item[]): StatKey[] {
  const otherUnits = new Set(
    items
      .filter((item) => item.type === 'ARMOR')
      .flatMap((item) => item.bonuses)
      .map((bonus) => statKeyId(bonus)),
  );
  return constants.stats
    .filter((stat) => stat.general)
    .flatMap((stat) => {
      const keys: StatKey[] = [{ stat: stat.code, unit: stat.defaultUnit }];
      const other: StatKey = { stat: stat.code, unit: stat.defaultUnit === 'PERCENT' ? 'FLAT' : 'PERCENT' };
      if (otherUnits.has(statKeyId(other))) {
        keys.push(other);
      }
      return keys;
    });
}

const RARITY_ORDER = ['ARTIFACT', 'LEGENDARY', 'EPIC', 'RARE', 'UNCOMMON', 'COMMON'];

/** Armature di uno slot in ordine di rarità decrescente e poi di nome. */
export function slotCandidates(items: Item[], slot: Specification): Item[] {
  return items
    .filter((item) => item.type === 'ARMOR' && item.specification === slot)
    .sort(
      (first, second) =>
        RARITY_ORDER.indexOf(first.rarity) - RARITY_ORDER.indexOf(second.rarity) ||
        first.name.localeCompare(second.name, 'it'),
    );
}

/** Armi per categoria (nell'ordine del gioco), poi per rarità decrescente e nome. */
export function weaponCandidates(items: Item[], categories: Specification[]): Item[] {
  return items
    .filter((item) => item.type === 'WEAPON')
    .sort(
      (first, second) =>
        categories.indexOf(first.specification ?? 'RANGED') -
          categories.indexOf(second.specification ?? 'RANGED') ||
        RARITY_ORDER.indexOf(first.rarity) - RARITY_ORDER.indexOf(second.rarity) ||
        first.name.localeCompare(second.name, 'it'),
    );
}

/** Abilità in ordine di rarità decrescente e poi di nome. */
export function abilityCandidates(items: Item[]): Item[] {
  return items
    .filter((item) => item.type === 'ABILITY')
    .sort(
      (first, second) =>
        RARITY_ORDER.indexOf(first.rarity) - RARITY_ORDER.indexOf(second.rarity) ||
        first.name.localeCompare(second.name, 'it'),
    );
}

/** Categorie di arma nell'ordine del gioco (A distanza, Elementale, Meccanica, Ravvicinata). */
export function weaponSpecifications(constants: GameConstants): Specification[] {
  return constants.specifications.filter((spec) => spec.itemType === 'WEAPON').map((spec) => spec.code);
}

/** Slot di armatura nell'ordine del gioco (Cappello, Occhiali, Petto, Schiena, Stivali). */
export function armorSlots(constants: GameConstants): Specification[] {
  return constants.specifications.filter((spec) => spec.itemType === 'ARMOR').map((spec) => spec.code);
}

/** Pezzi indossati per slot (al massimo uno ciascuno). */
export type SlotSelection = Partial<Record<Specification, Item>>;

export function selectionOf(pieces: Item[]): SlotSelection {
  return Object.fromEntries(
    pieces.filter((piece) => piece.specification).map((piece) => [piece.specification, piece]),
  ) as SlotSelection;
}

/** Id dei pezzi nell'ordine degli slot. */
export function itemIdsOf(selection: SlotSelection, slots: Specification[]): number[] {
  return slots.flatMap((slot) => {
    const piece = selection[slot];
    return piece ? [piece.id] : [];
  });
}

const trendOf = (before: number, after: number): Trend => {
  if (after > before) return 'up';
  if (after < before) return 'down';
  return null;
};

/** Valore di una riga compreso il contributo dell'arma: è quello che conta per evidenziazioni e frecce. */
export function totalOf(row: StatComparison, column: 'current' | 'top'): number {
  return column === 'current' ? row.current + (row.weaponCurrent ?? 0) : row.top + (row.weaponTop ?? 0);
}

/**
 * Frecce della tabella modificata: confronto riga per riga (caratteristica e unità) con il set di partenza,
 * sui totali con l'arma.
 */
export function statTrends(original: StatComparison[], modified: StatComparison[]): Map<string, StatTrend> {
  const before = new Map(original.map((row) => [statKeyId(row), row]));
  return new Map(
    modified.map((row) => {
      const previous = before.get(statKeyId(row));
      return [
        statKeyId(row),
        {
          current: trendOf(previous ? totalOf(previous, 'current') : 0, totalOf(row, 'current')),
          top: trendOf(previous ? totalOf(previous, 'top') : 0, totalOf(row, 'top')),
        },
      ];
    }),
  );
}

/** Tipi di arma in minuscolo: "a distanza, elementale"; nessuno se tutti i tipi sono pari. */
export function weaponTypesText(types: Specification[]): string {
  return types.length === 0
    ? 'nessuna in particolare'
    : types.map((type) => SPECIFICATION_LABELS[type].toLowerCase()).join(', ');
}

/** Armi consigliate o sconsigliate: quelle attuali e, se diverse, quelle al massimo potenziale tra parentesi. */
export function weaponAdviceText(now: Specification[], top: Specification[]): string {
  const nowText = weaponTypesText(now);
  const topText = weaponTypesText(top);
  return nowText === topText ? nowText : `${nowText} (al massimo potenziale: ${topText})`;
}

/** Nome proposto per un set custom nato da un Full Set: "Set del Bandito personalizzato". */
export function customizedName(armorSet: ArmorSet): string {
  return `Set ${ARMOR_SET_OF_LABELS[armorSet]} personalizzato`;
}

/** Full Set come set di partenza di un set custom non ancora salvato (senza arma né abilità). */
export function fullSetAsCustomSet(fullSet: FullSet): CustomSet {
  return {
    id: null,
    name: null,
    bonusArmorSet: fullSet.bonusActive ? fullSet.armorSet : null,
    bonusDescription: fullSet.bonusActive ? fullSet.bonusDescription : null,
    pieces: fullSet.pieces,
    weapon: null,
    ability: null,
    levelStats: fullSet.levelStats,
    stats: fullSet.stats,
    abilityStats: [],
    weaponAdvice: fullSet.weaponAdvice,
  };
}

/** Stessi pezzi negli stessi slot: nulla da salvare. */
export function sameSelection(first: SlotSelection, second: SlotSelection, slots: Specification[]): boolean {
  return slots.every((slot) => first[slot]?.id === second[slot]?.id);
}

/** Variazione di una caratteristica scegliendo un candidato: attuale (potenziamenti sbloccati) e top (tutti). */
export interface StatDelta extends StatKey {
  own: boolean;
  current: number;
  top: number;
}

/** Somma i potenziamenti di un item per riga, con segno: +1 per il candidato, -1 per l'item che sostituisce. */
function addBonuses(totals: Map<string, StatDelta>, bonuses: RarityBonus[], sign: 1 | -1) {
  bonuses.forEach((bonus) => {
    const id = statKeyId(bonus);
    const delta = totals.get(id) ?? {
      stat: bonus.stat,
      unit: bonus.unit,
      own: bonus.own,
      current: 0,
      top: 0,
    };
    delta.top += sign * bonus.amount;
    if (bonus.unlocked) {
      delta.current += sign * bonus.amount;
    }
    totals.set(id, delta);
  });
}

/**
 * Caratteristiche che cambiano mettendo il candidato al posto dell'item dello slot (o nello slot vuoto):
 * solo le righe con una variazione, nell'ordine delle caratteristiche del gioco e con quelle proprie in fondo.
 * Le caratteristiche di un set sono la somma dei potenziamenti, quindi basta la differenza tra i due item.
 */
export function swapPreview(candidate: Item, replaced: Item | null, constants: GameConstants): StatDelta[] {
  const totals = new Map<string, StatDelta>();
  addBonuses(totals, candidate.bonuses, 1);
  if (replaced) {
    addBonuses(totals, replaced.bonuses, -1);
  }
  // Le abilità seguono il loro elenco chiuso, le altre l'ordine del gioco
  const fixed = (constants.itemTypes.find((type) => type.code === candidate.type)?.fixedBonuses ?? []).map(
    (key) => statKeyId(key),
  );
  const stats = constants.stats.map((stat) => stat.code);
  const rank = (delta: StatDelta) => {
    const index = fixed.indexOf(statKeyId(delta));
    return index >= 0 ? index : fixed.length;
  };
  return [...totals.values()]
    .map((delta) => ({ ...delta, current: round(delta.current), top: round(delta.top) }))
    .filter((delta) => delta.current !== 0 || delta.top !== 0)
    .sort(
      (first, second) =>
        rank(first) - rank(second) ||
        Number(first.own) - Number(second.own) ||
        stats.indexOf(first.stat) - stats.indexOf(second.stat) ||
        first.unit.localeCompare(second.unit),
    );
}

/** Le quantità hanno al massimo due decimali: si tolgono gli errori delle somme in virgola mobile. */
const round = (value: number) => Math.round(value * 100) / 100;
