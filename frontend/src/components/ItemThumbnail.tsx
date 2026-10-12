import { Box } from '@mantine/core';
import { imageUrl } from '../api/client';
import type { Item } from '../api/types';
import { ITEM_TYPE_ICONS, SPECIFICATION_ICONS } from './icons';
import { RARITY_COLORS } from '../domain/rarityColors';

interface Props {
  item: Pick<Item, 'id' | 'imageVersion' | 'rarity' | 'type' | 'specification' | 'name'>;
  size?: number;
}

/** Immagine dell'item nella cornice del colore della sua rarità effettiva; senza immagine, il simbolo della specifica. */
export function ItemThumbnail({ item, size = 44 }: Props) {
  const url = imageUrl(item);
  const FallbackIcon = item.specification
    ? SPECIFICATION_ICONS[item.specification]
    : ITEM_TYPE_ICONS[item.type];
  return (
    <Box
      style={{
        width: size,
        height: size,
        flex: `0 0 ${String(size)}px`,
        borderRadius: Math.round(size / 5),
        border: '2px solid #111',
        boxShadow: `inset 0 0 0 ${String(Math.max(3, Math.round(size / 14)))}px ${RARITY_COLORS[item.rarity]}`,
        background: '#fffdf4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {url ? (
        <img
          src={url}
          alt={item.name}
          loading="lazy"
          style={{ width: '78%', height: '78%', objectFit: 'contain' }}
        />
      ) : (
        <FallbackIcon size={Math.round(size * 0.5)} stroke={1.6} color="#555" aria-label={item.name} />
      )}
    </Box>
  );
}
