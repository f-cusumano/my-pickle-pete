import type {
  GameConstants,
  Item,
  Specification,
  Stat,
  StatComparison,
  StatKey,
  StatUnit,
} from '../api/types';
import { STAT_LABELS, STAT_UNIT_LABELS } from '../i18n/labels';

/** Variazione di un valore rispetto al set di partenza: freccia verde in su o rossa in giù. */
export type Trend = 'up' | 'down' | null;

export interface StatTrend {
  current: Trend;
  top: Trend;
}

export const statKeyId = (key: StatKey) => `${key.stat}-${key.unit}`;

/** Unità tra parentesi, solo se non è quella predefinita della caratteristica: "", " (%)", " (valore)". */
export function unitSuffix(key: StatKey, units: Record<Stat, StatUnit>): string {
  if (key.unit === units[key.stat]) {
    return '';
  }
  return ` (${key.unit === 'PERCENT' ? STAT_UNIT_LABELS.PERCENT : STAT_UNIT_LABELS.FLAT.toLowerCase()})`;
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
  return constants.stats.flatMap((stat) => {
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

/** Frecce della tabella modificata: confronto riga per riga (caratteristica e unità) con il set di partenza. */
export function statTrends(original: StatComparison[], modified: StatComparison[]): Map<string, StatTrend> {
  const before = new Map(original.map((row) => [statKeyId(row), row]));
  return new Map(
    modified.map((row) => {
      const previous = before.get(statKeyId(row));
      return [
        statKeyId(row),
        { current: trendOf(previous?.current ?? 0, row.current), top: trendOf(previous?.top ?? 0, row.top) },
      ];
    }),
  );
}

/** Stessi pezzi negli stessi slot: nulla da salvare. */
export function sameSelection(first: SlotSelection, second: SlotSelection, slots: Specification[]): boolean {
  return slots.every((slot) => first[slot]?.id === second[slot]?.id);
}
