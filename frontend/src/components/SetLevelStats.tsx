import { Stack, Text, Tooltip } from '@mantine/core';
import type { LevelStats } from '../api/types';
import { formatStatValue } from '../domain/format';

/**
 * Danno e HP dovuti al livello di pezzi e arma, attuali e al massimo potenziale: stanno fuori dalla tabella
 * delle caratteristiche, dove sarebbero sempre i valori più alti.
 */
export function SetLevelStats({ levelStats }: { levelStats: LevelStats }) {
  return (
    <Stack gap={2}>
      <Text size="xs" c="dimmed" fw={700} tt="uppercase">
        Dal livello
      </Text>
      <LevelLine
        symbol="👊"
        label="Danno"
        now={formatStatValue(levelStats.damageNow, 'PERCENT')}
        top={formatStatValue(levelStats.damageTop, 'PERCENT')}
      />
      <LevelLine
        symbol="❤️"
        label="HP"
        now={formatStatValue(levelStats.hpNow, 'FLAT')}
        top={formatStatValue(levelStats.hpTop, 'FLAT')}
      />
    </Stack>
  );
}

interface LineProps {
  symbol: string;
  label: string;
  now: string;
  top: string;
}

function LevelLine({ symbol, label, now, top }: LineProps) {
  const description = `${label} dal livello: ${now} attuale, ${top} al massimo potenziale`;
  return (
    <Tooltip label={description} events={{ hover: true, focus: true, touch: false }}>
      <Text size="sm" aria-label={description} style={{ whiteSpace: 'nowrap' }}>
        <span aria-hidden="true">{symbol}</span>{' '}
        <Text span fw={700}>
          {now}
        </Text>{' '}
        <Text span c="dimmed">
          / {top}
        </Text>
      </Text>
    </Tooltip>
  );
}
