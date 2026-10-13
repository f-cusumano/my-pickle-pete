import { Group, Stack, Text, UnstyledButton } from '@mantine/core';
import type { Item } from '../api/types';
import { formatLevel } from '../domain/format';
import { thumbnailOf } from '../domain/itemImages';
import { SPECIFICATION_LABELS } from '../i18n/labels';
import { ItemThumbnail, type ThumbnailAction } from './ItemThumbnail';

interface Props {
  weapon: Item | null;
  /** Tocco sull'arma o sullo slot vuoto; senza, lo slot non è cliccabile. */
  onClick?: () => void;
  /** Azione mostrata sull'arma presente: "edit" quando toccarla serve a sostituirla. */
  action?: ThumbnailAction;
}

/** Arma di un set custom, accanto alle armature: immagine della categoria con "+" se manca. */
export function WeaponSlot({ weapon, onClick, action }: Props) {
  const content = (
    <Group gap="sm" wrap="nowrap">
      {weapon ? (
        <ItemThumbnail {...thumbnailOf(weapon)} size={52} action={action} />
      ) : (
        <ItemThumbnail
          type="WEAPON"
          specification="RANGED"
          label="Arma"
          size={52}
          action={onClick ? 'add' : undefined}
        />
      )}
      <Stack gap={0} style={{ minWidth: 0 }}>
        <Text size="xs" c="dimmed" fw={700} tt="uppercase">
          Arma
        </Text>
        <Text size="sm" fw={700} truncate>
          {weapon ? weapon.name : onClick ? 'Aggiungi un’arma' : 'Nessuna'}
        </Text>
        {weapon && (
          <Text size="xs" c="dimmed">
            {weapon.specification ? `${SPECIFICATION_LABELS[weapon.specification]} · ` : ''}
            {formatLevel(weapon.level, weapon.maxLevel)}
          </Text>
        )}
      </Stack>
    </Group>
  );
  if (!onClick) {
    return content;
  }
  let label = 'Aggiungi arma';
  if (weapon) {
    label = action === 'edit' ? `Sostituisci ${weapon.name}` : `Apri ${weapon.name}`;
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
