import { Table, Text } from '@mantine/core';
import { IconArrowDown, IconArrowUp } from '@tabler/icons-react';
import type { Highlight, Stat, StatComparison, StatUnit } from '../api/types';
import { statKeyId, unitSuffix, type StatTrend, type Trend } from '../domain/customSets';
import { formatStatValue } from '../domain/format';
import { STAT_LABELS } from '../i18n/labels';
import classes from './SetStatsTable.module.css';

const HIGHLIGHT_CLASSES: Record<Highlight, string | undefined> = {
  BEST: classes.best,
  WORST: classes.worst,
  NONE: undefined,
};

interface Props {
  stats: StatComparison[];
  units: Record<Stat, StatUnit>;
  /** Frecce rispetto al set di partenza (solo in modifica). */
  trends?: Map<string, StatTrend>;
}

/** Tabella delle caratteristiche di un set: valore attuale e top, con massimi e minimi evidenziati. */
export function SetStatsTable({ stats, units, trends }: Props) {
  return (
    <Table withTableBorder withColumnBorders verticalSpacing={6} fz="sm">
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Caratteristica</Table.Th>
          <Table.Th ta="right">Attuale</Table.Th>
          <Table.Th ta="right">Top</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {stats.map((row) => {
          const trend = trends?.get(statKeyId(row));
          const suffix = unitSuffix(row, units);
          return (
            <Table.Tr key={statKeyId(row)}>
              <Table.Td>
                {STAT_LABELS[row.stat]}
                {/* La stessa caratteristica nell'altra unità ha una riga sua: si indica l'unità */}
                {suffix && (
                  <Text span size="xs" c="dimmed">
                    {suffix}
                  </Text>
                )}
              </Table.Td>
              <Table.Td ta="right" className={HIGHLIGHT_CLASSES[row.currentHighlight]}>
                <TrendArrow trend={trend?.current ?? null} />
                <span className={classes.value}>{formatStatValue(row.current, row.unit)}</span>
              </Table.Td>
              <Table.Td ta="right" className={HIGHLIGHT_CLASSES[row.topHighlight]}>
                <TrendArrow trend={trend?.top ?? null} />
                <span className={classes.value}>{formatStatValue(row.top, row.unit)}</span>
              </Table.Td>
            </Table.Tr>
          );
        })}
      </Table.Tbody>
    </Table>
  );
}

function TrendArrow({ trend }: { trend: Trend }) {
  if (trend === 'up') {
    return <IconArrowUp size={16} stroke={3} className={classes.up} aria-label="migliorato" />;
  }
  if (trend === 'down') {
    return <IconArrowDown size={16} stroke={3} className={classes.down} aria-label="peggiorato" />;
  }
  return null;
}
