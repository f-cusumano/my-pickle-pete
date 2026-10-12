import { Divider, Group, NumberInput, Stack, Text, Title } from '@mantine/core';
import { IconCheck, IconLock } from '@tabler/icons-react';
import { useState } from 'react';
import type { Item, Rarity, Stat, StatUnit } from '../api/types';
import { formatLevel, formatStatBonus } from '../domain/format';
import { ARMOR_SET_LABELS, ITEM_TYPE_LABELS } from '../i18n/labels';
import { ItemThumbnail } from './ItemThumbnail';
import { thumbnailOf } from '../domain/itemImages';
import { RarityBadge } from './RarityBadge';
import { SpecificationLabel } from './SpecificationLabel';

interface Props {
  item: Item;
  rarities: Rarity[];
  units: Record<Stat, StatUnit>;
  /** Assente in sola lettura: il livello non è modificabile. */
  onLevelChange?: (level: number) => void;
}

/** Scheda di un item: immagine, dati, potenziamenti per rarità, livello e caratteristica base. */
export function ItemDetail({ item, rarities, units, onLevelChange }: Props) {
  return (
    <Stack gap="md">
      <Group wrap="nowrap" align="flex-start">
        <ItemThumbnail {...thumbnailOf(item)} size={112} />
        <Stack gap={4} style={{ minWidth: 0 }}>
          <Title order={3} style={{ overflowWrap: 'anywhere' }}>
            {item.name}
          </Title>
          <Text size="sm">
            <Text span fw={700}>
              Tipologia:
            </Text>{' '}
            {ITEM_TYPE_LABELS[item.type]}
          </Text>
          {item.specification && (
            <Group gap={6}>
              <Text size="sm" fw={700}>
                Specifica:
              </Text>
              <SpecificationLabel specification={item.specification} />
            </Group>
          )}
          {item.armorSet && (
            <Text size="sm">
              <Text span fw={700}>
                Set:
              </Text>{' '}
              {ARMOR_SET_LABELS[item.armorSet]}
            </Text>
          )}
        </Stack>
      </Group>

      <Stack gap={6}>
        <Text fw={700}>Rarità e potenziamenti</Text>
        {rarities.map((rarity) => (
          <RarityRow key={rarity} item={item} rarity={rarity} rarities={rarities} />
        ))}
      </Stack>

      <Divider />
      <Group justify="space-between" wrap="wrap" gap="sm">
        <Group gap="xs" wrap="nowrap">
          <Text fw={700}>Livello</Text>
          {onLevelChange ? (
            <LevelInput
              key={`${String(item.id)}-${String(item.level)}`}
              item={item}
              onLevelChange={onLevelChange}
            />
          ) : (
            <Text>{formatLevel(item.level, item.maxLevel)}</Text>
          )}
        </Group>
        <Text fw={700} c="pickle.9">
          {formatStatBonus(item.baseStat, item.baseStatValue, units[item.baseStat])}
        </Text>
      </Group>
    </Stack>
  );
}

function RarityRow({ item, rarity, rarities }: { item: Item; rarity: Rarity; rarities: Rarity[] }) {
  const reached = rarities.indexOf(rarity) <= rarities.indexOf(item.rarity);
  const bonus = item.bonuses.find((b) => b.rarity === rarity);
  let description = '-';
  if (rarity !== 'COMMON') {
    description = bonus ? formatStatBonus(bonus.stat, bonus.amount, bonus.unit) : 'Potenziamento non censito';
  }
  return (
    <Group gap="sm" wrap="nowrap" style={{ opacity: reached ? 1 : 0.45 }}>
      <RarityBadge rarity={rarity} dimmed={!reached} />
      <Text size="sm" c={reached ? undefined : 'dimmed'} style={{ flex: 1 }}>
        {description}
      </Text>
      {reached ? <IconCheck size={18} color="var(--mantine-color-pickle-8)" /> : <IconLock size={16} />}
    </Group>
  );
}

/** Livello modificabile a mano entro [1, M]; si salva all'uscita dal campo o con Invio (la key lo riallinea al salvato). */
function LevelInput({ item, onLevelChange }: { item: Item; onLevelChange: (level: number) => void }) {
  const [value, setValue] = useState<number | string>(item.level);
  const commit = () => {
    const level = typeof value === 'number' ? value : Number.parseInt(value, 10);
    if (Number.isInteger(level) && level >= 1 && level <= item.maxLevel && level !== item.level) {
      onLevelChange(level);
    } else {
      setValue(item.level);
    }
  };
  return (
    <Group gap={6} wrap="nowrap">
      <NumberInput
        aria-label="Livello"
        value={value}
        onChange={setValue}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            commit();
          }
        }}
        min={1}
        max={item.maxLevel}
        clampBehavior="strict"
        allowDecimal={false}
        allowNegative={false}
        w={84}
        inputMode="numeric"
      />
      <Text>/ {item.maxLevel}</Text>
    </Group>
  );
}
