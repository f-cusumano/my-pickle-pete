import { Group, Stack, Text, Tooltip } from '@mantine/core';
import type { ReactNode } from 'react';
import type { LevelStats } from '../api/types';
import { formatStatValue } from '../domain/format';
import { FistIcon, HeartIcon } from './LevelStatIcons';

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
        symbol={<FistIcon />}
        label="Danno"
        now={formatStatValue(levelStats.damageNow, 'PERCENT')}
        top={formatStatValue(levelStats.damageTop, 'PERCENT')}
      />
      <LevelLine
        symbol={<HeartIcon />}
        label="HP"
        now={formatStatValue(levelStats.hpNow, 'FLAT')}
        top={formatStatValue(levelStats.hpTop, 'FLAT')}
      />
    </Stack>
  );
}

interface LineProps {
  symbol: ReactNode;
  label: string;
  now: string;
  top: string;
}

function LevelLine({ symbol, label, now, top }: LineProps) {
  const description = `${label} dal livello: ${now} attuale, ${top} al massimo potenziale`;
  return (
    <Tooltip label={description} events={{ hover: true, focus: true, touch: false }}>
      <Group gap={6} wrap="nowrap" aria-label={description}>
        {symbol}
        <Text size="sm" style={{ whiteSpace: 'nowrap' }}>
          <Text span fw={700}>
            {now}
          </Text>{' '}
          <Text span c="dimmed">
            / {top}
          </Text>
        </Text>
      </Group>
    </Tooltip>
  );
}
