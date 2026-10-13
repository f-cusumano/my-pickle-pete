import { Button, Group, Modal } from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import { useFullScreenModal } from '../hooks/useFullScreenModal';
import { useGameConstants, useItemProgress, useRefreshSets } from '../api/queries';
import type { Item, Rarity, Stat, StatUnit } from '../api/types';
import { ItemDetail } from './ItemDetail';

interface Props {
  item: Item | null;
  rarities: Rarity[];
  units: Record<Stat, StatUnit>;
  onClose: () => void;
}

/**
 * Modale di un item: rarità cliccabili e livello modificabile.
 * I set che contengono l'item si rileggono alla chiusura, se qualcosa è cambiato.
 */
export function ItemModal({ item, rarities, units, onClose }: Props) {
  const fullScreen = useFullScreenModal();
  const constants = useGameConstants();
  const refreshSets = useRefreshSets();
  // Ultimo salvataggio: la modale lo mostra subito anche se l'elenco da cui è aperta non è ancora riletto
  const [saved, setSaved] = useState<Item | null>(null);
  const changed = useRef(false);
  const opened = useRef(false);
  useEffect(() => {
    opened.current = item !== null;
  });
  const progress = useItemProgress((updated) => {
    setSaved(updated);
    if (opened.current) {
      changed.current = true;
    } else {
      // Livello salvato alla chiusura (frecce appena usate): la modale è già chiusa
      void refreshSets();
    }
  });
  const shown = item && saved?.id === item.id ? saved : item;
  const busy = progress.rarity.isPending || progress.level.isPending;

  const close = () => {
    if (changed.current) {
      changed.current = false;
      void refreshSets();
    }
    setSaved(null);
    onClose();
  };

  return (
    <Modal
      opened={shown !== null}
      onClose={close}
      title="Dettaglio item"
      size="lg"
      fullScreen={fullScreen}
      centered={!fullScreen}
    >
      {shown && (
        <>
          <ItemDetail
            item={shown}
            rarities={rarities}
            units={units}
            editing={
              constants.data && {
                baseStatPerLevel: constants.data.baseStatPerLevel,
                busy,
                onRarityChange: (rarity) => {
                  if (rarity !== shown.rarity) {
                    progress.rarity.mutate({ id: shown.id, rarity });
                  }
                },
                onLevelChange: (level) => progress.level.mutate({ id: shown.id, level }),
              }
            }
          />
          <Group justify="flex-end" mt="xl">
            <Button variant="default" onClick={close}>
              Chiudi
            </Button>
          </Group>
        </>
      )}
    </Modal>
  );
}
