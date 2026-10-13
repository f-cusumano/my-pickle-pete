import { Box } from '@mantine/core';
import { IconPencil, IconPlus } from '@tabler/icons-react';
import type { ItemType, Rarity, Specification } from '../api/types';
import { categoryImage } from '../domain/itemImages';
import { RARITY_COLORS } from '../domain/rarityColors';
import { ITEM_TYPE_ICONS } from './icons';

/** Azione sovrapposta in trasparenza all'immagine: aggiungere un pezzo mancante o modificare quello presente. */
export type ThumbnailAction = 'add' | 'edit';

interface Props {
  type: ItemType | null;
  specification: Specification | null;
  /** Rarità per il colore della cornice; senza rarità (slot vuoto, item non ancora censito) la cornice è grigia. */
  rarity?: Rarity | null;
  label: string;
  size?: number;
  action?: ThumbnailAction;
  /** Senza cornice colorata (censimento, dove la rarità non conta): solo l'immagine con il bordo. */
  plain?: boolean;
}

const EMPTY_FRAME = '#c9c4b5';
const ACTION_ICONS = { add: IconPlus, edit: IconPencil };

/** Immagine predefinita della categoria nella cornice del colore della rarità, con l'eventuale azione in trasparenza. */
export function ItemThumbnail({
  type,
  specification,
  rarity = null,
  label,
  size = 44,
  action,
  plain = false,
}: Props) {
  const src = categoryImage(type, specification);
  const frame = plain ? 0 : Math.max(3, Math.round(size / 14));
  const FallbackIcon = type ? ITEM_TYPE_ICONS[type] : IconPlus;
  const ActionIcon = action ? ACTION_ICONS[action] : null;
  return (
    <Box
      role="img"
      aria-label={label}
      style={{
        position: 'relative',
        width: size,
        height: size,
        flex: `0 0 ${String(size)}px`,
        borderRadius: Math.round(size / 5),
        border: plain ? '1px solid var(--mantine-color-gray-4)' : '2px solid #111',
        padding: frame,
        background: rarity && !plain ? RARITY_COLORS[rarity] : EMPTY_FRAME,
        overflow: 'hidden',
      }}
    >
      {src ? (
        <img
          src={src}
          alt=""
          draggable={false}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            borderRadius: Math.max(2, Math.round(size / 9)),
            opacity: action === 'add' ? 0.45 : 1,
          }}
        />
      ) : (
        <Box
          style={{
            width: '100%',
            height: '100%',
            borderRadius: Math.max(2, Math.round(size / 9)),
            background: '#ece6d6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FallbackIcon size={Math.round(size * 0.45)} stroke={1.6} color="#3b4636" />
        </Box>
      )}
      {ActionIcon && (
        <Box
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <ActionIcon
            size={Math.round(size * (action === 'add' ? 0.55 : 0.4))}
            stroke={2.6}
            color="#1b2a17"
            style={{ opacity: action === 'add' ? 0.75 : 0.85, filter: 'drop-shadow(0 0 2px #fff)' }}
          />
        </Box>
      )}
    </Box>
  );
}
