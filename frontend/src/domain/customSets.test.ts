import type { Item, StatComparison } from '../api/types';
import { CONSTANTS, item } from '../test/fixtures';
import { statUnits } from './units';
import {
  itemIdsOf,
  sameSelection,
  selectionOf,
  slotCandidates,
  statKeyLabel,
  statKeyOptions,
  statTrends,
} from './customSets';

const units = statUnits(CONSTANTS);

const armor = (id: number, name: string, overrides: Partial<Item>) =>
  item({ id, name, type: 'ARMOR', specification: 'HAT', armorSet: 'COWBOY', ...overrides });

const row = (
  stat: StatComparison['stat'],
  unit: StatComparison['unit'],
  current: number,
  top: number,
): StatComparison => ({
  stat,
  unit,
  current,
  top,
  currentHighlight: 'NONE',
  topHighlight: 'NONE',
});

describe('statKeyLabel', () => {
  it('shows the unit only when it is not the default one', () => {
    expect(statKeyLabel({ stat: 'LUCK', unit: 'FLAT' }, units)).toBe('Fortuna');
    expect(statKeyLabel({ stat: 'LUCK', unit: 'PERCENT' }, units)).toBe('Fortuna (%)');
    expect(statKeyLabel({ stat: 'DAMAGE', unit: 'FLAT' }, units)).toBe('Danno (valore)');
  });
});

describe('statKeyOptions', () => {
  it('adds the other unit right after the default one, only when some armor gives it', () => {
    const items = [
      armor(1, 'Cappello', {
        bonuses: [{ rarity: 'RARE', stat: 'LUCK', unit: 'PERCENT', amount: 3, unlocked: false }],
      }),
      item({
        id: 2,
        name: 'Pistola',
        type: 'WEAPON',
        specification: 'RANGED',
        bonuses: [{ rarity: 'RARE', stat: 'MAX_HP', unit: 'PERCENT', amount: 3, unlocked: false }],
      }),
    ];
    expect(statKeyOptions(CONSTANTS, items).map((key) => `${key.stat}-${key.unit}`)).toEqual([
      'DAMAGE-PERCENT',
      'MAX_HP-FLAT',
      'LUCK-FLAT',
      'LUCK-PERCENT',
      'PICK_UP_RADIUS-PERCENT',
    ]);
  });
});

describe('slotCandidates', () => {
  it('keeps the armor of the slot, by descending rarity and then by name', () => {
    const items = [
      armor(1, 'Zucchetto', { rarity: 'RARE' }),
      armor(2, 'Berretto', { rarity: 'COMMON' }),
      armor(3, 'Elmo', { rarity: 'RARE' }),
      armor(4, 'Occhialoni', { specification: 'GLASSES', rarity: 'ARTIFACT' }),
      armor(5, 'Bombetta', { rarity: 'ARTIFACT' }),
    ];
    expect(slotCandidates(items, 'HAT').map((candidate) => candidate.name)).toEqual([
      'Bombetta',
      'Elmo',
      'Zucchetto',
      'Berretto',
    ]);
  });
});

describe('slot selection', () => {
  const hat = armor(1, 'Cappello', {});
  const boots = armor(2, 'Stivali', { specification: 'BOOTS' });
  const slots = ['HAT', 'GLASSES', 'CHEST', 'BACK', 'BOOTS'] as const;

  it('lists item ids in slot order', () => {
    expect(itemIdsOf(selectionOf([boots, hat]), [...slots])).toEqual([1, 2]);
  });

  it('recognizes an unchanged selection', () => {
    expect(sameSelection(selectionOf([hat, boots]), selectionOf([boots, hat]), [...slots])).toBe(true);
    expect(sameSelection(selectionOf([hat]), selectionOf([hat, boots]), [...slots])).toBe(false);
  });
});

describe('statTrends', () => {
  it('marks each column up, down or unchanged; a new row starts from 0', () => {
    const trends = statTrends(
      [row('DAMAGE', 'PERCENT', 10, 100), row('LUCK', 'FLAT', 5, 5)],
      [row('DAMAGE', 'PERCENT', 12, 90), row('LUCK', 'FLAT', 5, 5), row('LUCK', 'PERCENT', 0, 3)],
    );
    expect(trends.get('DAMAGE-PERCENT')).toEqual({ current: 'up', top: 'down' });
    expect(trends.get('LUCK-FLAT')).toEqual({ current: null, top: null });
    expect(trends.get('LUCK-PERCENT')).toEqual({ current: null, top: 'up' });
  });
});
