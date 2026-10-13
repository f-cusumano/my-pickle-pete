import { Table, Text } from '@mantine/core';
import type { Stat, StatUnit } from '../api/types';
import { statKeyId, unitSuffix, type StatDelta } from '../domain/customSets';
import { formatStatValue } from '../domain/format';
import { STAT_LABELS, ownStatLabel } from '../i18n/labels';
import { PointerFloat } from './PointerFloat';

interface Props {
  deltas: StatDelta[];
  units: Record<Stat, StatUnit>;
  /** Posizione del puntatore nella finestra. */
  x: number;
  y: number;
  /** Tocco prolungato: la tabella va sopra il dito (o sotto, se sopra non c'è posto), centrata sul tocco. */
  touch?: boolean;
}

/**
 * Mini-tabella che segue il puntatore con le caratteristiche che cambierebbero scegliendo il candidato:
 * in verde i miglioramenti, in rosso i peggioramenti.
 */
export function SwapPreview({ deltas, units, x, y, touch = false }: Props) {
  return (
    <PointerFloat x={x} y={y} touch={touch}>
      {deltas.length === 0 ? (
        <Text size="sm" px={4}>
          Nessuna variazione
        </Text>
      ) : (
        <Table verticalSpacing={2} horizontalSpacing={8} fz="xs" withRowBorders={false}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th />
              <Table.Th ta="right">Attuale</Table.Th>
              <Table.Th ta="right">Top</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {deltas.map((delta) => (
              <Table.Tr key={statKeyId(delta)}>
                <Table.Td>
                  {delta.own ? ownStatLabel(delta.stat) : STAT_LABELS[delta.stat]}
                  {unitSuffix(delta, units)}
                </Table.Td>
                <DeltaCell value={delta.current} delta={delta} />
                <DeltaCell value={delta.top} delta={delta} />
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </PointerFloat>
  );
}

/** Valore della variazione: verde se migliora, rosso se peggiora, grigio se resta uguale. */
function DeltaCell({ value, delta }: { value: number; delta: StatDelta }) {
  let color = 'dimmed';
  if (value > 0) color = 'green.8';
  if (value < 0) color = 'red.7';
  return (
    <Table.Td ta="right">
      <Text span size="xs" fw={700} c={color} style={{ whiteSpace: 'nowrap' }}>
        {formatStatValue(value, delta.unit, delta.stat)}
      </Text>
    </Table.Td>
  );
}
