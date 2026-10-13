import { Group, Stack, Text, UnstyledButton } from '@mantine/core';
import type { Item } from '../api/types';
import { formatLevel } from '../domain/format';
import { thumbnailOf } from '../domain/itemImages';
import { useSlotSize } from '../hooks/useSlotSize';
import { SPECIFICATION_LABELS } from '../i18n/labels';
import { ItemThumbnail, type ThumbnailAction } from './ItemThumbnail';

/** Arma o abilità: lo slot vuoto mostra l'immagine della tipologia con il "+". */
export type GearKind = 'WEAPON' | 'ABILITY';

const GEAR_TEXTS: Record<GearKind, { title: string; add: string; addLabel: string }> = {
  WEAPON: { title: 'Arma', add: 'Aggiungi un’arma', addLabel: 'Aggiungi arma' },
  ABILITY: { title: 'Abilità', add: 'Aggiungi un’abilità', addLabel: 'Aggiungi abilità' },
};

interface Props {
  kind?: GearKind;
  /** Arma o abilità scelta, null se nessuna. */
  item: Item | null;
  /** Tocco sull'item o sullo slot vuoto; senza, lo slot non è cliccabile. */
  onClick?: () => void;
  /** Azione mostrata sull'item presente: "edit" quando toccarlo serve a sostituirlo. */
  action?: ThumbnailAction;
}

/** Arma o abilità di un set custom, accanto alle armature: immagine della categoria con "+" se manca. */
export function GearSlot({ kind = 'WEAPON', item, onClick, action }: Props) {
  const size = useSlotSize(); // Grande come i pezzi del set
  const texts = GEAR_TEXTS[kind];
  const content = (
    <Group gap="sm" wrap="nowrap">
      {item ? (
        <ItemThumbnail {...thumbnailOf(item)} size={size} action={action} />
      ) : (
        <ItemThumbnail
          type={kind}
          specification={kind === 'WEAPON' ? 'RANGED' : null}
          label={texts.title}
          size={size}
          action={onClick ? 'add' : undefined}
        />
      )}
      <Stack gap={0} style={{ minWidth: 0 }}>
        <Text size="xs" c="dimmed" fw={700} tt="uppercase">
          {texts.title}
        </Text>
        <Text size="sm" fw={700} truncate>
          {item ? item.name : onClick ? texts.add : 'Nessuna'}
        </Text>
        {item && (
          <Text size="xs" c="dimmed">
            {item.specification ? `${SPECIFICATION_LABELS[item.specification]} · ` : ''}
            {formatLevel(item.level, item.maxLevel)}
          </Text>
        )}
      </Stack>
    </Group>
  );
  if (!onClick) {
    return content;
  }
  let label = texts.addLabel;
  if (item) {
    label = action === 'edit' ? `Sostituisci ${item.name}` : `Apri ${item.name}`;
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
