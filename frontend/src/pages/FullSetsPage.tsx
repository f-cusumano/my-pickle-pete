import {
  Accordion,
  Alert,
  Badge,
  Group,
  Loader,
  Paper,
  Stack,
  Table,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { IconSparkles } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useFullSets, useGameConstants } from '../api/queries';
import type { FullSet, GameConstants, Highlight, Specification, Stat, StatUnit } from '../api/types';
import { ItemThumbnail } from '../components/ItemThumbnail';
import { SPECIFICATION_ICONS } from '../components/icons';
import { formatLevel, formatStatValue } from '../domain/format';
import { statUnits } from '../domain/units';
import { ARMOR_SET_LABELS, SPECIFICATION_LABELS, STAT_LABELS } from '../i18n/labels';
import classes from './FullSetsPage.module.css';

const HIGHLIGHT_CLASSES: Record<Highlight, string | undefined> = {
  BEST: classes.best,
  WORST: classes.worst,
  NONE: undefined,
};

/** Set completi: righe espandibili (anche più di una) con bonus, pezzi e confronto attuale/top delle caratteristiche. */
export function FullSetsPage() {
  const constants = useGameConstants();
  const fullSets = useFullSets();

  if (constants.isPending || fullSets.isPending) {
    return <Loader m="xl" />;
  }
  if (constants.isError || fullSets.isError) {
    return (
      <Alert color="red" title="Impossibile caricare i set">
        Il server non risponde: controlla che il backend sia avviato.
      </Alert>
    );
  }
  return <FullSetList constants={constants.data} fullSets={fullSets.data} />;
}

function FullSetList({ constants, fullSets }: { constants: GameConstants; fullSets: FullSet[] }) {
  const units = useMemo(() => statUnits(constants), [constants]);
  const slots = useMemo(
    () => constants.specifications.filter((spec) => spec.itemType === 'ARMOR').map((spec) => spec.code),
    [constants],
  );
  return (
    <>
      <Title order={2} mb="md">
        Full Sets
      </Title>
      <Accordion multiple variant="separated" radius="md" chevronPosition="right">
        {fullSets.map((fullSet) => (
          <Accordion.Item key={fullSet.armorSet} value={fullSet.armorSet}>
            <Accordion.Control>
              <Group justify="space-between" wrap="nowrap" pr="xs">
                <Text fw={700} size="lg" ff="heading">
                  {ARMOR_SET_LABELS[fullSet.armorSet]}
                </Text>
                <Badge variant="light" color={fullSet.pieces.length === slots.length ? 'pickle' : 'gray'}>
                  {fullSet.pieces.length}/{slots.length} pezzi
                </Badge>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <FullSetDetail
                fullSet={fullSet}
                slots={slots}
                units={units}
                threshold={constants.armorSetBonusThreshold}
              />
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </>
  );
}

interface DetailProps {
  fullSet: FullSet;
  slots: Specification[];
  units: Record<Stat, StatUnit>;
  threshold: number;
}

function FullSetDetail({ fullSet, slots, units, threshold }: DetailProps) {
  return (
    <Stack gap="md">
      <Paper withBorder p="sm" radius="md" bg={fullSet.bonusActive ? 'pickle.0' : 'gray.0'}>
        <Group gap="xs" mb={4}>
          <IconSparkles size={18} />
          <Text fw={700}>Bonus del set ({threshold} pezzi su 5)</Text>
          <Badge size="sm" color={fullSet.bonusActive ? 'pickle' : 'gray'}>
            {fullSet.bonusActive ? 'Attivo' : 'Non attivo'}
          </Badge>
        </Group>
        <Text size="sm" c={fullSet.bonusDescription ? undefined : 'dimmed'}>
          {fullSet.bonusDescription ?? 'Effetto non ancora censito.'}
        </Text>
      </Paper>

      <div className={classes.pieces}>
        {slots.map((slot) => {
          const piece = fullSet.pieces.find((item) => item.specification === slot);
          const SlotIcon = SPECIFICATION_ICONS[slot];
          return (
            <div key={slot} className={classes.piece}>
              {piece ? (
                <Tooltip label={piece.name} events={{ hover: true, focus: true, touch: true }}>
                  <div>
                    <ItemThumbnail item={piece} size={64} />
                  </div>
                </Tooltip>
              ) : (
                <Tooltip
                  label={`${SPECIFICATION_LABELS[slot]}: non censito`}
                  events={{ hover: true, focus: true, touch: true }}
                >
                  <div className={classes.missing}>
                    <SlotIcon size={26} />
                  </div>
                </Tooltip>
              )}
              <Text size="xs" fw={700}>
                {piece ? formatLevel(piece.level, piece.maxLevel) : '-'}
              </Text>
            </div>
          );
        })}
      </div>

      <Table withTableBorder withColumnBorders verticalSpacing={6} fz="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Caratteristica</Table.Th>
            <Table.Th ta="right">Attuale</Table.Th>
            <Table.Th ta="right">Top</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {fullSet.stats.map((row) => (
            <Table.Tr key={row.stat}>
              <Table.Td>{STAT_LABELS[row.stat]}</Table.Td>
              <Table.Td ta="right" className={HIGHLIGHT_CLASSES[row.currentHighlight]}>
                {formatStatValue(row.current, units[row.stat])}
              </Table.Td>
              <Table.Td ta="right" className={HIGHLIGHT_CLASSES[row.topHighlight]}>
                {formatStatValue(row.top, units[row.stat])}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Stack>
  );
}
