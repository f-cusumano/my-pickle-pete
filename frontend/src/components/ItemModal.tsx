import { Button, Group, Modal } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { IconArrowUp, IconRefresh } from '@tabler/icons-react';
import { useItemProgress } from '../api/queries';
import type { Item, Rarity, Stat, StatUnit } from '../api/types';
import { ItemDetail } from './ItemDetail';

interface Props {
  item: Item | null;
  rarities: Rarity[];
  units: Record<Stat, StatUnit>;
  onClose: () => void;
}

/** Modale di un item: promozione di rarità, reset a Comune e livello modificabile. */
export function ItemModal({ item, rarities, units, onClose }: Props) {
  const fullScreen = useMediaQuery('(max-width: 48em)');
  const progress = useItemProgress();
  const busy = progress.promote.isPending || progress.reset.isPending || progress.level.isPending;

  const confirmReset = (target: Item) =>
    modals.openConfirmModal({
      title: 'Reset della rarità',
      children: `${target.name} torna a Comune e perde i potenziamenti delle rarità superiori.`,
      labels: { confirm: 'Reset', cancel: 'Annulla' },
      confirmProps: { color: 'red' },
      onConfirm: () => progress.reset.mutate(target.id),
    });

  return (
    <Modal
      opened={item !== null}
      onClose={onClose}
      title="Dettaglio item"
      size="lg"
      fullScreen={fullScreen}
      centered
    >
      {item && (
        <>
          <ItemDetail
            item={item}
            rarities={rarities}
            units={units}
            onLevelChange={(level) => progress.level.mutate({ id: item.id, level })}
          />
          <Group justify="space-between" mt="xl" gap="sm">
            <Group gap="sm">
              <Button
                leftSection={<IconArrowUp size={18} />}
                onClick={() => progress.promote.mutate(item.id)}
                disabled={item.rarity === 'ARTIFACT'}
                loading={progress.promote.isPending}
              >
                Rarità++
              </Button>
              <Button
                variant="light"
                color="red"
                leftSection={<IconRefresh size={18} />}
                onClick={() => confirmReset(item)}
                disabled={busy || item.rarity === 'COMMON'}
              >
                Reset
              </Button>
            </Group>
            <Button variant="default" onClick={onClose}>
              Chiudi
            </Button>
          </Group>
        </>
      )}
    </Modal>
  );
}
