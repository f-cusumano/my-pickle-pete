import type {
  ArmorSet,
  GameConstants,
  Item,
  ItemSortOrder,
  ItemType,
  Rarity,
  Specification,
} from '../api/types';

/** Valore "-nessuno-" dei filtri su Specifica e Set (abilità, armi). */
export const NONE = 'NONE';
export type Optional<T> = T | typeof NONE;

export type FilterColumn = 'rarity' | 'type' | 'specification' | 'armorSet';

/** Valori scelti per colonna: nessun valore scelto = nessun filtro. */
export interface ColumnFilters {
  rarity: Rarity[];
  type: ItemType[];
  specification: Optional<Specification>[];
  armorSet: Optional<ArmorSet>[];
}

export const NO_FILTERS: ColumnFilters = { rarity: [], type: [], specification: [], armorSet: [] };

export function filterActive(filters: ColumnFilters, column: FilterColumn): boolean {
  return filters[column].length > 0;
}

/** Valore dell'item per la colonna, con NONE dove l'attributo non si applica. */
export function columnValue(item: Item, column: FilterColumn): string {
  switch (column) {
    case 'rarity':
      return item.rarity;
    case 'type':
      return item.type;
    case 'specification':
      return item.specification ?? NONE;
    case 'armorSet':
      return item.armorSet ?? NONE;
  }
}

export function applyFilters(items: Item[], filters: ColumnFilters): Item[] {
  const columns: FilterColumn[] = ['rarity', 'type', 'specification', 'armorSet'];
  const active = columns.filter((column) => filterActive(filters, column));
  if (active.length === 0) {
    return items;
  }
  return items.filter((item) =>
    active.every((column) => (filters[column] as string[]).includes(columnValue(item, column))),
  );
}

/**
 * Voci della tendina di una colonna: solo i valori presenti negli item, nell'ordine degli ordinamenti
 * (rarità decrescente, tipologie secondo l'ordinamento scelto, specifiche per tipologia, set del gioco),
 * con "-nessuno-" in fondo per Specifica e Set.
 */
export function filterOptions(
  items: Item[],
  column: FilterColumn,
  constants: GameConstants,
  sortOrder: ItemSortOrder,
): string[] {
  const present = new Set(items.map((item) => columnValue(item, column)));
  const typeOrder = constants.sortOrders.find((order) => order.code === sortOrder)?.typeOrder ?? [];
  let ordered: string[];
  switch (column) {
    case 'rarity':
      ordered = constants.rarities.map((rarity) => rarity.code).reverse();
      break;
    case 'type':
      ordered = typeOrder;
      break;
    case 'specification':
      ordered = [
        ...typeOrder.flatMap((type) =>
          constants.specifications.filter((spec) => spec.itemType === type).map((spec) => spec.code),
        ),
        NONE,
      ];
      break;
    case 'armorSet':
      ordered = [...constants.armorSets, NONE];
      break;
  }
  return ordered.filter((value) => present.has(value));
}
