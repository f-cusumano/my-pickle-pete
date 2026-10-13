import { Group, Paper, Stack, Text } from '@mantine/core';
import { IconThumbDown, IconThumbUp } from '@tabler/icons-react';
import type { Specification, WeaponAdvice } from '../api/types';
import { weaponAdviceText } from '../domain/customSets';

/**
 * Tipi di arma consigliati (caratteristica di tipo più alta tra le armature del set) e sconsigliati (più bassa);
 * l'arma scelta nel set non li cambia.
 */
export function WeaponAdviceCard({ advice }: { advice: WeaponAdvice }) {
  return (
    <Paper withBorder p="sm" radius="md">
      <Stack gap={4}>
        <Group gap={6} wrap="nowrap" align="flex-start">
          <IconThumbUp
            size={18}
            color="var(--mantine-color-pickle-8)"
            style={{ flex: 'none', marginTop: 1 }}
          />
          <Text size="sm">
            <Text span fw={700}>
              {plural(advice.recommendedNow, advice.recommendedTop)
                ? 'Armi consigliate:'
                : 'Arma consigliata:'}
            </Text>{' '}
            {weaponAdviceText(advice.recommendedNow, advice.recommendedTop)}
          </Text>
        </Group>
        <Group gap={6} wrap="nowrap" align="flex-start">
          <IconThumbDown
            size={18}
            color="var(--mantine-color-red-7)"
            style={{ flex: 'none', marginTop: 1 }}
          />
          <Text size="sm">
            <Text span fw={700}>
              {plural(advice.discouragedNow, advice.discouragedTop)
                ? 'Armi sconsigliate:'
                : 'Arma sconsigliata:'}
            </Text>{' '}
            {weaponAdviceText(advice.discouragedNow, advice.discouragedTop)}
          </Text>
        </Group>
      </Stack>
    </Paper>
  );
}

/** Singolare solo con un tipo di arma sia ora sia al massimo potenziale. */
const plural = (now: Specification[], top: Specification[]) => now.length !== 1 || top.length !== 1;
