import { Badge, Group, Paper, Text } from '@mantine/core';
import { IconSparkles } from '@tabler/icons-react';

interface Props {
  title: string;
  active: boolean;
  description: string | null;
}

/** Riquadro del bonus di set (solo testo): verde se attivo. */
export function SetBonusCard({ title, active, description }: Props) {
  return (
    <Paper withBorder p="sm" radius="md" bg={active ? 'pickle.0' : 'gray.0'}>
      <Group gap="xs" mb={4}>
        <IconSparkles size={18} />
        <Text fw={700}>{title}</Text>
        <Badge size="sm" color={active ? 'pickle' : 'gray'}>
          {active ? 'Attivo' : 'Non attivo'}
        </Badge>
      </Group>
      <Text size="sm" c={description ? undefined : 'dimmed'}>
        {description ?? 'Effetto non ancora censito.'}
      </Text>
    </Paper>
  );
}
