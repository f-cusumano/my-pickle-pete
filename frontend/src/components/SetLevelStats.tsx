import { Group, Text, Tooltip } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import type { ReactNode } from 'react';
import type { LevelStats } from '../api/types';
import { formatStatValue } from '../domain/format';
import { FistIcon, HeartIcon } from './LevelStatIcons';

/**
 * Danno e HP dovuti al livello di pezzi e arma, attuali e al massimo potenziale, tra parentesi accanto al nome
 * del set: stanno fuori dalla tabella delle caratteristiche, dove sarebbero sempre i valori più alti.
 */
export function SetLevelStats({ levelStats }: { levelStats: LevelStats }) {
  // Su cellulare più piccoli, per stare su una riga accanto alle frecce dell'elenco
  const compact = useMediaQuery('(max-width: 36em)', false, { getInitialValueInEffect: false });
  const iconSize = compact ? 18 : 22;
  const size = compact ? 'xs' : 'sm';
  // Se lo spazio non basta (cellulare, accanto ai tasti) il cuore va a capo, ciascuno con la sua parentesi
  return (
    <Group gap={0} style={{ rowGap: 2 }}>
      <LevelPart
        symbol={<FistIcon size={iconSize} />}
        label="Danno"
        prefix="("
        size={size}
        now={formatStatValue(levelStats.damageNow, 'PERCENT')}
        top={formatStatValue(levelStats.damageTop, 'PERCENT')}
      />
      <LevelPart
        symbol={<HeartIcon size={iconSize} />}
        label="HP"
        suffix=")"
        size={size}
        now={formatStatValue(levelStats.hpNow, 'FLAT')}
        top={formatStatValue(levelStats.hpTop, 'FLAT')}
      />
    </Group>
  );
}

interface PartProps {
  symbol: ReactNode;
  label: string;
  now: string;
  top: string;
  /** Parentesi aperta prima (la prima parte) o chiusa dopo (l'ultima). */
  prefix?: string;
  suffix?: string;
  size: 'xs' | 'sm';
}

function LevelPart({ symbol, label, now, top, prefix, suffix, size }: PartProps) {
  const description = `${label} dal livello: ${now} attuale, ${top} al massimo potenziale`;
  return (
    <Tooltip label={description} events={{ hover: true, focus: true, touch: false }}>
      <Group
        gap={4}
        wrap="nowrap"
        aria-label={description}
        mr={prefix ? 12 : 0}
        style={{ whiteSpace: 'nowrap' }}
      >
        {prefix && (
          <Text size={size} c="dimmed" mr={-2}>
            {prefix}
          </Text>
        )}
        {symbol}
        <Text size={size}>
          <Text span fw={700} inherit>
            {now}
          </Text>{' '}
          <Text span c="dimmed" inherit>
            / {top}
            {suffix}
          </Text>
        </Text>
      </Group>
    </Tooltip>
  );
}
