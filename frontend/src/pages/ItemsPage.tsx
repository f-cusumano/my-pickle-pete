import {
  ActionIcon,
  Alert,
  Button,
  Checkbox,
  Group,
  Loader,
  Paper,
  Select,
  Table,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { IconEye, IconInfoCircle } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useGameConstants, useItems } from '../api/queries';
import type { GameConstants, Item, ItemSortOrder } from '../api/types';
import { ColumnFilter } from '../components/ColumnFilter';
import { ItemModal } from '../components/ItemModal';
import { ItemThumbnail } from '../components/ItemThumbnail';
import { thumbnailOf } from '../domain/itemImages';
import { RarityBadge } from '../components/RarityBadge';
import { SelectedItemsModal } from '../components/SelectedItemsModal';
import { SpecificationLabel } from '../components/SpecificationLabel';
import {
  applyFilters,
  filterOptions,
  NO_FILTERS,
  NONE,
  type ColumnFilters,
  type FilterColumn,
} from '../domain/filters';
import { formatLevel } from '../domain/format';
import { keepVisible, toggleAll, toggleOne } from '../domain/selection';
import { statUnits } from '../domain/units';
import {
  ARMOR_SET_LABELS,
  ITEM_TYPE_LABELS,
  RARITY_LABELS,
  SORT_ORDER_LABELS,
  SPECIFICATION_LABELS,
  STAT_LABELS,
} from '../i18n/labels';
import classes from './ItemsPage.module.css';

const FILTER_LABELS: Record<FilterColumn, (value: string) => string> = {
  rarity: (value) => RARITY_LABELS[value as keyof typeof RARITY_LABELS],
  type: (value) => ITEM_TYPE_LABELS[value as keyof typeof ITEM_TYPE_LABELS],
  specification: (value) =>
    value === NONE ? '-nessuno-' : SPECIFICATION_LABELS[value as keyof typeof SPECIFICATION_LABELS],
  armorSet: (value) =>
    value === NONE ? '-nessuno-' : ARMOR_SET_LABELS[value as keyof typeof ARMOR_SET_LABELS],
};

interface Props {
  onGoToCensus: () => void;
}

/** Elenco non paginato di tutti gli item indossabili, con ordinamenti, filtri per colonna e selezione. */
export function ItemsPage({ onGoToCensus }: Props) {
  const constants = useGameConstants();
  const [sortOrder, setSortOrder] = useState<ItemSortOrder>('ARMOR_SET');
  const items = useItems(sortOrder);

  if (constants.isPending || items.isPending) {
    return <Loader m="xl" />;
  }
  if (constants.isError || items.isError) {
    return (
      <Alert color="red" title="Impossibile caricare gli item">
        Il server non risponde: controlla che il backend sia avviato.
      </Alert>
    );
  }
  return (
    <ItemsTable
      constants={constants.data}
      items={items.data}
      sortOrder={sortOrder}
      onSortOrderChange={setSortOrder}
      onGoToCensus={onGoToCensus}
    />
  );
}

interface TableProps {
  constants: GameConstants;
  items: Item[];
  sortOrder: ItemSortOrder;
  onSortOrderChange: (sortOrder: ItemSortOrder) => void;
  onGoToCensus: () => void;
}

function ItemsTable({ constants, items, sortOrder, onSortOrderChange, onGoToCensus }: TableProps) {
  const [filters, setFilters] = useState<ColumnFilters>(NO_FILTERS);
  const [selected, setSelected] = useState<Set<number>>(() => new Set());
  const [openItemId, setOpenItemId] = useState<number | null>(null);
  const [showSelected, setShowSelected] = useState(false);
  const units = useMemo(() => statUnits(constants), [constants]);
  const rarities = useMemo(() => constants.rarities.map((rarity) => rarity.code), [constants]);
  const visible = useMemo(() => applyFilters(items, filters), [items, filters]);
  const visibleIds = visible.map((item) => item.id);

  const changeFilter = (column: FilterColumn, values: string[]) => {
    const next = { ...filters, [column]: values };
    setFilters(next);
    setSelected((current) =>
      keepVisible(
        current,
        applyFilters(items, next).map((item) => item.id),
      ),
    );
  };

  const header = (label: string, column: FilterColumn) => (
    <div className={classes.headerWithFilter}>
      <span>{label}</span>
      <ColumnFilter
        label={label}
        options={filterOptions(items, column, constants, sortOrder)}
        selected={filters[column]}
        optionLabel={FILTER_LABELS[column]}
        onChange={(values) => changeFilter(column, values)}
      />
    </div>
  );

  const openItem = items.find((item) => item.id === openItemId) ?? null;
  const selectedItems = visible.filter((item) => selected.has(item.id));

  return (
    <>
      <Group justify="space-between" align="flex-end" mb="md" gap="sm">
        <Title order={2}>Items</Title>
        <Select
          label="Ordinamento"
          value={sortOrder}
          onChange={(value) => value && onSortOrderChange(value)}
          data={constants.sortOrders.map((order) => ({
            value: order.code,
            label: SORT_ORDER_LABELS[order.code],
          }))}
          allowDeselect={false}
          w={200}
        />
      </Group>

      {items.length === 0 ? (
        <Alert icon={<IconInfoCircle />} title="Nessun item censito" color="pickle">
          <Text size="sm" mb="sm">
            Gli item si inseriscono una volta sola dalla sezione Censimento.
          </Text>
          <Button size="xs" onClick={onGoToCensus}>
            Vai al censimento
          </Button>
        </Alert>
      ) : (
        <Paper withBorder radius="md">
          <Table.ScrollContainer minWidth={980} type="native">
            <Table stickyHeader highlightOnHover verticalSpacing="xs">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th className={classes.stickyImage} />
                  <Table.Th className={classes.stickyName}>Nome</Table.Th>
                  <Table.Th>{header('Rarità', 'rarity')}</Table.Th>
                  <Table.Th>Livello</Table.Th>
                  <Table.Th>Caratteristica</Table.Th>
                  <Table.Th>{header('Tipologia', 'type')}</Table.Th>
                  <Table.Th>{header('Specifica', 'specification')}</Table.Th>
                  <Table.Th>{header('Set', 'armorSet')}</Table.Th>
                  <Table.Th className={classes.selectionHeader}>
                    <div className={classes.selectionHeaderInner}>
                      <Checkbox
                        aria-label="Seleziona tutte le righe visibili"
                        checked={selected.size > 0}
                        onChange={() => setSelected((current) => toggleAll(current, visibleIds))}
                        color="pickle"
                      />
                    </div>
                    <Tooltip label="Vedi gli item selezionati" disabled={selected.size === 0}>
                      <ActionIcon
                        className={classes.eye}
                        variant="subtle"
                        color={selected.size > 0 ? 'pickle' : 'gray'}
                        disabled={selected.size === 0}
                        onClick={() => setShowSelected(true)}
                        aria-label="Vedi gli item selezionati"
                      >
                        <IconEye size={18} />
                      </ActionIcon>
                    </Tooltip>
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {visible.map((item) => (
                  <Table.Tr key={item.id} className={classes.row} onClick={() => setOpenItemId(item.id)}>
                    <Table.Td className={classes.stickyImage}>
                      <ItemThumbnail {...thumbnailOf(item)} summary={item} />
                    </Table.Td>
                    <Table.Td className={classes.stickyName}>
                      <Text fw={700} size="sm">
                        {item.name}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <RarityBadge rarity={item.rarity} />
                    </Table.Td>
                    <Table.Td style={{ whiteSpace: 'nowrap' }}>
                      {formatLevel(item.level, item.maxLevel)}
                    </Table.Td>
                    <Table.Td>{STAT_LABELS[item.baseStat]}</Table.Td>
                    <Table.Td>{ITEM_TYPE_LABELS[item.type]}</Table.Td>
                    <Table.Td>
                      <SpecificationLabel specification={item.specification} />
                    </Table.Td>
                    <Table.Td>{item.armorSet ? ARMOR_SET_LABELS[item.armorSet] : '-'}</Table.Td>
                    <Table.Td className={classes.selectionCell} onClick={(event) => event.stopPropagation()}>
                      <div className={classes.selectionCellInner}>
                        <Checkbox
                          aria-label={`Seleziona ${item.name}`}
                          checked={selected.has(item.id)}
                          onChange={() => setSelected((current) => toggleOne(current, item.id))}
                          color="pickle"
                        />
                      </div>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
          {visible.length === 0 && (
            <Text c="dimmed" ta="center" p="md">
              Nessun item corrisponde ai filtri.
            </Text>
          )}
        </Paper>
      )}

      <ItemModal item={openItem} rarities={rarities} units={units} onClose={() => setOpenItemId(null)} />
      <SelectedItemsModal
        opened={showSelected && selectedItems.length > 0}
        items={selectedItems}
        rarities={rarities}
        units={units}
        onClose={() => setShowSelected(false)}
      />
    </>
  );
}
