import { Table, Text } from '@mantine/core';
import { IconArrowDown, IconArrowUp } from '@tabler/icons-react';
import type { Highlight, Stat, StatComparison, StatUnit } from '../api/types';
import { statKeyId, unitSuffix, type StatTrend, type Trend } from '../domain/customSets';
import { formatStatValue } from '../domain/format';
import { STAT_LABELS, ownStatLabel } from '../i18n/labels';
import classes from './SetStatsTable.module.css';

const HIGHLIGHT_CLASSES: Record<Highlight, string | undefined> = {
  BEST: classes.best,
  WORST: classes.worst,
  NONE: undefined,
};

interface Props {
  stats: StatComparison[];
  /** Caratteristiche dell'abilità scelta: sezione a parte, senza evidenziazioni. */
  abilityStats?: StatComparison[];
  units: Record<Stat, StatUnit>;
  /** Frecce rispetto al set di partenza (solo in modifica). */
  trends?: Map<string, StatTrend>;
  abilityTrends?: Map<string, StatTrend>;
}

/**
 * Tabella delle caratteristiche di un set: valore attuale e top, con massimi e minimi evidenziati.
 * Il contributo dell'arma scelta è tra parentesi; le caratteristiche proprie dell'arma e quelle dell'abilità
 * stanno in fondo, ciascuna nella sua sezione.
 */
export function SetStatsTable({ stats, abilityStats = [], units, trends, abilityTrends }: Props) {
  const general = stats.filter((row) => !row.own);
  const own = stats.filter((row) => row.own);
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
        {general.map((row) => (
          <StatRow
            key={statKeyId(row)}
            row={row}
            label={STAT_LABELS[row.stat]}
            units={units}
            trends={trends}
          />
        ))}
      </Table.Tbody>
      {own.length > 0 && (
        <Table.Tbody className={classes.ownSection}>
          <Table.Tr>
            <Table.Th colSpan={3} className={classes.ownTitle}>
              Proprie dell&apos;arma
            </Table.Th>
          </Table.Tr>
          {own.map((row) => (
            <StatRow
              key={statKeyId(row)}
              row={row}
              label={ownStatLabel(row.stat)}
              units={units}
              trends={trends}
            />
          ))}
        </Table.Tbody>
      )}
      {abilityStats.length > 0 && (
        <Table.Tbody className={classes.ownSection}>
          <Table.Tr>
            <Table.Th colSpan={3} className={classes.ownTitle}>
              Proprie dell&apos;abilità
            </Table.Th>
          </Table.Tr>
          {abilityStats.map((row) => (
            <StatRow
              key={statKeyId(row)}
              row={row}
              label={row.own ? ownStatLabel(row.stat) : STAT_LABELS[row.stat]}
              units={units}
              trends={abilityTrends}
            />
          ))}
        </Table.Tbody>
      )}
    </Table>
  );
}

interface RowProps {
  row: StatComparison;
  label: string;
  units: Record<Stat, StatUnit>;
  trends?: Map<string, StatTrend>;
}

function StatRow({ row, label, units, trends }: RowProps) {
  const trend = trends?.get(statKeyId(row));
  const suffix = unitSuffix(row, units);
  return (
    <Table.Tr>
      <Table.Td>
        {label}
        {/* La stessa caratteristica nell'altra unità ha una riga sua: si indica l'unità */}
        {suffix && (
          <Text span size="xs" c="dimmed">
            {suffix}
          </Text>
        )}
      </Table.Td>
      <Table.Td ta="right" className={HIGHLIGHT_CLASSES[row.currentHighlight]}>
        <TrendArrow trend={trend?.current ?? null} />
        <span className={classes.value}>{formatStatValue(row.current, row.unit, row.stat)}</span>
        <WeaponValue value={row.weaponCurrent} unit={row.unit} />
      </Table.Td>
      <Table.Td ta="right" className={HIGHLIGHT_CLASSES[row.topHighlight]}>
        <TrendArrow trend={trend?.top ?? null} />
        <span className={classes.value}>{formatStatValue(row.top, row.unit, row.stat)}</span>
        <WeaponValue value={row.weaponTop} unit={row.unit} />
      </Table.Td>
    </Table.Tr>
  );
}

/** Contributo dell'arma tra parentesi, solo se c'è: "+12% (+4%)". */
function WeaponValue({ value, unit }: { value: number | null; unit: StatUnit }) {
  if (value === null || value === 0) {
    return null;
  }
  return (
    <span className={classes.weapon} title="Contributo dell'arma">
      {' '}
      ({formatStatValue(value, unit)})
    </span>
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
