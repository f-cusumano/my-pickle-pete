/** Logo di My Pickle Pete: un cetriolo sorridente (disegnato a mano, nessun asset del gioco). */
export function PickleLogo({ size = 40 }: { size?: number }) {
  return (
    <img src={`${import.meta.env.BASE_URL}logo.svg`} width={size} height={size} alt="" aria-hidden="true" />
  );
}
