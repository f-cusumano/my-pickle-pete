import type {
  ArmorSet,
  ArmorSetInfo,
  BestSetMode,
  BestSetRequest,
  CurrentUser,
  CustomSet,
  CustomSetRequest,
  ErrorResponse,
  FullSet,
  GameConstants,
  Item,
  ItemRequest,
  ItemSortOrder,
  LoginRequest,
  PasswordRequest,
  Rarity,
  RegisterRequest,
  UserProfile,
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

/** Token CSRF che il backend mette nel cookie XSRF-TOKEN e vuole indietro nell'header delle scritture. */
function csrfToken(): string | null {
  const cookie = document.cookie.split('; ').find((entry) => entry.startsWith('XSRF-TOKEN='));
  return cookie ? decodeURIComponent(cookie.substring('XSRF-TOKEN='.length)) : null;
}

function withCsrf(init?: RequestInit): RequestInit | undefined {
  const method = init?.method ?? 'GET';
  const token = csrfToken();
  if (method === 'GET' || token === null) {
    return init;
  }
  const headers = new Headers(init?.headers);
  headers.set('X-XSRF-TOKEN', token);
  return { ...init, headers };
}

/**
 * Chiamate REST del backend; in sviluppo Vite inoltra le API al backend, in produzione lo serve lo stesso host.
 * {@code onUnauthorized} scatta quando la sessione è scaduta (401 fuori dal login), per tornare alla pagina di accesso.
 */
export function createApi(
  fetchApi: FetchApi = (input, init) => fetch(input, init),
  onUnauthorized: () => void = () => undefined,
) {
  async function call<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetchApi(`${API_BASE}${path}`, withCsrf(init));
    if (response.status === 401 && !path.startsWith('/auth/')) {
      onUnauthorized();
    }
    if (!response.ok) {
      let body: ErrorResponse | null = null;
      try {
        body = (await response.json()) as ErrorResponse;
      } catch {
        // corpo assente o non JSON: resta solo lo status
      }
      throw new ApiError(response.status, body);
    }
    // 204 e logout (200 senza corpo): nessun JSON da leggere
    const text = await response.text();
    return (text === '' ? undefined : JSON.parse(text)) as T;
  }

  const json = (method: string, body: unknown): RequestInit => ({
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const id = (itemId: number) => `id=${String(itemId)}`;

  /** Utente della sessione, null se non c'è (pagina di accesso). */
  async function currentUser(): Promise<CurrentUser | null> {
    try {
      return await call<CurrentUser>('/user');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        return null;
      }
      throw error;
    }
  }

  return {
    currentUser,
    login: (request: LoginRequest) => call<CurrentUser>('/auth/login', json('POST', request)),
    register: (request: RegisterRequest) => call<CurrentUser>('/auth/register', json('POST', request)),
    logout: () => call<undefined>('/auth/logout', { method: 'POST' }),
    updateProfile: (profile: UserProfile) => call<CurrentUser>('/user', json('PUT', profile)),
    changePassword: (request: PasswordRequest) => call<undefined>('/user/password', json('PUT', request)),
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
    evaluateCustomSet: (itemIds: number[], weaponId: number | null, abilityId: number | null) =>
      call<CustomSet>('/custom-set/evaluate', json('POST', { itemIds, weaponId, abilityId })),
    bestCustomSets: (mode: BestSetMode, request: BestSetRequest) =>
      call<CustomSet[]>(`/custom-set/calculate-best-${mode}`, json('POST', request)),
  };
}

export type Api = ReturnType<typeof createApi>;
