import { Paper, Portal } from '@mantine/core';
import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

/** Distanza dal puntatore, perché la freccia del mouse non copra il riquadro. */
const OFFSET = 10;
/** Margine minimo dal bordo della finestra. */
const MARGIN = 8;
/** Distanza dal punto toccato, perché il dito (e la mano, sotto) non copra il riquadro. */
const TOUCH_GAP = 56;

interface Props {
  /** Posizione del puntatore nella finestra. */
  x: number;
  y: number;
  /** Tocco prolungato: il riquadro va sopra il dito (o sotto, se sopra non c'è posto), centrato sul tocco. */
  touch?: boolean;
  children: ReactNode;
}

/**
 * Riquadro che segue il puntatore con l'angolo in alto a sinistra; vicino ai bordi della finestra passa
 * dall'altra parte, per restare visibile. Col tocco prolungato sta invece lontano dal dito, che lo coprirebbe.
 */
export function PointerFloat({ x, y, touch = false, children }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  // Il Portal monta il riquadro dopo il primo render: al montaggio si ridisegna per calcolarne la posizione
  const [mounted, setMounted] = useState(false);
  const attach = useCallback((node: HTMLDivElement | null) => {
    ref.current = node;
    setMounted(node !== null);
  }, []);
  // La posizione dipende dalle dimensioni del riquadro: si calcola dopo averlo disegnato
  useLayoutEffect(() => {
    const element = ref.current;
    if (!mounted || !element) return;
    const { offsetWidth: width, offsetHeight: height } = element;
    let left: number;
    let top: number;
    if (touch) {
      left = Math.max(MARGIN, Math.min(x - width / 2, window.innerWidth - MARGIN - width));
      const above = y - TOUCH_GAP - height;
      top = above >= MARGIN ? above : Math.min(y + TOUCH_GAP, window.innerHeight - MARGIN - height);
    } else {
      left = x + OFFSET;
      if (left + width > window.innerWidth - MARGIN) {
        left = Math.max(MARGIN, x - OFFSET - width);
      }
      top = y + OFFSET;
      if (top + height > window.innerHeight - MARGIN) {
        top = Math.max(MARGIN, y - OFFSET - height);
      }
    }
    element.style.left = `${String(left)}px`;
    element.style.top = `${String(top)}px`;
  });
  return (
    <Portal>
      <Paper
        ref={attach}
        withBorder
        shadow="md"
        radius="md"
        p={6}
        role="tooltip"
        style={{ position: 'fixed', left: x + OFFSET, top: y + OFFSET, zIndex: 1000, pointerEvents: 'none' }}
      >
        {children}
      </Paper>
    </Portal>
  );
}
