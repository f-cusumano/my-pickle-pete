import { useMediaQuery } from '@mantine/hooks';

/** Lato delle immagini dei pezzi di un set (e dell'arma): su cellulare i 5 slot stanno su una riga sola. */
export function useSlotSize(): number {
  const compact = useMediaQuery('(max-width: 36em)', false, { getInitialValueInEffect: false });
  return compact ? 52 : 64;
}
