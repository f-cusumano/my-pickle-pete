import { Alert, Button, Group, Modal, Paper, Select, Stack, Text, Title } from '@mantine/core';
import { IconCalculator, IconPencil } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useBestSets } from '../api/queries';
import type {
  BestSetMode,
  CustomSet,
  GameConstants,
  Item,
  Specification,
  Stat,
  StatKey,
  StatUnit,
} from '../api/types';
import { statKeyId, statKeyLabel, statKeyOptions } from '../domain/customSets';
import { formatStatValue } from '../domain/format';
import { useFullScreenModal } from '../hooks/useFullScreenModal';
import { BEST_SET_TITLES } from '../i18n/labels';
import { CustomSetBonus } from './CustomSetBonus';
import { SetItemList } from './SetItemList';
import { SetLevelStats } from './SetLevelStats';

const BEST_SET_DESCRIPTIONS: Record<BestSetMode, string> = {
  now: 'I set migliori con rarità e livello attuali degli item.',
  potential: 'I set migliori con gli item a rarità e livello massimi.',
};

interface Props {
  mode: BestSetMode;
  constants: GameConstants;
  items: Item[];
  slots: Specification[];
  units: Record<Stat, StatUnit>;
  onChoose: (proposal: CustomSet, name: string) => void;
  onClose: () => void;
}

/** Best now / Best potential: caratteristica principale (obbligatoria) e secondaria (spareggio), poi fino a 3 proposte. */
export function BestSetModal({ mode, constants, items, slots, units, onChoose, onClose }: Props) {
  const fullScreen = useFullScreenModal();
  const best = useBestSets();
  const options = useMemo(() => statKeyOptions(constants, items), [constants, items]);
  const byId = useMemo(() => new Map(options.map((key) => [statKeyId(key), key])), [options]);
  const [primaryId, setPrimaryId] = useState<string | null>(null);
  const [secondaryId, setSecondaryId] = useState<string | null>(null);
  const primary = primaryId ? (byId.get(primaryId) ?? null) : null;
  const secondary = secondaryId ? (byId.get(secondaryId) ?? null) : null;
  const data = options.map((key) => ({ value: statKeyId(key), label: statKeyLabel(key, units) }));

  const calculate = () => {
    if (primary) {
      best.mutate({ mode, request: { primary, secondary } });
    }
  };
  // Il valore che conta: attuale per Best now, top per Best potential
  const valueOf = (proposal: CustomSet, key: StatKey) => {
    const row = proposal.stats.find((stat) => statKeyId(stat) === statKeyId(key));
    const value = row ? (mode === 'now' ? row.current : row.top) : 0;
    return formatStatValue(value, key.unit);
  };

  return (
    <Modal
      opened
      onClose={onClose}
      title={BEST_SET_TITLES[mode]}
      size="lg"
      fullScreen={fullScreen}
      centered={!fullScreen}
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {BEST_SET_DESCRIPTIONS[mode]} La caratteristica secondaria decide a parità di principale.
        </Text>
        <Select
          label="Caratteristica principale"
          withAsterisk
          searchable
          data={data}
          value={primaryId}
          onChange={(value) => {
            setPrimaryId(value);
            if (value === secondaryId) setSecondaryId(null);
            best.reset();
          }}
        />
        <Select
          label="Caratteristica secondaria"
          searchable
          clearable
          data={data.filter((option) => option.value !== primaryId)}
          value={secondaryId}
          onChange={(value) => {
            setSecondaryId(value);
            best.reset();
          }}
        />
        <Group justify="flex-end">
          <Button
            leftSection={<IconCalculator size={18} />}
            disabled={!primary}
            loading={best.isPending}
            onClick={calculate}
          >
            Calcola
          </Button>
        </Group>

        {best.data?.length === 0 && (
          <Alert color="gray">Nessuna armatura censita: aggiungine dal Censimento o da Full Sets.</Alert>
        )}
        {primary &&
          best.data?.map((proposal, index) => (
            <Paper key={proposal.pieces.map((piece) => piece.id).join('-')} withBorder p="sm" radius="md">
              <Stack gap="sm">
                <Group justify="space-between" wrap="nowrap" align="flex-start">
                  <div>
                    <Group gap="lg" style={{ rowGap: 2 }}>
                      <Title order={4}>Proposta {index + 1}</Title>
                      <SetLevelStats levelStats={proposal.levelStats} />
                    </Group>
                    <Text size="sm">
                      {statKeyLabel(primary, units)} <b>{valueOf(proposal, primary)}</b>
                      {secondary && (
                        <>
                          {' · '}
                          {statKeyLabel(secondary, units)} <b>{valueOf(proposal, secondary)}</b>
                        </>
                      )}
                    </Text>
                  </div>
                  <Button
                    size="xs"
                    variant="light"
                    leftSection={<IconPencil size={16} />}
                    onClick={() =>
                      onChoose(proposal, `${BEST_SET_TITLES[mode]} ${statKeyLabel(primary, units)}`)
                    }
                  >
                    Scegli
                  </Button>
                </Group>
                <CustomSetBonus set={proposal} threshold={constants.armorSetBonusThreshold} />
                <SetItemList slots={slots} pieces={proposal.pieces} />
              </Stack>
            </Paper>
          ))}
      </Stack>
    </Modal>
  );
}
