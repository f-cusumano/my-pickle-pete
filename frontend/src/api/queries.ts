import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import type { ArmorSet, Item, ItemRequest, ItemSortOrder } from './types';
import { useApi } from './context';
import { ApiError } from './client';
import { ERROR_MESSAGES } from '../i18n/labels';

export const KEYS = {
  constants: ['constants'] as const,
  items: ['items'] as const,
  itemList: (sortOrder: ItemSortOrder) => ['items', sortOrder] as const,
  armorSets: ['armor-sets'] as const,
  fullSets: ['full-sets'] as const,
};

/** Messaggio in italiano per l'utente, con il dettaglio del backend per gli errori di validazione. */
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError && error.body) {
    const base = ERROR_MESSAGES[error.body.code];
    return error.body.code === 'VALIDATION_FAILED' ? `${base} ${error.body.messages.join(' ')}` : base;
  }
  return 'Impossibile contattare il server.';
}

export function notifyError(error: unknown) {
  notifications.show({ color: 'red', title: 'Operazione non riuscita', message: errorMessage(error) });
}

export function useGameConstants() {
  const api = useApi();
  return useQuery({ queryKey: KEYS.constants, queryFn: api.gameConstants, staleTime: Infinity });
}

export function useItems(sortOrder: ItemSortOrder) {
  const api = useApi();
  // Cambiando ordinamento si tiene l'elenco precedente finché arriva il nuovo: filtri e selezione restano
  return useQuery({
    queryKey: KEYS.itemList(sortOrder),
    queryFn: () => api.items(sortOrder),
    placeholderData: keepPreviousData,
  });
}

export function useArmorSets() {
  const api = useApi();
  return useQuery({ queryKey: KEYS.armorSets, queryFn: api.armorSets });
}

export function useFullSets() {
  const api = useApi();
  return useQuery({ queryKey: KEYS.fullSets, queryFn: api.fullSets });
}

/** Dopo ogni modifica di un item si rileggono elenchi e set (pochi dati, nessuna cache da riconciliare). */
function useInvalidateItems() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: KEYS.items }),
      queryClient.invalidateQueries({ queryKey: KEYS.fullSets }),
    ]);
}

export function useItemProgress() {
  const api = useApi();
  const invalidate = useInvalidateItems();
  const options = { onSuccess: invalidate, onError: notifyError };
  return {
    promote: useMutation({ mutationFn: (id: number) => api.promoteRarity(id), ...options }),
    reset: useMutation({ mutationFn: (id: number) => api.resetRarity(id), ...options }),
    level: useMutation({
      mutationFn: ({ id, level }: { id: number; level: number }) => api.updateLevel(id, level),
      ...options,
    }),
  };
}

export function useItemCensus() {
  const api = useApi();
  const invalidate = useInvalidateItems();
  return {
    save: useMutation({
      mutationFn: async ({
        id,
        request,
        image,
      }: {
        id: number | null;
        request: ItemRequest;
        image: File | null;
      }) => {
        const saved: Item = id === null ? await api.createItem(request) : await api.updateItem(id, request);
        if (!image) {
          return saved;
        }
        try {
          return await api.saveImage(saved.id, image);
        } catch (error) {
          notifyError(error); //L'item è salvato: si segnala solo l'immagine non caricata
          return saved;
        }
      },
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: number) => api.deleteItem(id),
      onSuccess: invalidate,
      onError: notifyError,
    }),
    removeImage: useMutation({
      mutationFn: (id: number) => api.deleteImage(id),
      onSuccess: invalidate,
      onError: notifyError,
    }),
  };
}

export function useArmorSetCensus() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ armorSet, bonusDescription }: { armorSet: ArmorSet; bonusDescription: string }) =>
      api.updateArmorSet(armorSet, bonusDescription),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: KEYS.armorSets }),
        queryClient.invalidateQueries({ queryKey: KEYS.fullSets }),
      ]),
    onError: notifyError,
  });
}
