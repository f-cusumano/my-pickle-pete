import { CONSTANTS, HAT, ITEMS, JAR, PISTOL } from '../test/fixtures';
import { applyFilters, filterOptions, NO_FILTERS, NONE, specificationAllowed, withTypes } from './filters';

describe('filters', () => {
  it('no selected value means no filter', () => {
    expect(applyFilters(ITEMS, NO_FILTERS)).toEqual(ITEMS);
  });

  it('filters by one or more values, combining columns', () => {
    expect(applyFilters(ITEMS, { ...NO_FILTERS, rarity: ['RARE', 'EPIC'] })).toEqual([HAT, PISTOL]);
    expect(applyFilters(ITEMS, { ...NO_FILTERS, rarity: ['RARE', 'EPIC'], type: ['WEAPON'] })).toEqual([
      PISTOL,
    ]);
  });

  it('filters by part of the name, ignoring case and accents', () => {
    expect(applyFilters(ITEMS, { ...NO_FILTERS, name: ' pist ' })).toEqual([PISTOL]);
    expect(applyFilters(ITEMS, { ...NO_FILTERS, name: 'PISTÒ' })).toEqual([PISTOL]);
    expect(applyFilters(ITEMS, { ...NO_FILTERS, name: 'pist', type: ['ARMOR'] })).toEqual([]);
  });

  it('filters items without specification or set with -nessuno-', () => {
    expect(applyFilters(ITEMS, { ...NO_FILTERS, specification: [NONE] })).toEqual([JAR]);
    expect(applyFilters(ITEMS, { ...NO_FILTERS, armorSet: [NONE, 'COWBOY'] })).toEqual([HAT, PISTOL, JAR]);
  });

  it('specifications follow the filtered types', () => {
    expect(specificationAllowed('HAT', [], CONSTANTS)).toBe(true);
    expect(specificationAllowed('HAT', ['WEAPON'], CONSTANTS)).toBe(false);
    expect(specificationAllowed('RANGED', ['WEAPON'], CONSTANTS)).toBe(true);
    expect(specificationAllowed(NONE, ['WEAPON'], CONSTANTS)).toBe(false);
    expect(specificationAllowed(NONE, ['WEAPON', 'ABILITY'], CONSTANTS)).toBe(true);
    // Filtrando le armi si perdono le specifiche delle armature già scelte
    expect(withTypes({ ...NO_FILTERS, specification: ['HAT', 'RANGED'] }, ['WEAPON'], CONSTANTS)).toEqual({
      ...NO_FILTERS,
      type: ['WEAPON'],
      specification: ['RANGED'],
    });
  });

  it('lists only present values, in the order of the sort orders', () => {
    expect(filterOptions(ITEMS, 'rarity', CONSTANTS, 'ARMOR_SET')).toEqual([
      'ARTIFACT',
      'EPIC',
      'RARE',
      'COMMON',
    ]);
    expect(filterOptions(ITEMS, 'type', CONSTANTS, 'ARMOR_SET')).toEqual(['ARMOR', 'WEAPON', 'ABILITY']);
    expect(filterOptions(ITEMS, 'type', CONSTANTS, 'WEAPONS_FIRST')).toEqual(['WEAPON', 'ABILITY', 'ARMOR']);
    expect(filterOptions(ITEMS, 'specification', CONSTANTS, 'ARMOR_SET')).toEqual([
      'HAT',
      'BOOTS',
      'RANGED',
      NONE,
    ]);
    expect(filterOptions(ITEMS, 'armorSet', CONSTANTS, 'ARMOR_SET')).toEqual(['BANDIT', 'COWBOY', NONE]);
  });
});
