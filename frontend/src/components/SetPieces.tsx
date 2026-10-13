import { Text, Tooltip, UnstyledButton } from '@mantine/core';
import type { Item, Specification } from '../api/types';
import { formatLevel } from '../domain/format';
import { thumbnailOf } from '../domain/itemImages';
import { useSlotSize } from '../hooks/useSlotSize';
import { SPECIFICATION_LABELS } from '../i18n/labels';
import { ItemThumbnail, type ThumbnailAction } from './ItemThumbnail';
import classes from './SetPieces.module.css';

interface Props {
  slots: Specification[];
  pieces: Item[];
  /** Tocco su un pezzo presente (dettaglio dell'item o sostituzione). */
  onPiece?: (piece: Item) => void;
  /** Tocco su uno slot vuoto; senza, lo slot vuoto non è cliccabile. */
  onEmpty?: (slot: Specification) => void;
  /** Azione mostrata sui pezzi presenti: "edit" quando toccarli serve a sostituirli. */
  pieceAction?: ThumbnailAction;
  /** Testo dello slot vuoto per lo screen reader, es. "Aggiungi Cappello Vichingo". */
  emptyLabel?: (slot: Specification) => string;
  /** Nome del pezzo sotto l'immagine (in modifica, dove i pezzi di set diversi si confondono). */
  showNames?: boolean;
}

/** Riga dei 5 slot di armatura: immagine della categoria con la cornice della rarità, "+" sugli slot vuoti. */
export function SetPieces({
  slots,
  pieces,
  onPiece,
  onEmpty,
  pieceAction,
  emptyLabel,
  showNames = false,
}: Props) {
  const size = useSlotSize();
  return (
    <div className={classes.pieces}>
      {slots.map((slot) => {
        const piece = pieces.find((item) => item.specification === slot);
        const slotLabel = SPECIFICATION_LABELS[slot];
        return (
          <div key={slot} className={classes.piece}>
            {piece ? (
              <Tooltip label={piece.name} events={{ hover: true, focus: true, touch: false }}>
                <UnstyledButton
                  onClick={onPiece ? () => onPiece(piece) : undefined}
                  disabled={!onPiece}
                  aria-label={pieceAction === 'edit' ? `Sostituisci ${piece.name}` : `Apri ${piece.name}`}
                >
                  <ItemThumbnail {...thumbnailOf(piece)} size={size} action={pieceAction} />
                </UnstyledButton>
              </Tooltip>
            ) : onEmpty ? (
              <Tooltip
                label={`Aggiungi ${slotLabel.toLowerCase()}`}
                events={{ hover: true, focus: true, touch: false }}
              >
                <UnstyledButton
                  onClick={() => onEmpty(slot)}
                  aria-label={emptyLabel?.(slot) ?? `Aggiungi ${slotLabel}`}
                >
                  <ItemThumbnail
                    type="ARMOR"
                    specification={slot}
                    label={slotLabel}
                    size={size}
                    action="add"
                  />
                </UnstyledButton>
              </Tooltip>
            ) : (
              <ItemThumbnail type="ARMOR" specification={slot} label={`${slotLabel} vuoto`} size={size} />
            )}
            <Text size="xs" fw={700}>
              {piece ? formatLevel(piece.level, piece.maxLevel) : '-'}
            </Text>
            {showNames && (
              <Text size="xs" c="dimmed" lineClamp={2} className={classes.name}>
                {piece?.name ?? slotLabel}
              </Text>
            )}
          </div>
        );
      })}
    </div>
  );
}
