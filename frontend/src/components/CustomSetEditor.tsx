import {
  Button,
  Group,
  Loader,
  Modal,
  Paper,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconCopy, IconDeviceFloppy } from '@tabler/icons-react';
import { useMemo, useRef, useState, type ReactNode } from 'react';
import { ApiError } from '../api/client';
import { errorMessage, useCustomSetCensus, useGameConstants, useSetEvaluation } from '../api/queries';
import type { CustomSet, Item, LevelStats, Specification, Stat, StatUnit } from '../api/types';
import {
  alignRows,
  itemIdsOf,
  sameSelection,
  selectionOf,
  statTrends,
  type SlotSelection,
} from '../domain/customSets';
import { useFullScreenModal } from '../hooks/useFullScreenModal';
import { SPECIFICATION_LABELS } from '../i18n/labels';
import { CustomSetBonus } from './CustomSetBonus';
import { SetGearList, SetItemList } from './SetItemList';
import { SetLevelStats } from './SetLevelStats';
import { SetStatsTable } from './SetStatsTable';
import { SlotPickerModal, type PickerSlot } from './SlotPickerModal';
import { WeaponAdviceCard } from './WeaponAdviceCard';
import classes from './CustomSetEditor.module.css';

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
  const constants = useGameConstants();
  const original = draft.original;
  const modified = evaluation.data;
  // Le due tabelle hanno le stesse righe, così restano allineate nel confronto
  const aligned = useMemo(() => {
    if (!original || !modified || !constants.data) return null;
    return {
      stats: alignRows(original.stats, modified.stats, constants.data),
      abilityStats: alignRows(original.abilityStats, modified.abilityStats, constants.data, true),
    };
  }, [original, modified, constants.data]);
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

  // Sezioni nello stesso ordine dei set salvati: affiancate, ogni sezione si allinea con quella dell'altro set
  const editable: ReactNode[] = [
    <SectionTitle key="title" title={original ? 'Modificato' : null} levelStats={modified?.levelStats} />,
    modified ? <CustomSetBonus key="bonus" set={modified} threshold={threshold} /> : <div key="bonus" />,
    <SetItemList
      key="items"
      slots={slots}
      pieces={Object.values(selection)}
      onPiece={(piece) => piece.specification && setPicking(piece.specification)}
      onEmpty={setPicking}
      editable
      emptyLabel={(slot) => `Aggiungi ${SPECIFICATION_LABELS[slot]}`}
    />,
    modified ? <WeaponAdviceCard key="advice" advice={modified.weaponAdvice} /> : <div key="advice" />,
    <SetGearList
      key="gear"
      weapon={weapon}
      ability={ability}
      editable
      onClick={(kind) => setPicking(kind)}
    />,
    modified ? (
      <SetStatsTable
        key="stats"
        stats={aligned?.stats[1] ?? modified.stats}
        abilityStats={aligned?.abilityStats[1] ?? modified.abilityStats}
        units={units}
        trends={trends}
        abilityTrends={abilityTrends}
      />
    ) : (
      <Loader key="stats" />
    ),
  ];
  const fixed: ReactNode[] = original
    ? [
        <SectionTitle key="title" title="Set di partenza" levelStats={original.levelStats} />,
        <CustomSetBonus key="bonus" set={original} threshold={threshold} />,
        <SetItemList key="items" slots={slots} pieces={original.pieces} />,
        <WeaponAdviceCard key="advice" advice={original.weaponAdvice} />,
        <SetGearList key="gear" weapon={original.weapon} ability={original.ability} />,
        <SetStatsTable
          key="stats"
          stats={aligned?.stats[0] ?? original.stats}
          abilityStats={aligned?.abilityStats[0] ?? original.abilityStats}
          units={units}
        />,
      ]
    : [];

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
        {!original && <Stack gap="md">{editable}</Stack>}
        {original && sideBySide && (
          <div className={classes.compare}>
            <Paper withBorder p="sm" radius="md" bg="gray.0" className={classes.column}>
              {fixed}
            </Paper>
            <Paper withBorder p="sm" radius="md" className={classes.column}>
              {editable}
            </Paper>
          </div>
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
            <Stack gap="md">{view === 'modified' ? editable : fixed}</Stack>
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

/** Titolo del set nel confronto, con Danno e HP dal livello tra parentesi accanto. */
function SectionTitle({ title, levelStats }: { title: string | null; levelStats?: LevelStats }) {
  if (!title && !levelStats) return <div />;
  return (
    <Group gap="lg" style={{ rowGap: 2 }}>
      {title && <Title order={4}>{title}</Title>}
      {levelStats && <SetLevelStats levelStats={levelStats} />}
    </Group>
  );
}
