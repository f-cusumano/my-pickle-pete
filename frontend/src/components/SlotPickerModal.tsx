import { Badge, Group, Modal, Stack, Text, UnstyledButton } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import type { Item, Specification } from '../api/types';
import { abilityCandidates, slotCandidates, weaponCandidates } from '../domain/customSets';
import { formatLevel } from '../domain/format';
import { thumbnailOf } from '../domain/itemImages';
import { useFullScreenModal } from '../hooks/useFullScreenModal';
import { ARMOR_SET_LABELS, SPECIFICATION_LABELS } from '../i18n/labels';
import { ItemThumbnail } from './ItemThumbnail';
import { RarityBadge } from './RarityBadge';

/** Slot da riempire: uno slot di armatura, l'arma o l'abilità del set. */
export type PickerSlot = Specification | 'WEAPON' | 'ABILITY';

/** Testi di arma e abilità: titolo, scelta "nessuna" ed elenco vuoto. */
const GEAR_TEXTS = {
  WEAPON: {
    title: "Scegli l'arma",
    none: 'Nessuna arma',
    empty: 'Nessuna arma censita: aggiungila dal Censimento.',
  },
  ABILITY: {
    title: "Scegli l'abilità",
    none: 'Nessuna abilità',
    empty: 'Nessuna abilità censita: aggiungila dal Censimento.',
  },
};

interface Props {
  slot: PickerSlot | null;
  items: Item[];
  /** Categorie di arma nell'ordine del gioco (per ordinare le armi). */
  weaponCategories: Specification[];
  selectedId: number | null;
  onPick: (item: Item | null) => void;
  onClose: () => void;
}

/**
 * Scelta del pezzo di uno slot tra le armature censite, per rarità decrescente e poi per nome;
 * per l'arma, tra le armi censite per categoria; per l'abilità, tra le abilità censite.
 */
export function SlotPickerModal({ slot, items, weaponCategories, selectedId, onPick, onClose }: Props) {
  const fullScreen = useFullScreenModal();
  const weapon = slot === 'WEAPON';
  const gear = slot === 'WEAPON' || slot === 'ABILITY' ? GEAR_TEXTS[slot] : null;
  let candidates: Item[] = [];
  if (slot === 'WEAPON') {
    candidates = weaponCandidates(items, weaponCategories);
  } else if (slot === 'ABILITY') {
    candidates = abilityCandidates(items);
  } else if (slot) {
    candidates = slotCandidates(items, slot);
  }
  let title = '';
  if (slot) {
    title = gear ? gear.title : `Scegli ${SPECIFICATION_LABELS[slot as Specification].toLowerCase()}`;
  }
  return (
    <Modal
      opened={slot !== null}
      onClose={onClose}
      title={title}
      fullScreen={fullScreen}
      centered={!fullScreen}
      zIndex={300}
    >
      <Stack gap={6}>
        {selectedId !== null && (
          <UnstyledButton onClick={() => onPick(null)} p="xs" style={{ borderRadius: 8 }}>
            <Group gap="sm" wrap="nowrap">
              <IconX size={20} />
              <Text>{gear ? gear.none : 'Lascia lo slot vuoto'}</Text>
            </Group>
          </UnstyledButton>
        )}
        {candidates.length === 0 && (
          <Text c="dimmed" size="sm">
            {gear
              ? gear.empty
              : 'Nessun pezzo censito per questo slot: aggiungilo dal Censimento o da Full Sets.'}
          </Text>
        )}
        {candidates.map((candidate) => {
          const selected = candidate.id === selectedId;
          return (
            <UnstyledButton
              key={candidate.id}
              onClick={() => onPick(candidate)}
              p="xs"
              aria-pressed={selected}
              style={{
                borderRadius: 8,
                background: selected ? 'var(--mantine-color-pickle-0)' : undefined,
                outline: selected ? '2px solid var(--mantine-color-pickle-5)' : undefined,
              }}
            >
              <Group gap="sm" wrap="nowrap">
                <ItemThumbnail {...thumbnailOf(candidate)} size={48} />
                <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                  <Text fw={700} truncate>
                    {candidate.name}
                  </Text>
                  <Group gap={6}>
                    <RarityBadge rarity={candidate.rarity} />
                    <Text size="xs" c="dimmed">
                      {formatLevel(candidate.level, candidate.maxLevel)}
                    </Text>
                  </Group>
                </Stack>
                {candidate.armorSet && (
                  <Badge variant="light" color="gray">
                    {ARMOR_SET_LABELS[candidate.armorSet]}
                  </Badge>
                )}
                {weapon && candidate.specification && (
                  <Badge variant="light" color="orange">
                    {SPECIFICATION_LABELS[candidate.specification]}
                  </Badge>
                )}
              </Group>
            </UnstyledButton>
          );
        })}
      </Stack>
    </Modal>
  );
}
