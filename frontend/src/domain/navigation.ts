import type { Permissions } from './permissions';

/** Sezioni dell'app, raggiungibili anche da URL (#/items, ...) così il tasto Indietro del telefono funziona. */
export type Section = 'items' | 'full-sets' | 'custom-sets' | 'census' | 'profile';

export const SECTIONS: Section[] = ['items', 'full-sets', 'custom-sets', 'census', 'profile'];
export const HOME: Section = 'items';

/** Custom Sets solo per chi ha progressi, Censimento solo per l'ADMIN. */
export function sectionAllowed(section: Section, permissions: Permissions): boolean {
  if (section === 'custom-sets') return permissions.hasProgress;
  if (section === 'census') return permissions.canCensus;
  return true;
}

/** Sezione dell'URL; una sezione sconosciuta o non consentita al ruolo riporta alla home. */
export function sectionFromHash(hash: string, permissions: Permissions): Section {
  const name = hash.replace(/^#\/?/, '');
  const section = (SECTIONS as string[]).includes(name) ? (name as Section) : HOME;
  return sectionAllowed(section, permissions) ? section : HOME;
}

export function hashOf(section: Section): string {
  return `#/${section}`;
}
