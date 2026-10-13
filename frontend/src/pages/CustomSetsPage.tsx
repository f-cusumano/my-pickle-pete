import {
  Accordion,
  ActionIcon,
  Alert,
  Badge,
  Button,
  Group,
  Loader,
  Menu,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import {
  IconBolt,
  IconPencil,
  IconPlus,
  IconTargetArrow,
  IconTrash,
  IconTrendingUp,
} from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { useCustomSetCensus, useCustomSets, useGameConstants, useItems } from '../api/queries';
import type { BestSetMode, CustomSet, FullSet, GameConstants, Item, Rarity } from '../api/types';
import { BestSetModal } from '../components/BestSetModal';
import { CustomSetBonus } from '../components/CustomSetBonus';
import { CustomSetEditor, type SetDraft } from '../components/CustomSetEditor';
import { ItemModal } from '../components/ItemModal';
import { SetGearList, SetItemList } from '../components/SetItemList';
import { SetLevelStats } from '../components/SetLevelStats';
import { SetStatsTable } from '../components/SetStatsTable';
import { WeaponAdviceCard } from '../components/WeaponAdviceCard';
import { armorSlots, customizedName, fullSetAsCustomSet, weaponSpecifications } from '../domain/customSets';
import { statUnits } from '../domain/units';
import { ARMOR_SET_LABELS, BEST_SET_TITLES } from '../i18n/labels';

interface Props {
  /** Full Set da personalizzare (tasto "Personalizza" di Full Sets): si apre subito la modifica di un nuovo set. */
  customizing: FullSet | null;
  /** Il Full Set da personalizzare è stato preso in carico (non si riapre tornando sulla pagina). */
  onCustomizingOpened: () => void;
}

/** Custom Sets: set costruiti da zero, da un Full Set o partendo dalle proposte Best now / Best potential. */
export function CustomSetsPage({ customizing, onCustomizingOpened }: Props) {
  const constants = useGameConstants();
  const customSets = useCustomSets();
  const items = useItems('ARMOR_SET');

  if (constants.isPending || customSets.isPending || items.isPending) {
    return <Loader m="xl" />;
  }
  if (constants.isError || customSets.isError || items.isError) {
    return (
      <Alert color="red" title="Impossibile caricare i set">
        Il server non risponde: controlla che il backend sia avviato.
      </Alert>
    );
  }
  return (
    <CustomSetList
      constants={constants.data}
      customSets={customSets.data}
      items={items.data}
      customizing={customizing}
      onCustomizingOpened={onCustomizingOpened}
    />
  );
}

interface ListProps extends Props {
  constants: GameConstants;
  customSets: CustomSet[];
  items: Item[];
}

function CustomSetList({ constants, customSets, items, customizing, onCustomizingOpened }: ListProps) {
  const census = useCustomSetCensus();
  const units = useMemo(() => statUnits(constants), [constants]);
  const rarities = useMemo<Rarity[]>(() => constants.rarities.map((rarity) => rarity.code), [constants]);
  const slots = useMemo(() => armorSlots(constants), [constants]);
  const weaponCategories = useMemo(() => weaponSpecifications(constants), [constants]);
  const [draft, setDraft] = useState<SetDraft | null>(() =>
    customizing
      ? { id: null, name: customizedName(customizing.armorSet), original: fullSetAsCustomSet(customizing) }
      : null,
  );
  useEffect(() => {
    if (customizing) {
      onCustomizingOpened();
    }
  }, [customizing, onCustomizingOpened]);
  const [bestMode, setBestMode] = useState<BestSetMode | null>(null);
  const [openedId, setOpenedId] = useState<number | null>(null);
  // L'item aperto si rilegge dagli item aggiornati, così la modale segue rarità e livello
  const opened = items.find((item) => item.id === openedId) ?? null;

  const confirmDelete = (set: CustomSet) =>
    modals.openConfirmModal({
      title: 'Elimina set',
      children: `Il set "${set.name ?? ''}" verrà eliminato; i suoi item restano nell'inventario.`,
      labels: { confirm: 'Elimina', cancel: 'Annulla' },
      confirmProps: { color: 'red' },
      onConfirm: () => set.id !== null && census.remove.mutate(set.id),
    });

  return (
    <>
      <Group justify="space-between" mb="md">
        <Title order={2}>Custom Sets</Title>
        <Menu position="bottom-end" withinPortal>
          <Menu.Target>
            <Button leftSection={<IconPlus size={18} />}>Nuovo set</Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              leftSection={<IconTargetArrow size={18} />}
              onClick={() => setDraft({ id: null, name: '', original: null })}
            >
              Da zero
            </Menu.Item>
            <Menu.Item leftSection={<IconBolt size={18} />} onClick={() => setBestMode('now')}>
              {BEST_SET_TITLES.now}
            </Menu.Item>
            <Menu.Item leftSection={<IconTrendingUp size={18} />} onClick={() => setBestMode('potential')}>
              {BEST_SET_TITLES.potential}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      {customSets.length === 0 ? (
        <Paper withBorder p="lg" radius="md">
          <Text c="dimmed">
            Nessun set custom. Con &quot;Nuovo set&quot; puoi costruirne uno da zero oppure partire dai set
            migliori con le caratteristiche attuali (Best now) o al massimo potenziale (Best potential).
          </Text>
        </Paper>
      ) : (
        <Accordion multiple variant="separated" radius="md" chevronPosition="right">
          {customSets.map((set) => (
            <Accordion.Item key={set.id} value={String(set.id)}>
              <Group wrap="nowrap" gap={0} pr="sm">
                <Accordion.Control>
                  {/* Su cellulare i badge vanno a capo sotto il nome invece di troncarsi */}
                  <Group justify="space-between" gap="xs" pr="xs">
                    <Group gap="lg" style={{ rowGap: 2 }}>
                      <Text fw={700} size="lg" ff="heading" style={{ overflowWrap: 'anywhere' }}>
                        {set.name}
                      </Text>
                      <SetLevelStats levelStats={set.levelStats} />
                    </Group>
                    <Group gap={6} wrap="nowrap">
                      {set.bonusArmorSet && (
                        <Badge variant="light" color="pickle">
                          {ARMOR_SET_LABELS[set.bonusArmorSet]}
                        </Badge>
                      )}
                      <Badge variant="light" color="gray">
                        {set.pieces.length}/{slots.length} pezzi
                      </Badge>
                    </Group>
                  </Group>
                </Accordion.Control>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="lg"
                  onClick={() => confirmDelete(set)}
                  aria-label={`Elimina ${set.name ?? ''}`}
                >
                  <IconTrash size={18} />
                </ActionIcon>
              </Group>
              <Accordion.Panel>
                <Stack gap="md">
                  <Group justify="flex-end">
                    <Button
                      variant="light"
                      leftSection={<IconPencil size={18} />}
                      onClick={() => setDraft({ id: set.id, name: set.name ?? '', original: set })}
                    >
                      Modifica
                    </Button>
                  </Group>
                  <CustomSetBonus set={set} threshold={constants.armorSetBonusThreshold} />
                  <SetItemList slots={slots} pieces={set.pieces} onPiece={(piece) => setOpenedId(piece.id)} />
                  <WeaponAdviceCard advice={set.weaponAdvice} />
                  <SetGearList
                    weapon={set.weapon}
                    ability={set.ability}
                    onClick={(_kind, item) => setOpenedId(item?.id ?? null)}
                  />
                  <SetStatsTable stats={set.stats} abilityStats={set.abilityStats} units={units} />
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      )}

      <ItemModal item={opened} rarities={rarities} units={units} onClose={() => setOpenedId(null)} />
      {bestMode && (
        <BestSetModal
          mode={bestMode}
          constants={constants}
          items={items}
          slots={slots}
          units={units}
          onClose={() => setBestMode(null)}
          onChoose={(proposal, name) => {
            setBestMode(null);
            setDraft({ id: null, name, original: proposal });
          }}
        />
      )}
      {draft && (
        <CustomSetEditor
          key={`${String(draft.id)}-${draft.name}`}
          draft={draft}
          items={items}
          slots={slots}
          weaponCategories={weaponCategories}
          units={units}
          threshold={constants.armorSetBonusThreshold}
          onClose={() => setDraft(null)}
        />
      )}
    </>
  );
}
