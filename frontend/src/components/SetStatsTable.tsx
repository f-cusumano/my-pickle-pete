import { Stack, Table, Text } from '@mantine/core';
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
  /** Colonne di larghezza fissa: le tabelle restano allineate anche nelle colonne (di default sì). */
  fixedLayout?: boolean;
}

/**
 * Tabelle delle caratteristiche di un set: valore attuale e top, con massimi (verde) e minimi (rosso) in grassetto.
 * Il contributo dell'arma scelta è tra parentesi; le caratteristiche proprie dell'arma e quelle dell'abilità
 * sono in tabelle a parte, sotto.
 */
export function SetStatsTable({
  stats,
  abilityStats = [],
  units,
  trends,
  abilityTrends,
  fixedLayout = true,
}: Props) {
  const general = stats.filter((row) => !row.own);
  const own = stats.filter((row) => row.own);
  return (
    <Stack gap="lg">
      <StatsSection
        title="Caratteristica"
        rows={general}
        labelOf={(row) => STAT_LABELS[row.stat]}
        units={units}
        trends={trends}
        fixedLayout={fixedLayout}
      />
      {own.length > 0 && (
        <StatsSection
          title="Proprie dell'arma"
          rows={own}
          labelOf={(row) => ownStatLabel(row.stat)}
          units={units}
          trends={trends}
          fixedLayout={fixedLayout}
        />
      )}
      {abilityStats.length > 0 && (
        <StatsSection
          title="Proprie dell'abilità"
          rows={abilityStats}
          labelOf={(row) => (row.own ? ownStatLabel(row.stat) : STAT_LABELS[row.stat])}
          units={units}
          trends={abilityTrends}
          fixedLayout={fixedLayout}
        />
      )}
    </Stack>
  );
}

interface SectionProps {
  title: string;
  rows: StatComparison[];
  labelOf: (row: StatComparison) => string;
  units: Record<Stat, StatUnit>;
  trends?: Map<string, StatTrend>;
  fixedLayout: boolean;
}

function StatsSection({ title, rows, labelOf, units, trends, fixedLayout }: SectionProps) {
  return (
    // Compatta: righe basse e alternate al posto delle linee, solo una linea sotto l'intestazione
    <Table
      striped
      withRowBorders={false}
      verticalSpacing={2}
      horizontalSpacing={8}
      fz="sm"
      layout={fixedLayout ? 'fixed' : undefined}
      className={classes.table}
    >
      <Table.Thead>
        <Table.Tr>
          <Table.Th w={fixedLayout ? '46%' : undefined}>{title}</Table.Th>
          <Table.Th ta="right">Attuale</Table.Th>
          <Table.Th ta="right">Top</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rows.map((row) => (
          <StatRow key={statKeyId(row)} row={row} label={labelOf(row)} units={units} trends={trends} />
        ))}
      </Table.Tbody>
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
