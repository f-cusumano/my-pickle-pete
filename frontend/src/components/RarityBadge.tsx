import { Box } from '@mantine/core';
import type { Rarity } from '../api/types';
import { RARITY_LABELS } from '../i18n/labels';
import { RARITY_COLORS } from '../domain/rarityColors';

interface Props {
  rarity: Rarity;
  dimmed?: boolean;
}

/** Etichetta della rarità con bordatura nera e riempimento colorato. */
export function RarityBadge({ rarity, dimmed = false }: Props) {
  return (
    <Box
      component="span"
      style={{
        display: 'inline-block',
        minWidth: 104,
        padding: '2px 10px',
        borderRadius: 999,
        border: '2px solid #111',
        background: RARITY_COLORS[rarity],
        color: rarity === 'COMMON' ? '#111' : '#fff',
        textShadow: rarity === 'COMMON' ? 'none' : '0 1px 0 #111, 0 0 2px #111',
        fontFamily: '"Lilita One", Nunito, sans-serif',
        fontSize: 14,
        textAlign: 'center',
        whiteSpace: 'nowrap',
        opacity: dimmed ? 0.35 : 1,
        filter: dimmed ? 'grayscale(0.8)' : 'none',
      }}
    >
      {RARITY_LABELS[rarity]}
    </Box>
  );
}
