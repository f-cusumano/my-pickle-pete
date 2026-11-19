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

/** Valori scelti per colonna: nessun valore scelto = nessun filtro. Il nome si filtra col testo digitato. */
export interface ColumnFilters {
  name: string;
  rarity: Rarity[];
  type: ItemType[];
  specification: Optional<Specification>[];
  armorSet: Optional<ArmorSet>[];
}

export const NO_FILTERS: ColumnFilters = { name: '', rarity: [], type: [], specification: [], armorSet: [] };

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

/** Testo confrontabile: minuscolo e senza accenti, così "perche" trova anche "Perché". */
function searchable(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

export function applyFilters(items: Item[], filters: ColumnFilters): Item[] {
  const columns: FilterColumn[] = ['rarity', 'type', 'specification', 'armorSet'];
  const active = columns.filter((column) => filterActive(filters, column));
  const name = searchable(filters.name.trim());
  if (active.length === 0 && name === '') {
    return items;
  }
  return items.filter(
    (item) =>
      searchable(item.name).includes(name) &&
      active.every((column) => (filters[column] as string[]).includes(columnValue(item, column))),
  );
}

/**
 * La specifica è compatibile con le tipologie filtrate: le specifiche della tipologia, "-nessuno-" per quelle senza
 * specifica (abilità); senza filtro sulla tipologia vanno bene tutte.
 */
export function specificationAllowed(value: string, types: ItemType[], constants: GameConstants): boolean {
  if (types.length === 0) return true;
  if (value === NONE) {
    return constants.itemTypes.some((type) => types.includes(type.code) && !type.specified);
  }
  return constants.specifications.some((spec) => spec.code === value && types.includes(spec.itemType));
}

/** Cambiando le tipologie si tolgono dal filtro le specifiche diventate incompatibili (resterebbero non deselezionabili). */
export function withTypes(filters: ColumnFilters, types: ItemType[], constants: GameConstants): ColumnFilters {
  return {
    ...filters,
    type: types,
    specification: filters.specification.filter((value) => specificationAllowed(value, types, constants)),
  };
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
