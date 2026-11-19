import { hashOf, sectionFromHash } from './navigation';
import { permissionsOf } from './permissions';

const ADMIN = permissionsOf('ADMIN');
const USER = permissionsOf('USER');

describe('navigation', () => {
  it('reads the section from the URL hash, defaulting to Items', () => {
    expect(sectionFromHash('#/full-sets', USER)).toBe('full-sets');
    expect(sectionFromHash('', USER)).toBe('items');
    expect(sectionFromHash('#/unknown', USER)).toBe('items');
    expect(sectionFromHash('#/profile', ADMIN)).toBe('profile');
    expect(hashOf('census')).toBe('#/census');
  });

  it('sends a role back home from the sections of the other role', () => {
    expect(sectionFromHash('#/census', USER)).toBe('items');
    expect(sectionFromHash('#/custom-sets', USER)).toBe('custom-sets');
    expect(sectionFromHash('#/custom-sets', ADMIN)).toBe('items');
    expect(sectionFromHash('#/census', ADMIN)).toBe('census');
  });
});
