import { Accordion, Alert, Badge, Button, Group, Loader, Stack, Text, Title } from '@mantine/core';
import { IconAdjustments } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useFullSets, useGameConstants } from '../api/queries';
import type { ArmorSet, FullSet, GameConstants, Rarity, Specification, Stat, StatUnit } from '../api/types';
import { ItemFormModal } from '../components/ItemFormModal';
import { ItemModal } from '../components/ItemModal';
import { SetBonusCard } from '../components/SetBonusCard';
import { SetDetailColumns } from '../components/SetDetailColumns';
import { SetItemList } from '../components/SetItemList';
import { missingPieceName } from '../domain/itemForm';
import { SetLevelStats } from '../components/SetLevelStats';
import { SetStatsTable } from '../components/SetStatsTable';
import { WeaponAdviceCard } from '../components/WeaponAdviceCard';
import { armorSlots } from '../domain/customSets';
import { statUnits } from '../domain/units';
import { ARMOR_SET_LABELS, SPECIFICATION_LABELS } from '../i18n/labels';

/** Set completi: righe espandibili (anche più di una) con bonus, pezzi e confronto attuale/top delle caratteristiche. */
export function FullSetsPage({ onCustomize }: { onCustomize: (fullSet: FullSet) => void }) {
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
  return <FullSetList constants={constants.data} fullSets={fullSets.data} onCustomize={onCustomize} />;
}

/** Pezzo mancante da censire: set e slot già scelti nel modulo. */
interface MissingSlot {
  armorSet: ArmorSet;
  slot: Specification;
}

interface ListProps {
  constants: GameConstants;
  fullSets: FullSet[];
  onCustomize: (fullSet: FullSet) => void;
}

function FullSetList({ constants, fullSets, onCustomize }: ListProps) {
  const units = useMemo(() => statUnits(constants), [constants]);
  const rarities = useMemo<Rarity[]>(() => constants.rarities.map((rarity) => rarity.code), [constants]);
  const [openedId, setOpenedId] = useState<number | null>(null);
  const [adding, setAdding] = useState<MissingSlot | null>(null);
  // L'item aperto si rilegge dai set aggiornati, così la modale segue rarità e livello
  const opened = fullSets.flatMap((fullSet) => fullSet.pieces).find((piece) => piece.id === openedId) ?? null;
  const slots = useMemo(() => armorSlots(constants), [constants]);
  return (
    <>
      <Title order={2} mb="md">
        Full Sets
      </Title>
      <Accordion multiple variant="separated" radius="md" chevronPosition="right">
        {fullSets.map((fullSet) => (
          <Accordion.Item key={fullSet.armorSet} value={fullSet.armorSet}>
            <Accordion.Control>
              {/* Su cellulare il badge va a capo sotto il nome invece di troncarsi */}
              <Group justify="space-between" gap="xs" pr="xs">
                <Group gap="lg" style={{ rowGap: 2 }}>
                  <Text fw={700} size="lg" ff="heading">
                    {ARMOR_SET_LABELS[fullSet.armorSet]}
                  </Text>
                  <SetLevelStats levelStats={fullSet.levelStats} />
                </Group>
                <Badge
                  variant="light"
                  color={fullSet.pieces.length === slots.length ? 'pickle' : 'gray'}
                  style={{ flexShrink: 0 }}
                >
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
                onOpen={setOpenedId}
                onAdd={(slot) => setAdding({ armorSet: fullSet.armorSet, slot })}
                onCustomize={() => onCustomize(fullSet)}
              />
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
      <ItemModal item={opened} rarities={rarities} units={units} onClose={() => setOpenedId(null)} />
      {adding && (
        <ItemFormModal
          constants={constants}
          item={null}
          preset={{
            name: missingPieceName(adding.slot, adding.armorSet),
            type: 'ARMOR',
            specification: adding.slot,
            armorSet: adding.armorSet,
          }}
          onClose={() => setAdding(null)}
        />
      )}
    </>
  );
}

interface DetailProps {
  fullSet: FullSet;
  slots: Specification[];
  units: Record<Stat, StatUnit>;
  threshold: number;
  onOpen: (itemId: number) => void;
  onAdd: (slot: Specification) => void;
  onCustomize: () => void;
}

function FullSetDetail({ fullSet, slots, units, threshold, onOpen, onAdd, onCustomize }: DetailProps) {
  return (
    <Stack gap="md">
      <Group justify="flex-end">
        <Button
          variant="light"
          leftSection={<IconAdjustments size={18} />}
          onClick={onCustomize}
          disabled={fullSet.pieces.length === 0}
        >
          Personalizza
        </Button>
      </Group>
      <SetBonusCard
        title={`Bonus del set (${String(threshold)} pezzi su 5)`}
        active={fullSet.bonusActive}
        description={fullSet.bonusDescription}
      />
      <SetDetailColumns
        left={
          <>
            <SetItemList
              slots={slots}
              pieces={fullSet.pieces}
              onPiece={(piece) => onOpen(piece.id)}
              onEmpty={onAdd}
              emptyLabel={(slot) =>
                `Aggiungi ${SPECIFICATION_LABELS[slot]} ${ARMOR_SET_LABELS[fullSet.armorSet]}`
              }
            />
            <WeaponAdviceCard advice={fullSet.weaponAdvice} />
          </>
        }
        right={<SetStatsTable stats={fullSet.stats} units={units} />}
      />
    </Stack>
  );
}
