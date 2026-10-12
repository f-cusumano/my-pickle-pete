import { Button, Divider, Group, Modal, ScrollArea, Stack } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { Fragment } from 'react';
import type { Item, Rarity, Stat, StatUnit } from '../api/types';
import { ItemDetail } from './ItemDetail';

interface Props {
  opened: boolean;
  items: Item[];
  rarities: Rarity[];
  units: Record<Stat, StatUnit>;
  onClose: () => void;
}

/** Item selezionati uno dopo l'altro, in sola lettura, con "Chiudi" in basso a destra. */
export function SelectedItemsModal({ opened, items, rarities, units, onClose }: Props) {
  const fullScreen = useMediaQuery('(max-width: 48em)');
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Item selezionati (${String(items.length)})`}
      size="lg"
      fullScreen={fullScreen}
      centered
      scrollAreaComponent={ScrollArea.Autosize}
    >
      <Stack gap="lg">
        {items.map((item, index) => (
          <Fragment key={item.id}>
            {index > 0 && <Divider size="sm" />}
            <ItemDetail item={item} rarities={rarities} units={units} />
          </Fragment>
        ))}
      </Stack>
      <Group justify="flex-end" mt="xl">
        <Button variant="default" onClick={onClose}>
          Chiudi
        </Button>
      </Group>
    </Modal>
  );
}
