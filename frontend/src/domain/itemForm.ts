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
import { ARMOR_SET_LABELS, SPECIFICATION_LABELS } from '../i18n/labels';

/** Aumento minimo di un potenziamento (in valore o in percentuale). */
export const MIN_BONUS_AMOUNT = 1;

export interface BonusRow {
  stat: Stat | null;
  /** Valore o percentuale: alla scelta della caratteristica si propone la sua unità predefinita. */
  unit: StatUnit | null;
  amount: number | string;
  /** Solo armi: potenziamento della sola arma ("+10% al proprio danno"). */
  own: boolean;
}

/** Valori del modulo di censimento di un item. */
export interface ItemFormValues {
  name: string;
  type: ItemType | null;
  specification: Specification | null;
  armorSet: ArmorSet | null;
  bonuses: Partial<Record<Rarity, BonusRow>>;
}

/** Nome proposto per il pezzo mancante di un Full Set: "<Specifica> da <Set>", es. "Cappello da Cavaliere". */
export function missingPieceName(slot: Specification, armorSet: ArmorSet): string {
  return `${SPECIFICATION_LABELS[slot]} da ${ARMOR_SET_LABELS[armorSet]}`;
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
        { stat: bonus.stat, unit: bonus.unit, amount: bonus.amount, own: bonus.own },
      ]),
    ),
  };
}

function amountOf(row: BonusRow): number | null {
  const amount =
    typeof row.amount === 'number' ? row.amount : Number.parseFloat(row.amount.replace(',', '.'));
  return Number.isFinite(amount) ? amount : null;
}

const EMPTY_ROW: BonusRow = { stat: null, unit: null, amount: '', own: false };

/** Rarità che sbloccano un potenziamento (tutte tranne la base, Comune). */
export function bonusRarities(constants: GameConstants): Rarity[] {
  return constants.rarities.slice(1).map((rarity) => rarity.code);
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
  // Ogni rarità oltre la base sblocca un potenziamento: vanno compilati tutti
  for (const rarity of bonusRarities(constants)) {
    const row = values.bonuses[rarity] ?? EMPTY_ROW;
    const amount = amountOf(row);
    if (row.stat === null) {
      errors[`bonuses.${rarity}.stat`] = 'Scegli la caratteristica';
    }
    if (row.unit === null) {
      errors[`bonuses.${rarity}.unit`] = 'Scegli valore o percentuale';
    }
    if (amount === null || amount < MIN_BONUS_AMOUNT) {
      errors[`bonuses.${rarity}.amount`] = `Almeno ${String(MIN_BONUS_AMOUNT)}`;
    }
  }
  return errors;
}

/** Richiesta per il backend: specifica e set solo dove si applicano, potenziamenti per rarità crescente. */
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
        ? [{ rarity, stat: row.stat, unit: row.unit, amount, own: type.code === 'WEAPON' && row.own }]
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
