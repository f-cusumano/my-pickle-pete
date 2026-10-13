import { Divider, Group, NumberInput, Stack, Text, Title, UnstyledButton } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { IconCheck, IconLock } from '@tabler/icons-react';
import { type ReactNode, useState } from 'react';
import type { Item, Rarity, Stat, StatUnit } from '../api/types';
import { formatLevel, formatStatBonus } from '../domain/format';
import { ARMOR_SET_LABELS, ITEM_TYPE_LABELS, RARITY_LABELS } from '../i18n/labels';
import classes from './ItemDetail.module.css';
import { ItemThumbnail } from './ItemThumbnail';
import { thumbnailOf } from '../domain/itemImages';
import { RarityBadge } from './RarityBadge';
import { SpecificationLabel } from './SpecificationLabel';

interface Props {
  item: Item;
  rarities: Rarity[];
  units: Record<Stat, StatUnit>;
  /** Le modifiche seguenti sono assenti in sola lettura. */
  editing?: ItemEditing;
}

/** Modifica di rarità e livello dell'item. */
export interface ItemEditing {
  baseStatPerLevel: number;
  busy: boolean;
  onRarityChange: (rarity: Rarity) => void;
  onLevelChange: (level: number) => void;
}

/** Scheda di un item: immagine, dati, potenziamenti per rarità, livello e caratteristica base. */
export function ItemDetail({ item, rarities, units, editing }: Props) {
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

      {item.description && (
        <Stack gap={2}>
          <Text fw={700}>Effetti</Text>
          <Text size="sm" style={{ whiteSpace: 'pre-line' }}>
            {item.description}
          </Text>
        </Stack>
      )}

      <Stack gap={editing ? 2 : 6}>
        <Text fw={700}>Rarità e potenziamenti</Text>
        {editing && (
          <Text size="xs" c="dimmed">
            Tocca una rarità per impostarla: si attivano anche tutte quelle inferiori.
          </Text>
        )}
        {rarities.map((rarity) => (
          <RarityRow
            key={rarity}
            item={item}
            rarity={rarity}
            rarities={rarities}
            onSelect={editing && (() => editing.onRarityChange(rarity))}
            disabled={editing?.busy}
          />
        ))}
      </Stack>

      <Divider />
      {editing ? (
        <EditableLevel item={item} units={units} editing={editing} />
      ) : (
        <LevelRow
          level={<Text>{formatLevel(item.level, item.maxLevel)}</Text>}
          stat={formatStatBonus(item.baseStat, item.baseStatValue, units[item.baseStat])}
        />
      )}
    </Stack>
  );
}

function LevelRow({ level, stat }: { level: ReactNode; stat: string }) {
  return (
    <Group justify="space-between" wrap="wrap" gap="sm">
      <Group gap="xs" wrap="nowrap">
        <Text fw={700}>Livello</Text>
        {level}
      </Group>
      <Text fw={700} c="pickle.9">
        {stat}
      </Text>
    </Group>
  );
}

interface RarityRowProps {
  item: Item;
  rarity: Rarity;
  rarities: Rarity[];
  /** Assente in sola lettura: la riga non è cliccabile. */
  onSelect?: () => void;
  disabled?: boolean;
}

function RarityRow({ item, rarity, rarities, onSelect, disabled }: RarityRowProps) {
  const reached = rarities.indexOf(rarity) <= rarities.indexOf(item.rarity);
  const bonus = item.bonuses.find((b) => b.rarity === rarity);
  let description = '-';
  if (rarity !== 'COMMON') {
    description = bonus
      ? formatStatBonus(bonus.stat, bonus.amount, bonus.unit, bonus.own)
      : 'Potenziamento non censito';
  }
  const content = (
    <>
      <RarityBadge rarity={rarity} dimmed={!reached} />
      <Text size="sm" c={reached ? undefined : 'gray.7'} style={{ flex: 1 }}>
        {description}
      </Text>
      {reached ? (
        <IconCheck size={18} color="var(--mantine-color-pickle-8)" />
      ) : (
        <IconLock size={16} color="var(--mantine-color-gray-6)" />
      )}
    </>
  );
  if (!onSelect) {
    return (
      <Group gap="sm" wrap="nowrap">
        {content}
      </Group>
    );
  }
  return (
    <UnstyledButton
      className={classes.rarityRow}
      onClick={onSelect}
      disabled={disabled}
      aria-label={`Imposta la rarità ${RARITY_LABELS[rarity]}`}
      aria-pressed={rarity === item.rarity}
    >
      {content}
    </UnstyledButton>
  );
}

/** Pausa dopo l'ultimo clic sulle frecce prima di salvare il livello. */
const STEP_SAVE_DELAY_MS = 400;
/** Origini del cambio di valore con le frecce (a video o da tastiera), distinte dalla scrittura a mano. */
const STEP_SOURCES: string[] = ['increment', 'decrement'];

/**
 * Livello modificabile entro [1, M] con la caratteristica base ricalcolata subito.
 * Con le frecce il livello si salva poco dopo l'ultimo clic; scritto a mano, all'uscita dal campo o con Invio.
 */
function EditableLevel({
  item,
  units,
  editing,
}: {
  item: Item;
  units: Record<Stat, StatUnit>;
  editing: ItemEditing;
}) {
  const [value, setValue] = useState<number | string>(item.level);
  // Il valore si riallinea al salvato quando cambia (es. rarità più bassa), se non c'è una modifica in corso
  const [savedLevel, setSavedLevel] = useState(item.level);
  if (item.level !== savedLevel) {
    setSavedLevel(item.level);
    if (value === savedLevel) {
      setValue(item.level);
    }
  }
  const validLevel = (candidate: number | string) => {
    const level = typeof candidate === 'number' ? candidate : Number.parseInt(candidate, 10);
    return Number.isInteger(level) && level >= 1 && level <= item.maxLevel ? level : null;
  };
  const commit = (candidate: number | string) => {
    const level = validLevel(candidate);
    if (level === null) {
      setValue(item.level);
    } else if (level !== item.level) {
      editing.onLevelChange(level);
    }
  };
  const commitStep = useDebouncedCallback(commit, { delay: STEP_SAVE_DELAY_MS, flushOnUnmount: true });
  // Sostituisce l'eventuale salvataggio in attesa delle frecce: un solo salvataggio col valore attuale
  const commitNow = () => {
    commitStep(value);
    commitStep.flush();
  };
  const shownLevel = validLevel(value) ?? item.level;
  return (
    <LevelRow
      level={
        <Group gap={6} wrap="nowrap">
          <NumberInput
            aria-label="Livello"
            value={value}
            onChange={setValue}
            onValueChange={({ floatValue }, { source }) => {
              if (STEP_SOURCES.includes(source) && floatValue !== undefined) {
                commitStep(floatValue);
              }
            }}
            onBlur={commitNow}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                commitNow();
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
      }
      stat={formatStatBonus(item.baseStat, shownLevel * editing.baseStatPerLevel, units[item.baseStat])}
    />
  );
}
