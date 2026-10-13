import { Stack } from '@mantine/core';
import type { Item, Specification } from '../api/types';
import { EMPTY_SLOT_LABELS, SPECIFICATION_LABELS } from '../i18n/labels';
import { SetItemRow } from './SetItemRow';

interface Props {
  slots: Specification[];
  pieces: Item[];
  /** Tocco su un pezzo presente (dettaglio dell'item o sostituzione). */
  onPiece?: (piece: Item) => void;
  /** Tocco su uno slot vuoto; senza, lo slot vuoto ha la X rossa e non è cliccabile. */
  onEmpty?: (slot: Specification) => void;
  /** Il tocco sui pezzi presenti serve a sostituirli. */
  editable?: boolean;
  /** Testo dello slot vuoto per lo screen reader, es. "Aggiungi Cappello Vichingo". */
  emptyLabel?: (slot: Specification) => string;
}

/** I 5 slot di armatura di un set, uno sotto l'altro nell'ordine del gioco. */
export function SetItemList({ slots, pieces, onPiece, onEmpty, editable, emptyLabel }: Props) {
  return (
    <Stack gap={8}>
      {slots.map((slot) => {
        const piece = pieces.find((item) => item.specification === slot) ?? null;
        let onClick: (() => void) | undefined;
        if (piece && onPiece) {
          onClick = () => onPiece(piece);
        } else if (!piece && onEmpty) {
          onClick = () => onEmpty(slot);
        }
        return (
          <SetItemRow
            key={slot}
            item={piece}
            type="ARMOR"
            specification={slot}
            emptyName={EMPTY_SLOT_LABELS[slot]}
            onClick={onClick}
            editable={editable}
            addLabel={emptyLabel?.(slot) ?? `Aggiungi ${SPECIFICATION_LABELS[slot]}`}
          />
        );
      })}
    </Stack>
  );
}

interface GearProps {
  weapon: Item | null;
  ability: Item | null;
  /** Tocco su arma o abilità (presenti, o anche vuote se editable). */
  onClick?: (kind: 'WEAPON' | 'ABILITY', item: Item | null) => void;
  /** In modifica: il tocco sostituisce o aggiunge. */
  editable?: boolean;
}

/** Arma e abilità di un set custom, come i pezzi del set: "+" o X rossa se mancano. */
export function SetGearList({ weapon, ability, onClick, editable = false }: GearProps) {
  const handler = (kind: 'WEAPON' | 'ABILITY', item: Item | null) => {
    if (!onClick || (!item && !editable)) return undefined;
    return () => onClick(kind, item);
  };
  return (
    <Stack gap={8}>
      <SetItemRow
        item={weapon}
        type="WEAPON"
        specification="RANGED"
        emptyName={EMPTY_SLOT_LABELS.WEAPON}
        onClick={handler('WEAPON', weapon)}
        editable={editable}
        addLabel="Aggiungi arma"
      />
      <SetItemRow
        item={ability}
        type="ABILITY"
        specification={null}
        emptyName={EMPTY_SLOT_LABELS.ABILITY}
        onClick={handler('ABILITY', ability)}
        editable={editable}
        addLabel="Aggiungi abilità"
      />
    </Stack>
  );
}
