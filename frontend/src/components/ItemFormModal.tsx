import {
  Button,
  Group,
  Modal,
  NumberInput,
  SegmentedControl,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useFullScreenModal } from '../hooks/useFullScreenModal';
import { useState, type ReactNode } from 'react';
import { errorMessage, useItemCensus } from '../api/queries';
import type { GameConstants, Item, ItemType, Rarity, Stat, StatUnit } from '../api/types';
import {
  emptyForm,
  formOf,
  toRequest,
  validateForm,
  type BonusRow,
  type ItemFormValues,
} from '../domain/itemForm';
import { statUnits } from '../domain/units';
import {
  ARMOR_SET_LABELS,
  ITEM_TYPE_LABELS,
  SPECIFICATION_LABELS,
  STAT_LABELS,
  STAT_UNIT_LABELS,
} from '../i18n/labels';
import { ItemThumbnail } from './ItemThumbnail';
import { RarityBadge } from './RarityBadge';
import classes from './ItemFormModal.module.css';

interface Props {
  constants: GameConstants;
  /** null = nuovo item, altrimenti l'item da modificare. */
  item: Item | null;
  /** Valori di partenza di un nuovo item (es. set e slot del pezzo mancante da aggiungere). */
  preset?: Partial<ItemFormValues>;
  onClose: () => void;
}

/** Censimento di un item: dati fissi e potenziamento sbloccato da ogni rarità; l'immagine è quella della categoria. */
export function ItemFormModal({ constants, item, preset, onClose }: Props) {
  const fullScreen = useFullScreenModal();
  const census = useItemCensus();
  const [serverError, setServerError] = useState<string | null>(null);
  const units = statUnits(constants);
  const form = useForm<ItemFormValues>({
    initialValues: item ? formOf(item) : { ...emptyForm(), ...preset },
    validate: (values) => validateForm(values, constants),
  });
  const type = constants.itemTypes.find((t) => t.code === form.values.type);
  const bonusRarities = constants.rarities
    .map((rarity) => rarity.code)
    .filter((rarity) => rarity !== 'COMMON');

  const submit = form.onSubmit((values) => {
    setServerError(null);
    census.save.mutate(
      { id: item?.id ?? null, request: toRequest(values, constants) },
      { onSuccess: onClose, onError: (error) => setServerError(errorMessage(error)) },
    );
  });

  const changeType = (value: string | null) => {
    form.setFieldValue('type', value as ItemType | null);
    form.setFieldValue('specification', null);
    form.setFieldValue('armorSet', null);
  };

  return (
    <Modal
      opened
      onClose={onClose}
      title={item ? `Modifica ${item.name}` : 'Crea item'}
      size="lg"
      fullScreen={fullScreen}
      centered={!fullScreen}
    >
      <form onSubmit={submit}>
        <Stack gap="sm">
          <TextInput label="Nome" withAsterisk maxLength={100} {...form.getInputProps('name')} />
          <Select
            label="Tipologia"
            withAsterisk
            data={constants.itemTypes.map((t) => ({ value: t.code, label: ITEM_TYPE_LABELS[t.code] }))}
            value={form.values.type}
            onChange={changeType}
            error={form.errors.type}
            allowDeselect={false}
          />
          {type?.specified && (
            <Select
              label="Specifica"
              withAsterisk
              data={constants.specifications
                .filter((spec) => spec.itemType === type.code)
                .map((spec) => ({ value: spec.code, label: SPECIFICATION_LABELS[spec.code] }))}
              value={form.values.specification}
              onChange={(value) => form.setFieldValue('specification', value)}
              error={form.errors.specification}
            />
          )}
          {type?.partOfArmorSet && (
            <Select
              label="Set"
              withAsterisk
              data={constants.armorSets.map((set) => ({ value: set, label: ARMOR_SET_LABELS[set] }))}
              value={form.values.armorSet}
              onChange={(value) => form.setFieldValue('armorSet', value)}
              error={form.errors.armorSet}
            />
          )}

          <Group gap="sm" wrap="nowrap">
            <ItemThumbnail
              type={form.values.type}
              specification={form.values.specification}
              rarity={item?.rarity ?? null}
              label="Immagine della categoria"
              size={56}
            />
            <Text size="xs" c="dimmed">
              L&apos;immagine è quella predefinita della categoria e si aggiorna da sola scegliendo tipologia
              e specifica.
            </Text>
          </Group>

          <Text fw={700} mt="sm">
            Potenziamento per rarità
          </Text>
          <Text size="xs" c="dimmed" mt={-8}>
            Comune non ne ha; lascia vuoto ciò che non conosci ancora.
          </Text>
          {bonusRarities.map((rarity) => (
            <BonusRowInput
              key={rarity}
              rarity={rarity}
              row={form.values.bonuses[rarity] ?? { stat: null, unit: null, amount: '' }}
              statError={form.errors[`bonuses.${rarity}.stat`]}
              unitError={form.errors[`bonuses.${rarity}.unit`]}
              amountError={form.errors[`bonuses.${rarity}.amount`]}
              onChange={(row) => form.setFieldValue(`bonuses.${rarity}`, row)}
              units={units}
              constants={constants}
            />
          ))}

          {serverError && (
            <Text c="red" size="sm">
              {serverError}
            </Text>
          )}
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              Annulla
            </Button>
            <Button type="submit" loading={census.save.isPending}>
              Salva
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

interface BonusRowProps {
  rarity: Rarity;
  row: BonusRow;
  statError: ReactNode;
  unitError: ReactNode;
  amountError: ReactNode;
  onChange: (row: BonusRow) => void;
  units: Record<Stat, StatUnit>;
  constants: GameConstants;
}

function BonusRowInput({
  rarity,
  row,
  statError,
  unitError,
  amountError,
  onChange,
  units,
  constants,
}: BonusRowProps) {
  // Scegliendo la caratteristica si propone la sua unità predefinita, poi modificabile
  const changeStat = (value: string | null) => {
    const stat = value as Stat | null;
    onChange({ ...row, stat, unit: stat ? units[stat] : row.unit });
  };
  return (
    <div className={classes.bonusRow}>
      <div className={classes.bonusBadge}>
        <RarityBadge rarity={rarity} />
      </div>
      <Select
        aria-label={`Caratteristica ${rarity}`}
        placeholder="Caratteristica"
        data={constants.stats.map((stat) => ({ value: stat.code, label: STAT_LABELS[stat.code] }))}
        value={row.stat}
        onChange={changeStat}
        error={statError}
        searchable
        clearable
        className={classes.bonusStat}
      />
      <div className={classes.bonusUnit}>
        <SegmentedControl
          aria-label={`Unità ${rarity}`}
          data={(['FLAT', 'PERCENT'] as const).map((unit) => ({
            value: unit,
            label: STAT_UNIT_LABELS[unit],
          }))}
          value={row.unit ?? ''}
          onChange={(value) => onChange({ ...row, unit: value as StatUnit })}
          fullWidth
        />
        {unitError && (
          <Text c="red" size="xs" mt={2}>
            {unitError}
          </Text>
        )}
      </div>
      <NumberInput
        aria-label={`Quantità ${rarity}`}
        placeholder="Quantità"
        value={row.amount}
        onChange={(value) => onChange({ ...row, amount: value })}
        error={amountError}
        min={0}
        decimalScale={2}
        decimalSeparator=","
        suffix={row.unit === 'PERCENT' ? '%' : undefined}
        inputMode="decimal"
        className={classes.bonusAmount}
      />
    </div>
  );
}
