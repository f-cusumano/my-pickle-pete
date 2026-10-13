import { Badge, Group, Modal, Stack, Text, UnstyledButton } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconX } from '@tabler/icons-react';
import { useState } from 'react';
import { useGameConstants } from '../api/queries';
import type { Item, Specification } from '../api/types';
import { abilityCandidates, slotCandidates, swapPreview, weaponCandidates } from '../domain/customSets';
import { formatLevel } from '../domain/format';
import { thumbnailOf } from '../domain/itemImages';
import { statUnits } from '../domain/units';
import { useFullScreenModal } from '../hooks/useFullScreenModal';
import { useLongPress } from '../hooks/useLongPress';
import { ARMOR_SET_LABELS, SPECIFICATION_LABELS } from '../i18n/labels';
import { ItemThumbnail } from './ItemThumbnail';
import { RarityBadge } from './RarityBadge';
import { SwapPreview } from './SwapPreview';

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
  /** Item già nello slot, null se è vuoto. */
  selected: Item | null;
  onPick: (item: Item | null) => void;
  onClose: () => void;
}

/**
 * Scelta del pezzo di uno slot tra le armature censite, per rarità decrescente e poi per nome;
 * per l'arma, tra le armi censite per categoria; per l'abilità, tra le abilità censite.
 * Passando col mouse su un candidato, o tenendoci il dito sopra, si vedono le caratteristiche che cambierebbero
 * scegliendolo.
 */
export function SlotPickerModal({ slot, items, weaponCategories, selected, onPick, onClose }: Props) {
  const fullScreen = useFullScreenModal();
  const constants = useGameConstants();
  // Solo con un puntatore che passa sopra gli elementi (no touch)
  const canHover = useMediaQuery('(hover: hover) and (pointer: fine)');
  const [hovered, setHovered] = useState<{ item: Item; x: number; y: number; touch: boolean } | null>(null);
  const longPress = useLongPress<Item>(
    (item, x, y) => setHovered({ item, x, y, touch: true }),
    () => setHovered(null),
  );
  const selectedId = selected?.id ?? null;
  const choose = (item: Item | null) => {
    setHovered(null);
    onPick(item);
  };
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
      onClose={() => {
        setHovered(null);
        onClose();
      }}
      title={title}
      fullScreen={fullScreen}
      centered={!fullScreen}
      zIndex={300}
    >
      <Stack gap={6}>
        {selectedId !== null && (
          <UnstyledButton onClick={() => choose(null)} p="xs" style={{ borderRadius: 8 }}>
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
              onClick={() => {
                if (!longPress.consumeClick()) choose(candidate);
              }}
              onMouseMove={
                canHover
                  ? (event) =>
                      setHovered({ item: candidate, x: event.clientX, y: event.clientY, touch: false })
                  : undefined
              }
              {...longPress.handlers(candidate)}
              onMouseLeave={() => setHovered(null)}
              p="xs"
              aria-pressed={selected}
              style={{
                borderRadius: 8,
                background: selected ? 'var(--mantine-color-pickle-0)' : undefined,
                outline: selected ? '2px solid var(--mantine-color-pickle-5)' : undefined,
                userSelect: 'none',
                WebkitTouchCallout: 'none',
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
      {hovered && slot !== null && constants.data && (
        <SwapPreview
          deltas={swapPreview(hovered.item, selected, constants.data)}
          units={statUnits(constants.data)}
          x={hovered.x}
          y={hovered.y}
          touch={hovered.touch}
        />
      )}
    </Modal>
  );
}
