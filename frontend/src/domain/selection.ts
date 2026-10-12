/**
 * Selezione delle righe della tabella Items: le righe nascoste dai filtri escono dalla selezione,
 * quelle che ricompaiono tornano deselezionate.
 */
export function keepVisible(selected: ReadonlySet<number>, visibleIds: readonly number[]): Set<number> {
  const visible = new Set(visibleIds);
  return new Set([...selected].filter((id) => visible.has(id)));
}

/** Check in intestazione: con almeno una riga selezionata svuota la selezione, altrimenti seleziona tutte le visibili. */
export function toggleAll(selected: ReadonlySet<number>, visibleIds: readonly number[]): Set<number> {
  return selected.size > 0 ? new Set() : new Set(visibleIds);
}

export function toggleOne(selected: ReadonlySet<number>, id: number): Set<number> {
  const next = new Set(selected);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  return next;
}
