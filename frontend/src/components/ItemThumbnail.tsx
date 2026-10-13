import { Box } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconPencil, IconPlus, IconX } from '@tabler/icons-react';
import { useState } from 'react';
import type { Item, ItemType, Rarity, Specification } from '../api/types';
import { categoryImage } from '../domain/itemImages';
import { RARITY_COLORS } from '../domain/rarityColors';
import { ITEM_TYPE_ICONS } from './icons';
import { ItemSummary } from './ItemSummary';
import { PointerFloat } from './PointerFloat';

/**
 * Simbolo sovrapposto all'immagine: aggiungere un pezzo mancante, modificare quello presente,
 * oppure la X rossa di un pezzo che manca e non si può aggiungere da lì.
 */
export type ThumbnailAction = 'add' | 'edit' | 'missing';

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
  /** Item rappresentato: passandoci col mouse se ne vede il resoconto. */
  summary?: Item;
}

const EMPTY_FRAME = '#c9c4b5';
const ACTION_ICONS = { add: IconPlus, edit: IconPencil, missing: IconX };

/** Immagine predefinita della categoria nella cornice del colore della rarità, con l'eventuale azione in trasparenza. */
export function ItemThumbnail({
  type,
  specification,
  rarity = null,
  label,
  size = 44,
  action,
  plain = false,
  summary,
}: Props) {
  const canHover = useMediaQuery('(hover: hover) and (pointer: fine)');
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const hoverable = summary !== undefined && canHover;
  const src = categoryImage(type, specification);
  const frame = plain ? 0 : Math.max(3, Math.round(size / 14));
  const FallbackIcon = type ? ITEM_TYPE_ICONS[type] : IconPlus;
  const ActionIcon = action ? ACTION_ICONS[action] : null;
  return (
    <Box
      role="img"
      aria-label={label}
      onMouseMove={hoverable ? (event) => setPointer({ x: event.clientX, y: event.clientY }) : undefined}
      onMouseLeave={hoverable ? () => setPointer(null) : undefined}
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
            opacity: action === 'add' || action === 'missing' ? 0.45 : 1,
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
            size={Math.round(size * (action === 'edit' ? 0.4 : 0.55))}
            stroke={action === 'missing' ? 3.2 : 2.6}
            color={action === 'missing' ? '#e03131' : '#1b2a17'}
            style={{ opacity: action === 'edit' ? 0.85 : 0.75, filter: 'drop-shadow(0 0 2px #fff)' }}
          />
        </Box>
      )}
      {hoverable && pointer && (
        <PointerFloat x={pointer.x} y={pointer.y}>
          <ItemSummary item={summary} />
        </PointerFloat>
      )}
    </Box>
  );
}
