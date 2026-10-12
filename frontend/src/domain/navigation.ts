/** Sezioni dell'app, raggiungibili anche da URL (#/items, ...) così il tasto Indietro del telefono funziona. */
export type Section = 'items' | 'full-sets' | 'custom-sets' | 'census';

export const SECTIONS: Section[] = ['items', 'full-sets', 'custom-sets', 'census'];
export const HOME: Section = 'items';

export function sectionFromHash(hash: string): Section {
  const name = hash.replace(/^#\/?/, '');
  return (SECTIONS as string[]).includes(name) ? (name as Section) : HOME;
}

export function hashOf(section: Section): string {
  return `#/${section}`;
}
