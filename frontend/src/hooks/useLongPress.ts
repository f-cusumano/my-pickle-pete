import { useEffect, useRef, type TouchEvent } from 'react';

/** Durata del tocco prima che diventi "prolungato". */
const LONG_PRESS_MS = 400;
/** Spostamento del dito oltre il quale il tocco è uno scorrimento, non un tocco prolungato. */
const MOVE_TOLERANCE = 10;

interface Press {
  timer: number;
  x: number;
  y: number;
  started: boolean;
}

/**
 * Tocco prolungato su un elemento di un elenco: dopo un attimo col dito fermo chiama onStart con la posizione
 * del tocco, e al rilascio onEnd. Il tocco che ha mostrato qualcosa non vale come click; scorrere l'elenco
 * prima dello scatto annulla il tocco prolungato.
 */
export function useLongPress<T>(onStart: (value: T, x: number, y: number) => void, onEnd: () => void) {
  const press = useRef<Press | null>(null);
  const suppressClick = useRef(false);

  const cancel = () => {
    if (press.current) {
      window.clearTimeout(press.current.timer);
      press.current = null;
    }
  };
  const end = () => {
    if (press.current?.started) {
      // Il click che segue il rilascio (se il browser lo manda) non deve scegliere l'elemento
      suppressClick.current = true;
      onEnd();
    }
    cancel();
  };
  useEffect(() => cancel, []);

  const handlers = (value: T) => ({
    onTouchStart: (event: TouchEvent) => {
      cancel();
      suppressClick.current = false;
      const touch = event.touches[0];
      if (event.touches.length !== 1 || !touch) return;
      const { clientX: x, clientY: y } = touch;
      const timer = window.setTimeout(() => {
        if (press.current) {
          press.current.started = true;
          onStart(value, x, y);
        }
      }, LONG_PRESS_MS);
      press.current = { timer, x, y, started: false };
    },
    onTouchMove: (event: TouchEvent) => {
      const current = press.current;
      const touch = event.touches[0];
      if (!current || current.started || !touch) return;
      if (Math.hypot(touch.clientX - current.x, touch.clientY - current.y) > MOVE_TOLERANCE) {
        cancel();
      }
    },
    onTouchEnd: end,
    onTouchCancel: end,
    // Niente menu contestuale né selezione del testo tenendo premuto
    onContextMenu: (event: { preventDefault: () => void }) => event.preventDefault(),
  });

  /** true se il click va ignorato perché chiude un tocco prolungato (lo consuma). */
  const consumeClick = () => {
    const suppressed = suppressClick.current;
    suppressClick.current = false;
    return suppressed;
  };

  return { handlers, consumeClick };
}
