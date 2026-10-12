import {
  ActionIcon,
  Button,
  FileInput,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMediaQuery } from '@mantine/hooks';
import { IconPhoto, IconTrash } from '@tabler/icons-react';
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
import { ARMOR_SET_LABELS, ITEM_TYPE_LABELS, SPECIFICATION_LABELS, STAT_LABELS } from '../i18n/labels';
import { ItemThumbnail } from './ItemThumbnail';
import { RarityBadge } from './RarityBadge';
import classes from './ItemFormModal.module.css';

interface Props {
  constants: GameConstants;
  /** null = nuovo item, altrimenti l'item da modificare. */
  item: Item | null;
  onClose: () => void;
}

/** Censimento di un item: dati fissi, immagine e potenziamento sbloccato da ogni rarità. */
export function ItemFormModal({ constants, item, onClose }: Props) {
  const fullScreen = useMediaQuery('(max-width: 48em)');
  const census = useItemCensus();
  const [image, setImage] = useState<File | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const units = statUnits(constants);
  const form = useForm<ItemFormValues>({
    initialValues: item ? formOf(item) : emptyForm(),
    validate: (values) => validateForm(values, constants),
  });
  const type = constants.itemTypes.find((t) => t.code === form.values.type);
  const bonusRarities = constants.rarities
    .map((rarity) => rarity.code)
    .filter((rarity) => rarity !== 'COMMON');

  const submit = form.onSubmit((values) => {
    setServerError(null);
    census.save.mutate(
      { id: item?.id ?? null, request: toRequest(values, constants), image },
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
      centered
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

          <Group align="flex-end" wrap="nowrap">
            {item && <ItemThumbnail item={item} size={56} />}
            <FileInput
              label="Immagine"
              placeholder={item?.imageVersion ? 'Sostituisci immagine' : 'Scegli immagine (max 2 MB)'}
              accept="image/png,image/jpeg,image/webp,image/gif"
              leftSection={<IconPhoto size={18} />}
              value={image}
              onChange={setImage}
              clearable
              style={{ flex: 1 }}
            />
            {item?.imageVersion && (
              <Tooltip label="Rimuovi immagine">
                <ActionIcon
                  variant="light"
                  color="red"
                  size="lg"
                  mb={2}
                  loading={census.removeImage.isPending}
                  onClick={() => census.removeImage.mutate(item.id)}
                  aria-label="Rimuovi immagine"
                >
                  <IconTrash size={18} />
                </ActionIcon>
              </Tooltip>
            )}
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
              row={form.values.bonuses[rarity] ?? { stat: null, amount: '' }}
              statError={form.errors[`bonuses.${rarity}.stat`]}
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
  amountError: ReactNode;
  onChange: (row: BonusRow) => void;
  units: Record<Stat, StatUnit>;
  constants: GameConstants;
}

function BonusRowInput({ rarity, row, statError, amountError, onChange, units, constants }: BonusRowProps) {
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
        onChange={(value) => onChange({ ...row, stat: value })}
        error={statError}
        searchable
        clearable
      />
      <NumberInput
        aria-label={`Valore ${rarity}`}
        placeholder="Valore"
        value={row.amount}
        onChange={(value) => onChange({ ...row, amount: value })}
        error={amountError}
        min={0}
        decimalScale={2}
        decimalSeparator=","
        suffix={row.stat && units[row.stat] === 'PERCENT' ? '%' : undefined}
        inputMode="decimal"
      />
    </div>
  );
}
