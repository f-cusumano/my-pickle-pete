import type {
  ArmorSet,
  ArmorSetInfo,
  BestSetMode,
  BestSetRequest,
  CustomSet,
  CustomSetRequest,
  ErrorResponse,
  FullSet,
  GameConstants,
  Item,
  ItemRequest,
  ItemSortOrder,
  Rarity,
} from './types';

/** Errore restituito dal backend, con il codice applicativo da tradurre per l'utente. */
export class ApiError extends Error {
  readonly status: number;
  readonly body: ErrorResponse | null;

  constructor(status: number, body: ErrorResponse | null) {
    super(body?.messages.join(' ') ?? `HTTP ${String(status)}`);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

/** Funzione fetch iniettabile (finta nei test). */
export type FetchApi = (input: string, init?: RequestInit) => Promise<Response>;

/** Prefisso delle API sotto la base dell'app (/my-pickle-pete/api). */
export const API_BASE = `${import.meta.env.BASE_URL}api`;

/** Chiamate REST del backend; in sviluppo Vite inoltra le API al backend, in produzione lo serve lo stesso host. */
export function createApi(fetchApi: FetchApi = (input, init) => fetch(input, init)) {
  async function call<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetchApi(`${API_BASE}${path}`, init);
    if (!response.ok) {
      let body: ErrorResponse | null = null;
      try {
        body = (await response.json()) as ErrorResponse;
      } catch {
        // corpo assente o non JSON: resta solo lo status
      }
      throw new ApiError(response.status, body);
    }
    if (response.status === 204) {
      return undefined as T;
    }
    return (await response.json()) as T;
  }

  const json = (method: string, body: unknown): RequestInit => ({
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const id = (itemId: number) => `id=${String(itemId)}`;

  return {
    gameConstants: () => call<GameConstants>('/constants/game'),
    items: (sortOrder: ItemSortOrder) => call<Item[]>(`/item/list?sortOrder=${sortOrder}`),
    createItem: (request: ItemRequest) => call<Item>('/item', json('POST', request)),
    updateItem: (itemId: number, request: ItemRequest) =>
      call<Item>(`/item?${id(itemId)}`, json('PUT', request)),
    deleteItem: (itemId: number) => call<undefined>(`/item?${id(itemId)}`, { method: 'DELETE' }),
    updateRarity: (itemId: number, rarity: Rarity) =>
      call<Item>(`/item/rarity?${id(itemId)}&rarity=${rarity}`, { method: 'PUT' }),
    updateLevel: (itemId: number, level: number) =>
      call<Item>(`/item/level?${id(itemId)}&level=${String(level)}`, { method: 'PUT' }),
    armorSets: () => call<ArmorSetInfo[]>('/armor-set/list'),
    updateArmorSet: (armorSet: ArmorSet, bonusDescription: string) =>
      call<ArmorSetInfo>(`/armor-set?armorSet=${armorSet}`, json('PUT', { bonusDescription })),
    fullSets: () => call<FullSet[]>('/armor-set/full-set/list'),
    customSets: () => call<CustomSet[]>('/custom-set/list'),
    createCustomSet: (request: CustomSetRequest) => call<CustomSet>('/custom-set', json('POST', request)),
    updateCustomSet: (setId: number, request: CustomSetRequest) =>
      call<CustomSet>(`/custom-set?${id(setId)}`, json('PUT', request)),
    deleteCustomSet: (setId: number) => call<undefined>(`/custom-set?${id(setId)}`, { method: 'DELETE' }),
    evaluateCustomSet: (itemIds: number[], weaponId: number | null) =>
      call<CustomSet>('/custom-set/evaluate', json('POST', { itemIds, weaponId })),
    bestCustomSets: (mode: BestSetMode, request: BestSetRequest) =>
      call<CustomSet[]>(`/custom-set/calculate-best-${mode}`, json('POST', request)),
  };
}

export type Api = ReturnType<typeof createApi>;
