import type {
  ArmorSet,
  GameConstants,
  Item,
  ItemRequest,
  ItemType,
  Rarity,
  Specification,
  Stat,
  StatUnit,
} from '../api/types';

export interface BonusRow {
  stat: Stat | null;
  /** Valore o percentuale: alla scelta della caratteristica si propone la sua unità predefinita. */
  unit: StatUnit | null;
  amount: number | string;
}

/** Valori del modulo di censimento di un item. */
export interface ItemFormValues {
  name: string;
  type: ItemType | null;
  specification: Specification | null;
  armorSet: ArmorSet | null;
  bonuses: Partial<Record<Rarity, BonusRow>>;
}

export function emptyForm(): ItemFormValues {
  return { name: '', type: null, specification: null, armorSet: null, bonuses: {} };
}

export function formOf(item: Item): ItemFormValues {
  return {
    name: item.name,
    type: item.type,
    specification: item.specification,
    armorSet: item.armorSet,
    bonuses: Object.fromEntries(
      item.bonuses.map((bonus) => [
        bonus.rarity,
        { stat: bonus.stat, unit: bonus.unit, amount: bonus.amount },
      ]),
    ),
  };
}

function amountOf(row: BonusRow): number | null {
  const amount =
    typeof row.amount === 'number' ? row.amount : Number.parseFloat(row.amount.replace(',', '.'));
  return Number.isFinite(amount) ? amount : null;
}

function rowFilled(row: BonusRow | undefined): row is BonusRow {
  return row !== undefined && (row.stat !== null || row.amount !== '');
}

/** Errori del modulo per campo (chiavi di @mantine/form), vuoto se il modulo è valido. */
export function validateForm(values: ItemFormValues, constants: GameConstants): Record<string, string> {
  const errors: Record<string, string> = {};
  if (values.name.trim() === '') {
    errors.name = 'Il nome è obbligatorio';
  }
  const type = constants.itemTypes.find((t) => t.code === values.type);
  if (!type) {
    errors.type = 'Scegli la tipologia';
    return errors;
  }
  if (type.specified && values.specification === null) {
    errors.specification = 'Scegli la specifica';
  }
  if (type.partOfArmorSet && values.armorSet === null) {
    errors.armorSet = 'Scegli il set';
  }
  for (const [rarity, row] of Object.entries(values.bonuses)) {
    if (!rowFilled(row)) {
      continue;
    }
    const amount = amountOf(row);
    if (row.stat === null) {
      errors[`bonuses.${rarity}.stat`] = 'Scegli la caratteristica';
    }
    if (row.unit === null) {
      errors[`bonuses.${rarity}.unit`] = 'Scegli valore o percentuale';
    }
    if (amount === null || amount <= 0) {
      errors[`bonuses.${rarity}.amount`] = 'Valore maggiore di 0';
    }
  }
  return errors;
}

/** Richiesta per il backend: specifica e set solo dove si applicano, potenziamenti solo se compilati. */
export function toRequest(values: ItemFormValues, constants: GameConstants): ItemRequest {
  const type = constants.itemTypes.find((t) => t.code === values.type);
  if (!type) {
    throw new Error('Tipologia mancante');
  }
  const bonuses = constants.rarities
    .map((rarity) => rarity.code)
    .flatMap((rarity) => {
      const row = values.bonuses[rarity];
      const amount = row ? amountOf(row) : null;
      return row?.stat && row.unit && amount !== null
        ? [{ rarity, stat: row.stat, unit: row.unit, amount }]
        : [];
    });
  return {
    name: values.name.trim(),
    type: type.code,
    specification: type.specified ? values.specification : null,
    armorSet: type.partOfArmorSet ? values.armorSet : null,
    bonuses,
  };
}
