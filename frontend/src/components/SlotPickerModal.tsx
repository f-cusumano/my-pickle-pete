import { Badge, Group, Modal, Stack, Text, UnstyledButton } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import type { Item, Specification } from '../api/types';
import { slotCandidates } from '../domain/customSets';
import { formatLevel } from '../domain/format';
import { thumbnailOf } from '../domain/itemImages';
import { useFullScreenModal } from '../hooks/useFullScreenModal';
import { ARMOR_SET_LABELS, SPECIFICATION_LABELS } from '../i18n/labels';
import { ItemThumbnail } from './ItemThumbnail';
import { RarityBadge } from './RarityBadge';

interface Props {
  slot: Specification | null;
  items: Item[];
  selectedId: number | null;
  onPick: (item: Item | null) => void;
  onClose: () => void;
}

/** Scelta del pezzo di uno slot tra le armature censite, per rarità decrescente e poi per nome. */
export function SlotPickerModal({ slot, items, selectedId, onPick, onClose }: Props) {
  const fullScreen = useFullScreenModal();
  const candidates = slot ? slotCandidates(items, slot) : [];
  return (
    <Modal
      opened={slot !== null}
      onClose={onClose}
      title={slot ? `Scegli ${SPECIFICATION_LABELS[slot].toLowerCase()}` : ''}
      fullScreen={fullScreen}
      centered={!fullScreen}
      zIndex={300}
    >
      <Stack gap={6}>
        {selectedId !== null && (
          <UnstyledButton onClick={() => onPick(null)} p="xs" style={{ borderRadius: 8 }}>
            <Group gap="sm" wrap="nowrap">
              <IconX size={20} />
              <Text>Lascia lo slot vuoto</Text>
            </Group>
          </UnstyledButton>
        )}
        {candidates.length === 0 && (
          <Text c="dimmed" size="sm">
            Nessun pezzo censito per questo slot: aggiungilo dal Censimento o da Full Sets.
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
              </Group>
            </UnstyledButton>
          );
        })}
      </Stack>
    </Modal>
  );
}
