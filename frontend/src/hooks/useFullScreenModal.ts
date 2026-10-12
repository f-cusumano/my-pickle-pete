import { useMediaQuery } from '@mantine/hooks';

/**
 * Modali a schermo intero su cellulare. Il valore si legge subito (non dopo il primo render):
 * altrimenti la modale si apre centrata e più larga dello schermo e poi cambia forma.
 * A schermo intero va tolto `centered`: con entrambi i menu a tendina si aprono spostati a destra.
 */
export function useFullScreenModal(): boolean {
  return useMediaQuery('(max-width: 48em)', false, { getInitialValueInEffect: false });
}
