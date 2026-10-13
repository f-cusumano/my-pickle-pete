import { Box, Group, Stack, Text } from '@mantine/core';
import type { Item, Rarity } from '../api/types';
import { formatLevel, formatStatBonus } from '../domain/format';
import { RARITY_COLORS } from '../domain/rarityColors';
import { ARMOR_SET_LABELS, ITEM_TYPE_LABELS, SPECIFICATION_LABELS } from '../i18n/labels';

/** Rarità con un potenziamento, dalla più bassa (Comune non ne ha). */
const BONUS_RARITIES: Rarity[] = ['UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'ARTIFACT'];

/**
 * Resoconto compatto di un item: nome e livello, tipologia, specifica e set, e i potenziamenti per rarità,
 * ciascuno con un quadratino del colore della rarità; quelli non ancora sbloccati sono opacizzati.
 */
export function ItemSummary({ item }: { item: Item }) {
  const kind = [
    ITEM_TYPE_LABELS[item.type],
    item.specification && SPECIFICATION_LABELS[item.specification],
    item.armorSet && ARMOR_SET_LABELS[item.armorSet],
  ].filter(Boolean);
  return (
    <Stack gap={4} px={4} style={{ maxWidth: 280 }}>
      <Stack gap={0}>
        <Text size="sm" fw={700}>
          {item.name}{' '}
          <Text span size="sm" c="dimmed">
            ({formatLevel(item.level, item.maxLevel)})
          </Text>
        </Text>
        <Text size="xs" c="dimmed">
          {kind.join(' - ')}
        </Text>
      </Stack>
      <Stack gap={2}>
        {BONUS_RARITIES.map((rarity) => {
          const bonus = item.bonuses.find((candidate) => candidate.rarity === rarity);
          const unlocked = bonus?.unlocked ?? false;
          return (
            <Group key={rarity} gap={6} wrap="nowrap">
              <RaritySquare rarity={rarity} dimmed={!unlocked} />
              <Text size="xs" c={unlocked ? undefined : 'gray.7'}>
                {bonus ? formatStatBonus(bonus.stat, bonus.amount, bonus.unit, bonus.own) : 'Non censito'}
              </Text>
            </Group>
          );
        })}
      </Stack>
    </Stack>
  );
}

/** Quadratino come una casella non spuntata, riempito col colore della rarità (opacizzato se non sbloccata). */
function RaritySquare({ rarity, dimmed }: { rarity: Rarity; dimmed: boolean }) {
  return (
    <Box
      aria-hidden
      style={{
        flex: '0 0 12px',
        width: 12,
        height: 12,
        borderRadius: 3,
        border: '1.5px solid #111',
        background: RARITY_COLORS[rarity],
        opacity: dimmed ? 0.7 : 1,
        filter: dimmed ? 'grayscale(0.6)' : 'none',
      }}
    />
  );
}
