import { Group, Stack, Text, UnstyledButton } from '@mantine/core';
import type { Item, ItemType, Specification } from '../api/types';
import { formatLevel } from '../domain/format';
import { thumbnailOf } from '../domain/itemImages';
import { ItemThumbnail } from './ItemThumbnail';

/** Lato dell'immagine di un pezzo nell'elenco di un set. */
const SIZE = 48;

interface Props {
  item: Item | null;
  /** Categoria dello slot, per l'immagine dello slot vuoto. */
  type: ItemType;
  specification: Specification | null;
  /** Nome dello slot vuoto: "Nessuno", "Nessuna". */
  emptyName: string;
  /** Tocco sul pezzo presente o sullo slot vuoto; senza, la riga non è cliccabile. */
  onClick?: () => void;
  /** Il tocco sul pezzo presente serve a sostituirlo (matita sull'immagine). */
  editable?: boolean;
  /** Testo per lo screen reader del tocco sullo slot vuoto, es. "Aggiungi Cappello". */
  addLabel?: string;
}

/**
 * Pezzo di un set su una riga: immagine, nome e sotto il livello. Lo slot vuoto ha l'immagine della categoria
 * con il "+" se si può riempire da qui, altrimenti con la X rossa, e "Nessuno" e "- / -" al posto di nome e livello.
 */
export function SetItemRow({
  item,
  type,
  specification,
  emptyName,
  onClick,
  editable = false,
  addLabel,
}: Props) {
  const content = (
    <Group gap="sm" wrap="nowrap">
      {item ? (
        <ItemThumbnail
          {...thumbnailOf(item)}
          size={SIZE}
          action={editable ? 'edit' : undefined}
          summary={item}
        />
      ) : (
        <ItemThumbnail
          type={type}
          specification={specification}
          label={emptyName}
          size={SIZE}
          action={onClick ? 'add' : 'missing'}
        />
      )}
      <Stack gap={0} style={{ minWidth: 0 }}>
        <Text
          size="sm"
          fw={700}
          c={item ? undefined : 'dimmed'}
          lineClamp={2}
          style={{ overflowWrap: 'anywhere' }}
        >
          {item ? item.name : emptyName}
        </Text>
        <Text size="xs" c="dimmed">
          {item ? formatLevel(item.level, item.maxLevel) : '- / -'}
        </Text>
      </Stack>
    </Group>
  );
  if (!onClick) {
    return content;
  }
  let label = addLabel ?? `Aggiungi ${emptyName}`;
  if (item) {
    label = editable ? `Sostituisci ${item.name}` : `Apri ${item.name}`;
  }
  return (
    <UnstyledButton
      onClick={onClick}
      aria-label={label}
      style={{ alignSelf: 'flex-start', maxWidth: '100%' }}
    >
      {content}
    </UnstyledButton>
  );
}
