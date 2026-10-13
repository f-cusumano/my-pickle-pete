import { Paper, Portal, Table, Text } from '@mantine/core';
import { useLayoutEffect, useRef } from 'react';
import type { Stat, StatUnit } from '../api/types';
import { statKeyId, unitSuffix, type StatDelta } from '../domain/customSets';
import { formatStatValue } from '../domain/format';
import { STAT_LABELS, ownStatLabel } from '../i18n/labels';

/** Distanza dal puntatore, perché la freccia del mouse non copra la tabella. */
const OFFSET = 10;
/** Margine minimo dal bordo della finestra. */
const MARGIN = 8;

interface Props {
  deltas: StatDelta[];
  units: Record<Stat, StatUnit>;
  /** Posizione del puntatore nella finestra. */
  x: number;
  y: number;
}

/**
 * Mini-tabella che segue il puntatore con le caratteristiche che cambierebbero scegliendo il candidato:
 * in verde i miglioramenti, in rosso i peggioramenti. L'angolo in alto a sinistra sta sul puntatore;
 * vicino ai bordi della finestra la tabella passa dall'altra parte, per restare visibile.
 */
export function SwapPreview({ deltas, units, x, y }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  // La posizione dipende dalle dimensioni della tabella: si calcola dopo averla disegnata
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const { offsetWidth: width, offsetHeight: height } = element;
    let left = x + OFFSET;
    if (left + width > window.innerWidth - MARGIN) {
      left = Math.max(MARGIN, x - OFFSET - width);
    }
    let top = y + OFFSET;
    if (top + height > window.innerHeight - MARGIN) {
      top = Math.max(MARGIN, y - OFFSET - height);
    }
    element.style.left = `${String(left)}px`;
    element.style.top = `${String(top)}px`;
  });
  return (
    <Portal>
      <Paper
        ref={ref}
        withBorder
        shadow="md"
        radius="md"
        p={6}
        role="tooltip"
        style={{ position: 'fixed', left: x + OFFSET, top: y + OFFSET, zIndex: 1000, pointerEvents: 'none' }}
      >
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
      </Paper>
    </Portal>
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
