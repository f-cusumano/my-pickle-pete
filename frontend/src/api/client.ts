import type {
  ArmorSet,
  ArmorSetInfo,
  ErrorResponse,
  FullSet,
  GameConstants,
  Item,
  ItemRequest,
  ItemSortOrder,
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

/** Chiamate REST del backend; in sviluppo Vite inoltra /api al backend, in produzione lo serve lo stesso host. */
export function createApi(fetchApi: FetchApi = (input, init) => fetch(input, init)) {
  async function call<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetchApi(path, init);
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
    gameConstants: () => call<GameConstants>('/api/constants/game'),
    items: (sortOrder: ItemSortOrder) => call<Item[]>(`/api/item/list?sortOrder=${sortOrder}`),
    createItem: (request: ItemRequest) => call<Item>('/api/item', json('POST', request)),
    updateItem: (itemId: number, request: ItemRequest) =>
      call<Item>(`/api/item?${id(itemId)}`, json('PUT', request)),
    deleteItem: (itemId: number) => call<undefined>(`/api/item?${id(itemId)}`, { method: 'DELETE' }),
    promoteRarity: (itemId: number) =>
      call<Item>(`/api/item/promote-rarity?${id(itemId)}`, { method: 'POST' }),
    resetRarity: (itemId: number) => call<Item>(`/api/item/reset-rarity?${id(itemId)}`, { method: 'POST' }),
    updateLevel: (itemId: number, level: number) =>
      call<Item>(`/api/item/level?${id(itemId)}&level=${String(level)}`, { method: 'PUT' }),
    saveImage: (itemId: number, file: File) => {
      const form = new FormData();
      form.append('file', file);
      return call<Item>(`/api/item/image?${id(itemId)}`, { method: 'PUT', body: form });
    },
    deleteImage: (itemId: number) => call<Item>(`/api/item/image?${id(itemId)}`, { method: 'DELETE' }),
    armorSets: () => call<ArmorSetInfo[]>('/api/armor-set/list'),
    updateArmorSet: (armorSet: ArmorSet, bonusDescription: string) =>
      call<ArmorSetInfo>(`/api/armor-set?armorSet=${armorSet}`, json('PUT', { bonusDescription })),
    fullSets: () => call<FullSet[]>('/api/armor-set/full-set/list'),
  };
}

export type Api = ReturnType<typeof createApi>;

/** URL dell'immagine dell'item; la versione cambia a ogni nuovo caricamento e scavalca la cache del browser. */
export function imageUrl(item: Pick<Item, 'id' | 'imageVersion'>): string | null {
  return item.imageVersion === null
    ? null
    : `/api/item/image?id=${String(item.id)}&v=${String(item.imageVersion)}`;
}
