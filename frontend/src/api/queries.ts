import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import type {
  ArmorSet,
  BestSetMode,
  BestSetRequest,
  CurrentUser,
  CustomSetRequest,
  Item,
  ItemRequest,
  ItemSortOrder,
  LoginRequest,
  PasswordRequest,
  Rarity,
  RegisterRequest,
  UserProfile,
} from './types';
import { useApi } from './context';
import { ApiError } from './client';
import { ERROR_MESSAGES } from '../i18n/labels';

export const KEYS = {
  user: ['user'] as const,
  constants: ['constants'] as const,
  items: ['items'] as const,
  itemList: (sortOrder: ItemSortOrder) => ['items', sortOrder] as const,
  armorSets: ['armor-sets'] as const,
  fullSets: ['full-sets'] as const,
  customSets: ['custom-sets'] as const,
  setEvaluation: (itemIds: number[], weaponId: number | null, abilityId: number | null) =>
    ['custom-sets', 'evaluate', weaponId, abilityId, ...itemIds] as const,
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

/** Utente della sessione: null finché non si accede. */
export function useCurrentUser() {
  const api = useApi();
  return useQuery({ queryKey: KEYS.user, queryFn: api.currentUser, staleTime: Infinity });
}

/**
 * Login, registrazione e logout: cambiando utente si buttano i dati in cache (progressi e set sono suoi) e l'utente
 * nuovo (o null) fa ridisegnare l'app. La query dell'utente resta: è quella che l'app sta osservando.
 */
export function useSession() {
  const api = useApi();
  const queryClient = useQueryClient();
  const switchTo = (user: CurrentUser | null) => {
    queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== KEYS.user[0] });
    queryClient.setQueryData(KEYS.user, user);
  };
  return {
    login: useMutation({ mutationFn: (request: LoginRequest) => api.login(request), onSuccess: switchTo }),
    register: useMutation({ mutationFn: (request: RegisterRequest) => api.register(request), onSuccess: switchTo }),
    logout: useMutation({ mutationFn: api.logout, onSuccess: () => switchTo(null), onError: notifyError }),
  };
}

export function useProfile() {
  const api = useApi();
  const queryClient = useQueryClient();
  return {
    update: useMutation({
      mutationFn: (profile: UserProfile) => api.updateProfile(profile),
      onSuccess: (user) => queryClient.setQueryData(KEYS.user, user),
    }),
    password: useMutation({ mutationFn: (request: PasswordRequest) => api.changePassword(request) }),
  };
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

export function useCustomSets() {
  const api = useApi();
  return useQuery({ queryKey: KEYS.customSets, queryFn: api.customSets });
}

/**
 * Caratteristiche di un set non salvato (pezzi, arma e abilità facoltative);
 * cambiando pezzi si tiene il risultato precedente finché arriva il nuovo.
 */
export function useSetEvaluation(itemIds: number[], weaponId: number | null, abilityId: number | null) {
  const api = useApi();
  return useQuery({
    queryKey: KEYS.setEvaluation(itemIds, weaponId, abilityId),
    queryFn: () => api.evaluateCustomSet(itemIds, weaponId, abilityId),
    placeholderData: keepPreviousData,
  });
}

/** Dopo ogni modifica di un item si rileggono elenchi e set (pochi dati, nessuna cache da riconciliare). */
function useInvalidateItems() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: KEYS.items }),
      queryClient.invalidateQueries({ queryKey: KEYS.fullSets }),
      queryClient.invalidateQueries({ queryKey: KEYS.customSets }),
    ]);
}

/**
 * Rarità e livello dell'item aperto in modale: si rilegge subito solo l'elenco degli item,
 * i set si aggiornano con useRefreshSets alla chiusura della modale.
 */
export function useItemProgress(onSaved: (item: Item) => void) {
  const api = useApi();
  const queryClient = useQueryClient();
  const options = {
    onSuccess: (item: Item) => {
      onSaved(item);
      return queryClient.invalidateQueries({ queryKey: KEYS.items });
    },
    onError: notifyError,
  };
  return {
    rarity: useMutation({
      mutationFn: ({ id, rarity }: { id: number; rarity: Rarity }) => api.updateRarity(id, rarity),
      ...options,
    }),
    level: useMutation({
      mutationFn: ({ id, level }: { id: number; level: number }) => api.updateLevel(id, level),
      ...options,
    }),
  };
}

/** Rilettura dei set che possono contenere un item cambiato (Full Sets e Custom Sets). */
export function useRefreshSets() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: KEYS.fullSets }),
      queryClient.invalidateQueries({ queryKey: KEYS.customSets }),
    ]);
}

export function useItemCensus() {
  const api = useApi();
  const invalidate = useInvalidateItems();
  return {
    save: useMutation({
      mutationFn: ({ id, request }: { id: number | null; request: ItemRequest }) =>
        id === null ? api.createItem(request) : api.updateItem(id, request),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: number) => api.deleteItem(id),
      onSuccess: invalidate,
      onError: notifyError,
    }),
  };
}

export function useCustomSetCensus() {
  const api = useApi();
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: KEYS.customSets });
  return {
    save: useMutation({
      mutationFn: ({ id, request }: { id: number | null; request: CustomSetRequest }) =>
        id === null ? api.createCustomSet(request) : api.updateCustomSet(id, request),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: number) => api.deleteCustomSet(id),
      onSuccess: invalidate,
      onError: notifyError,
    }),
  };
}

export function useBestSets() {
  const api = useApi();
  return useMutation({
    mutationFn: ({ mode, request }: { mode: BestSetMode; request: BestSetRequest }) =>
      api.bestCustomSets(mode, request),
    onError: notifyError,
  });
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
        queryClient.invalidateQueries({ queryKey: KEYS.customSets }),
      ]),
    onError: notifyError,
  });
}
