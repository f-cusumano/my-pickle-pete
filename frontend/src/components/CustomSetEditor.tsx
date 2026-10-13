import {
  Button,
  Group,
  Loader,
  Modal,
  Paper,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconCopy, IconDeviceFloppy } from '@tabler/icons-react';
import { useMemo, useRef, useState } from 'react';
import { ApiError } from '../api/client';
import { errorMessage, useCustomSetCensus, useSetEvaluation } from '../api/queries';
import type { CustomSet, Item, Specification, Stat, StatUnit } from '../api/types';
import { itemIdsOf, sameSelection, selectionOf, statTrends, type SlotSelection } from '../domain/customSets';
import { useFullScreenModal } from '../hooks/useFullScreenModal';
import { SPECIFICATION_LABELS } from '../i18n/labels';
import { CustomSetBonus } from './CustomSetBonus';
import { SetPieces } from './SetPieces';
import { SetLevelStats } from './SetLevelStats';
import { SetStatsTable } from './SetStatsTable';
import { SlotPickerModal, type PickerSlot } from './SlotPickerModal';
import { GearSlot } from './GearSlot';
import { WeaponAdviceCard } from './WeaponAdviceCard';

/** Set da modificare: id null se non è ancora salvato; original è il set di partenza (null per "Da zero"). */
export interface SetDraft {
  id: number | null;
  name: string;
  original: CustomSet | null;
}

interface Props {
  draft: SetDraft;
  items: Item[];
  slots: Specification[];
  /** Categorie di arma nell'ordine del gioco. */
  weaponCategories: Specification[];
  units: Record<Stat, StatUnit>;
  threshold: number;
  onClose: () => void;
}

const MAX_NAME_LENGTH = 100;
const NAME_TAKEN = 'Nome set già usato';

/** Confronto dei nomi come fa il backend: senza spazi esterni e senza distinguere maiuscole e minuscole. */
const nameKey = (name: string) => name.trim().toLowerCase();

/** true se il salvataggio è fallito perché esiste già un set con quel nome. */
const nameTaken = (error: unknown) =>
  error instanceof ApiError && error.body?.code === 'CUSTOM_SET_NAME_ALREADY_EXISTS';

/**
 * Costruzione o modifica di un set custom, con l'arma facoltativa. In modifica a sinistra resta il set di partenza
 * e a destra quello modificato, con le frecce sulle caratteristiche cambiate; si salva sovrascrivendo o come nuovo set.
 * Con un nome già usato la modale resta aperta e il nome si evidenzia in rosso.
 */
export function CustomSetEditor({ draft, items, slots, weaponCategories, units, threshold, onClose }: Props) {
  const fullScreen = useFullScreenModal();
  const sideBySide = useMediaQuery('(min-width: 62em)', true, { getInitialValueInEffect: false });
  const census = useCustomSetCensus();
  const initialSelection = useMemo(() => selectionOf(draft.original?.pieces ?? []), [draft.original]);
  const [name, setName] = useState(draft.name);
  const [selection, setSelection] = useState<SlotSelection>(initialSelection);
  const [weapon, setWeapon] = useState<Item | null>(draft.original?.weapon ?? null);
  const [ability, setAbility] = useState<Item | null>(draft.original?.ability ?? null);
  const [picking, setPicking] = useState<PickerSlot | null>(null);
  const [view, setView] = useState<'modified' | 'original'>('modified');
  const [askingNewName, setAskingNewName] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  // Nomi rifiutati dal backend perché già usati: restano in rosso finché non si cambia nome
  const [takenNames, setTakenNames] = useState<string[]>([]);
  const nameInput = useRef<HTMLInputElement>(null);
  const itemIds = itemIdsOf(selection, slots);
  const weaponId = weapon?.id ?? null;
  const abilityId = ability?.id ?? null;
  const evaluation = useSetEvaluation(itemIds, weaponId, abilityId);
  const original = draft.original;
  const trends = useMemo(
    () => (original && evaluation.data ? statTrends(original.stats, evaluation.data.stats) : undefined),
    [original, evaluation.data],
  );
  const abilityTrends = useMemo(
    () =>
      original && evaluation.data
        ? statTrends(original.abilityStats, evaluation.data.abilityStats)
        : undefined,
    [original, evaluation.data],
  );
  const unchanged =
    draft.id !== null &&
    name.trim() === draft.name &&
    sameSelection(selection, initialSelection, slots) &&
    weaponId === (draft.original?.weapon?.id ?? null) &&
    abilityId === (draft.original?.ability?.id ?? null);
  const nameErrorOf = (candidate: string) => {
    if (candidate.trim() === '') return 'Dai un nome al set';
    return takenNames.includes(nameKey(candidate)) ? NAME_TAKEN : null;
  };
  const nameError = nameErrorOf(name);

  const save = (id: number | null, targetName: string) => {
    setServerError(null);
    census.save.mutate(
      { id, request: { name: targetName.trim(), itemIds, weaponId, abilityId } },
      {
        onSuccess: (saved) => {
          notifications.show({ color: 'pickle', message: `Set "${saved.name ?? targetName}" salvato.` });
          onClose();
        },
        onError: (error) => {
          if (nameTaken(error)) {
            setTakenNames((names) => [...names, nameKey(targetName)]);
            // Il nome sta in cima alla modale: lo si porta in vista per correggerlo
            if (id === draft.id) {
              nameInput.current?.focus();
            }
          } else {
            setServerError(errorMessage(error));
          }
        },
      },
    );
  };

  // Item già scelto nello slot che si sta riempiendo (null se vuoto)
  const selectedOf = (slot: PickerSlot | null): Item | null => {
    if (slot === 'WEAPON') return weapon;
    if (slot === 'ABILITY') return ability;
    return slot ? (selection[slot] ?? null) : null;
  };

  const pick = (item: Item | null) => {
    if (picking === 'WEAPON') {
      setWeapon(item);
    } else if (picking === 'ABILITY') {
      setAbility(item);
    } else if (picking) {
      const slot = picking;
      setSelection((current) => {
        const others = Object.fromEntries(
          Object.entries(current).filter(([key]) => key !== slot),
        ) as SlotSelection;
        return item ? { ...others, [slot]: item } : others;
      });
    }
    setPicking(null);
  };

  const editable = (
    <Stack gap="md">
      <Group align="flex-start" gap={24}>
        <SetPieces
          slots={slots}
          pieces={Object.values(selection)}
          onPiece={(piece) => piece.specification && setPicking(piece.specification)}
          onEmpty={setPicking}
          pieceAction="edit"
          emptyLabel={(slot) => `Aggiungi ${SPECIFICATION_LABELS[slot]}`}
          showNames
        />
        <GearSlot item={weapon} onClick={() => setPicking('WEAPON')} action="edit" />
        <GearSlot kind="ABILITY" item={ability} onClick={() => setPicking('ABILITY')} action="edit" />
        {evaluation.data && <SetLevelStats levelStats={evaluation.data.levelStats} />}
      </Group>
      {evaluation.data ? (
        <>
          <CustomSetBonus set={evaluation.data} threshold={threshold} />
          <WeaponAdviceCard advice={evaluation.data.weaponAdvice} />
          <SetStatsTable
            stats={evaluation.data.stats}
            abilityStats={evaluation.data.abilityStats}
            units={units}
            trends={trends}
            abilityTrends={abilityTrends}
          />
        </>
      ) : (
        <Loader />
      )}
    </Stack>
  );
  const fixed = original && (
    <Stack gap="md">
      <Group align="flex-start" gap={24}>
        <SetPieces slots={slots} pieces={original.pieces} showNames />
        <GearSlot item={original.weapon} />
        <GearSlot kind="ABILITY" item={original.ability} />
        <SetLevelStats levelStats={original.levelStats} />
      </Group>
      <CustomSetBonus set={original} threshold={threshold} />
      <WeaponAdviceCard advice={original.weaponAdvice} />
      <SetStatsTable stats={original.stats} abilityStats={original.abilityStats} units={units} />
    </Stack>
  );

  return (
    <Modal
      opened
      onClose={onClose}
      title={draft.id === null ? 'Nuovo set' : `Modifica ${draft.name}`}
      size={original ? 1100 : 'lg'}
      fullScreen={fullScreen}
      centered={!fullScreen}
    >
      <Stack gap="md">
        <TextInput
          ref={nameInput}
          label="Nome del set"
          withAsterisk
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
          maxLength={MAX_NAME_LENGTH}
          error={name === '' ? undefined : nameError}
        />
        {!original && editable}
        {original && sideBySide && (
          <SimpleGrid cols={2} spacing="lg">
            <Paper withBorder p="sm" radius="md" bg="gray.0">
              <Title order={4} mb="sm">
                Set di partenza
              </Title>
              {fixed}
            </Paper>
            <Paper withBorder p="sm" radius="md">
              <Title order={4} mb="sm">
                Modificato
              </Title>
              {editable}
            </Paper>
          </SimpleGrid>
        )}
        {original && !sideBySide && (
          <>
            <SegmentedControl
              fullWidth
              value={view}
              onChange={setView}
              data={[
                { value: 'modified', label: 'Modificato' },
                { value: 'original', label: 'Set di partenza' },
              ]}
            />
            {view === 'modified' ? editable : fixed}
          </>
        )}

        {serverError && (
          <Text c="red" size="sm">
            {serverError}
          </Text>
        )}
        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={onClose}>
            Annulla
          </Button>
          {draft.id !== null && (
            <Button
              variant="light"
              leftSection={<IconCopy size={18} />}
              disabled={itemIds.length === 0}
              onClick={() => setAskingNewName(true)}
            >
              Salva come nuovo
            </Button>
          )}
          <Button
            leftSection={<IconDeviceFloppy size={18} />}
            disabled={nameError !== null || itemIds.length === 0 || unchanged}
            loading={census.save.isPending && !askingNewName}
            onClick={() => save(draft.id, name)}
          >
            {draft.id === null ? 'Salva' : 'Sovrascrivi'}
          </Button>
        </Group>
      </Stack>

      <SlotPickerModal
        slot={picking}
        items={items}
        weaponCategories={weaponCategories}
        selected={selectedOf(picking)}
        onPick={pick}
        onClose={() => setPicking(null)}
      />
      {askingNewName && (
        <NewNameModal
          initialName={`${name.trim()} (copia)`}
          saving={census.save.isPending}
          nameErrorOf={nameErrorOf}
          error={serverError}
          onSave={(newName) => save(null, newName)}
          onClose={() => setAskingNewName(false)}
        />
      )}
    </Modal>
  );
}

interface NewNameProps {
  initialName: string;
  saving: boolean;
  /** Errore del nome (vuoto o già usato), null se valido. */
  nameErrorOf: (name: string) => string | null;
  error: string | null;
  onSave: (name: string) => void;
  onClose: () => void;
}

/** Nome del nuovo set quando si salva una modifica senza sovrascrivere l'originale. */
function NewNameModal({ initialName, saving, nameErrorOf, error, onSave, onClose }: NewNameProps) {
  const [name, setName] = useState(initialName.slice(0, MAX_NAME_LENGTH));
  const nameError = nameErrorOf(name);
  return (
    <Modal opened onClose={onClose} title="Salva come nuovo set" centered zIndex={300}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (nameError === null) {
            onSave(name);
          }
        }}
      >
        <Stack gap="md">
          <TextInput
            label="Nome del nuovo set"
            withAsterisk
            data-autofocus
            value={name}
            onChange={(event) => setName(event.currentTarget.value)}
            maxLength={MAX_NAME_LENGTH}
            error={(name === '' ? null : nameError) ?? error ?? undefined}
          />
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={onClose}>
              Annulla
            </Button>
            <Button type="submit" disabled={nameError !== null} loading={saving}>
              Salva
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
