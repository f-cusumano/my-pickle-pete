import { Group, Text } from '@mantine/core';
import type { Specification } from '../api/types';
import { SPECIFICATION_LABELS } from '../i18n/labels';
import { SPECIFICATION_ICONS } from './icons';

/** Specifica con il suo simbolo, oppure "-" per le abilità. */
export function SpecificationLabel({ specification }: { specification: Specification | null }) {
  if (specification === null) {
    return <Text c="dimmed">-</Text>;
  }
  const SpecificationIcon = SPECIFICATION_ICONS[specification];
  return (
    <Group gap={6} wrap="nowrap">
      <SpecificationIcon size={18} stroke={1.8} />
      <Text size="sm">{SPECIFICATION_LABELS[specification]}</Text>
    </Group>
  );
}
