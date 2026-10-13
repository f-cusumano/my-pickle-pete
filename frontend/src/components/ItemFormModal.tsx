import {
  Button,
  Checkbox,
  Group,
  Modal,
  NumberInput,
  SegmentedControl,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useFullScreenModal } from '../hooks/useFullScreenModal';
import { useState, type ReactNode } from 'react';
import { errorMessage, useItemCensus } from '../api/queries';
import type { GameConstants, Item, ItemType, Rarity, Stat, StatUnit } from '../api/types';
import { statKeyId } from '../domain/customSets';
import { statSign } from '../domain/format';
import {
  MIN_BONUS_AMOUNT,
  bonusRarities,
  emptyForm,
  fixedBonuses,
  formOf,
  toRequest,
  validateForm,
  type BonusRow,
  type FixedBonus,
  type ItemFormValues,
} from '../domain/itemForm';
import { statUnits } from '../domain/units';
import {
  ARMOR_SET_LABELS,
  ITEM_TYPE_LABELS,
  SPECIFICATION_LABELS,
  STAT_LABELS,
  STAT_UNIT_DESCRIPTIONS,
  STAT_UNIT_LABELS,
  ownStatLabel,
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
  const rarities = bonusRarities(constants);
  const fixed = fixedBonuses(constants, form.values.type);

  const submit = form.onSubmit((values) => {
    setServerError(null);
    census.save.mutate(
      { id: item?.id ?? null, request: toRequest(values, constants) },
      { onSuccess: onClose, onError: (error) => setServerError(errorMessage(error)) },
    );
  });

  const changeType = (value: string | null) => {
    const newType = value as ItemType | null;
    // Abilità e altre tipologie hanno caratteristiche diverse: passando dalle une alle altre i potenziamenti si azzerano
    if ((newType === 'ABILITY') !== (form.values.type === 'ABILITY')) {
      form.setFieldValue('bonuses', {});
    }
    form.setFieldValue('type', newType);
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
          {form.values.type === 'ABILITY' && (
            <Textarea
              label="Effetti"
              placeholder="Cosa fa l'abilità, es. lancia una granata che esplode dopo 2 secondi"
              autosize
              minRows={2}
              maxLength={1000}
              {...form.getInputProps('description')}
            />
          )}

          <Group gap="sm" wrap="nowrap">
            <ItemThumbnail
              type={form.values.type}
              specification={form.values.specification}
              label="Immagine della categoria"
              size={56}
              plain
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
            Obbligatorio per ogni rarità tranne Comune, che non ne ha.
          </Text>
          {rarities.map((rarity) => (
            <BonusRowInput
              key={rarity}
              rarity={rarity}
              row={form.values.bonuses[rarity] ?? { stat: null, unit: null, amount: '', own: false }}
              weapon={form.values.type === 'WEAPON'}
              fixed={fixed}
              statError={form.errors[`bonuses.${rarity}.stat`]}
              unitError={form.errors[`bonuses.${rarity}.unit`]}
              amountError={form.errors[`bonuses.${rarity}.amount`]}
              onChange={(row) => {
                form.setFieldValue(`bonuses.${rarity}`, row);
                // Gli errori della riga si ricalcolano al prossimo salvataggio
                (['stat', 'unit', 'amount'] as const).forEach((field) =>
                  form.clearFieldError(`bonuses.${rarity}.${field}`),
                );
              }}
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
  /** Solo per le armi si può indicare un potenziamento proprio dell'arma. */
  weapon: boolean;
  /** Potenziamenti possibili quando sono un elenco chiuso (abilità): unità fissa, "Proprio danno" tra le scelte. */
  fixed: FixedBonus[];
  statError: ReactNode;
  unitError: ReactNode;
  amountError: ReactNode;
  onChange: (row: BonusRow) => void;
  units: Record<Stat, StatUnit>;
  constants: GameConstants;
}

const UNIT_SUFFIXES: Record<StatUnit, string | undefined> = { PERCENT: '%', FLAT: undefined, SECONDS: 's' };

function BonusRowInput({
  rarity,
  row,
  weapon,
  fixed,
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
  // Elenco chiuso: la scelta fissa caratteristica, unità e "proprio"
  const changeFixed = (value: string | null) => {
    const key = fixed.find((candidate) => statKeyId(candidate) === value);
    onChange({ ...row, stat: key?.stat ?? null, unit: key?.unit ?? null, own: key?.own ?? false });
  };
  const closed = fixed.length > 0;
  return (
    <div className={closed ? `${classes.bonusRow} ${classes.bonusRowFixed}` : classes.bonusRow}>
      <div className={classes.bonusBadge}>
        <RarityBadge rarity={rarity} />
      </div>
      {closed ? (
        <Select
          aria-label={`Caratteristica ${rarity}`}
          placeholder="Caratteristica"
          data={fixed.map((key) => ({
            value: statKeyId(key),
            label: key.own ? ownStatLabel(key.stat) : STAT_LABELS[key.stat],
          }))}
          value={row.stat && row.unit ? statKeyId({ stat: row.stat, unit: row.unit, own: row.own }) : null}
          onChange={changeFixed}
          error={statError}
          clearable
          className={classes.bonusStat}
        />
      ) : (
        <Select
          aria-label={`Caratteristica ${rarity}`}
          placeholder="Caratteristica"
          data={constants.stats
            .filter((stat) => stat.general)
            .map((stat) => ({ value: stat.code, label: STAT_LABELS[stat.code] }))}
          value={row.stat}
          onChange={changeStat}
          error={statError}
          searchable
          clearable
          className={classes.bonusStat}
        />
      )}
      {!closed && (
        <div className={classes.bonusUnit}>
          <SegmentedControl
            aria-label={`Unità ${rarity}`}
            data={(['FLAT', 'PERCENT'] as const).map((unit) => ({
              value: unit,
              label: (
                <Tooltip label={STAT_UNIT_DESCRIPTIONS[unit]} withinPortal>
                  <span aria-label={STAT_UNIT_DESCRIPTIONS[unit]}>{STAT_UNIT_LABELS[unit]}</span>
                </Tooltip>
              ),
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
      )}
      <NumberInput
        aria-label={`Quantità ${rarity}`}
        placeholder="Quantità"
        value={row.amount}
        onChange={(value) => onChange({ ...row, amount: value })}
        error={amountError}
        min={MIN_BONUS_AMOUNT}
        decimalScale={2}
        decimalSeparator=","
        allowNegative={false}
        prefix={statSign(row.stat)}
        suffix={UNIT_SUFFIXES[row.unit ?? 'FLAT']}
        inputMode="decimal"
        className={classes.bonusAmount}
      />
      {weapon && (
        <Checkbox
          label="Proprio dell'arma (es. +10% al proprio danno)"
          checked={row.own}
          onChange={(event) => onChange({ ...row, own: event.currentTarget.checked })}
          size="xs"
          className={classes.bonusOwn}
        />
      )}
    </div>
  );
}
