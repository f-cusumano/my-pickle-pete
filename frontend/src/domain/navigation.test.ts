import { hashOf, sectionFromHash } from './navigation';

describe('navigation', () => {
  it('reads the section from the URL hash, defaulting to Items', () => {
    expect(sectionFromHash('#/full-sets')).toBe('full-sets');
    expect(sectionFromHash('')).toBe('items');
    expect(sectionFromHash('#/unknown')).toBe('items');
    expect(hashOf('census')).toBe('#/census');
  });
});
