import { useCurrentUser } from '../api/queries';
import { permissionsOf, type Permissions } from '../domain/permissions';

const NONE: Permissions = { canCensus: false, hasProgress: false };

/** Permessi dell'utente della sessione (nessuno finché non è caricato). */
export function usePermissions(): Permissions {
  const user = useCurrentUser();
  return user.data ? permissionsOf(user.data.role) : NONE;
}
