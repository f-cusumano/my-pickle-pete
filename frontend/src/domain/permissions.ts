import type { UserRole } from '../api/types';

/** Cosa vede e cosa può fare ciascun ruolo: il backend applica le stesse regole (403 sulle altre). */
export interface Permissions {
  /** Censimento di item ed effetti dei set, pezzi mancanti dei Full Set. */
  canCensus: boolean;
  /** Rarità e livello raggiunti e set custom. */
  hasProgress: boolean;
}

const PERMISSIONS: Record<UserRole, Permissions> = {
  ADMIN: { canCensus: true, hasProgress: false },
  USER: { canCensus: false, hasProgress: true },
};

export function permissionsOf(role: UserRole): Permissions {
  return PERMISSIONS[role];
}
