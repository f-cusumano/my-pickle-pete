import {
  ActionIcon,
  Alert,
  Button,
  Group,
  Loader,
  Paper,
  Stack,
  Table,
  Tabs,
  Text,
  Textarea,
  Title,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconDeviceFloppy, IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { useArmorSetCensus, useArmorSets, useGameConstants, useItemCensus, useItems } from '../api/queries';
import type { ArmorSetInfo, GameConstants, Item } from '../api/types';
import { ItemFormModal } from '../components/ItemFormModal';
import { ItemThumbnail } from '../components/ItemThumbnail';
import { thumbnailOf } from '../domain/itemImages';
import { SpecificationLabel } from '../components/SpecificationLabel';
import { ARMOR_SET_LABELS, ITEM_TYPE_LABELS } from '../i18n/labels';

/** Censimento: si inseriscono una volta gli item del gioco e gli effetti dei bonus dei set. */
export function CensusPage() {
  const constants = useGameConstants();
  if (constants.isPending) {
    return <Loader m="xl" />;
  }
  if (constants.isError) {
    return (
      <Alert color="red" title="Impossibile caricare i dati">
        Il server non risponde: controlla che il backend sia avviato.
      </Alert>
    );
  }
  return (
    <>
      <Title order={2} mb="md">
        Censimento
      </Title>
      <Tabs defaultValue="items" keepMounted={false}>
        <Tabs.List mb="md">
          <Tabs.Tab value="items">Item</Tabs.Tab>
          <Tabs.Tab value="sets">Bonus dei set</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="items">
          <ItemCensus constants={constants.data} />
        </Tabs.Panel>
        <Tabs.Panel value="sets">
          <ArmorSetCensus />
        </Tabs.Panel>
      </Tabs>
    </>
  );
}

function ItemCensus({ constants }: { constants: GameConstants }) {
  const items = useItems('ARMOR_SET');
  const census = useItemCensus();
  const [editing, setEditing] = useState<number | 'new' | null>(null);
  const editedItem =
    typeof editing === 'number' ? (items.data?.find((item) => item.id === editing) ?? null) : null;

  const confirmDelete = (item: Item) =>
    modals.openConfirmModal({
      title: 'Elimina item',
      children: `${item.name} verrà eliminato con i suoi potenziamenti e tolto dai set custom che lo indossano.`,
      labels: { confirm: 'Elimina', cancel: 'Annulla' },
      confirmProps: { color: 'red' },
      onConfirm: () => census.remove.mutate(item.id),
    });

  return (
    <Stack>
      <Group justify="space-between">
        <Text size="sm" c="dimmed">
          {items.data ? `${String(items.data.length)} item censiti` : ''}
        </Text>
        <Button leftSection={<IconPlus size={18} />} onClick={() => setEditing('new')}>
          Crea item
        </Button>
      </Group>
      {items.isPending && <Loader />}
      {items.data && items.data.length > 0 && (
        <Paper withBorder radius="md">
          <Table.ScrollContainer minWidth={640} type="native">
            <Table verticalSpacing="xs">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th w={60} />
                  <Table.Th>Nome</Table.Th>
                  <Table.Th>Tipologia</Table.Th>
                  <Table.Th>Specifica</Table.Th>
                  <Table.Th>Set</Table.Th>
                  <Table.Th w={96} />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {items.data.map((item) => (
                  <Table.Tr key={item.id}>
                    <Table.Td>
                      <ItemThumbnail {...thumbnailOf(item)} size={40} plain summary={item} />
                    </Table.Td>
                    <Table.Td fw={700}>{item.name}</Table.Td>
                    <Table.Td>{ITEM_TYPE_LABELS[item.type]}</Table.Td>
                    <Table.Td>
                      <SpecificationLabel specification={item.specification} />
                    </Table.Td>
                    <Table.Td>{item.armorSet ? ARMOR_SET_LABELS[item.armorSet] : '-'}</Table.Td>
                    <Table.Td>
                      <Group gap={4} wrap="nowrap">
                        <ActionIcon
                          variant="subtle"
                          onClick={() => setEditing(item.id)}
                          aria-label={`Modifica ${item.name}`}
                        >
                          <IconPencil size={18} />
                        </ActionIcon>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => confirmDelete(item)}
                          aria-label={`Elimina ${item.name}`}
                        >
                          <IconTrash size={18} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Paper>
      )}
      {(editing === 'new' || editedItem !== null) && (
        <ItemFormModal constants={constants} item={editedItem} onClose={() => setEditing(null)} />
      )}
    </Stack>
  );
}

function ArmorSetCensus() {
  const armorSets = useArmorSets();
  if (armorSets.isPending) {
    return <Loader />;
  }
  if (armorSets.isError) {
    return <Alert color="red">Impossibile caricare i set.</Alert>;
  }
  return (
    <Stack>
      <Text size="sm" c="dimmed">
        Effetto che si attiva indossando almeno 4 pezzi dello stesso set (solo testo).
      </Text>
      {armorSets.data.map((info) => (
        <ArmorSetBonusEditor key={`${info.armorSet}-${info.bonusDescription ?? ''}`} info={info} />
      ))}
    </Stack>
  );
}

function ArmorSetBonusEditor({ info }: { info: ArmorSetInfo }) {
  const save = useArmorSetCensus();
  const [value, setValue] = useState(info.bonusDescription ?? '');
  const changed = value.trim() !== (info.bonusDescription ?? '');
  return (
    <Paper withBorder p="sm" radius="md">
      <Group align="flex-end" wrap="nowrap">
        <Textarea
          label={ARMOR_SET_LABELS[info.armorSet]}
          placeholder="Effetto non ancora censito"
          value={value}
          onChange={(event) => setValue(event.currentTarget.value)}
          autosize
          minRows={1}
          maxLength={500}
          style={{ flex: 1 }}
        />
        <ActionIcon
          size="lg"
          mb={2}
          disabled={!changed}
          loading={save.isPending}
          onClick={() => save.mutate({ armorSet: info.armorSet, bonusDescription: value })}
          aria-label={`Salva bonus ${ARMOR_SET_LABELS[info.armorSet]}`}
        >
          <IconDeviceFloppy size={18} />
        </ActionIcon>
      </Group>
    </Paper>
  );
}
