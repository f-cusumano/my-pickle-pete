import type { Item, RarityBonus, StatComparison } from '../api/types';
import { CONSTANTS, item } from '../test/fixtures';
import { statUnits } from './units';
import {
  itemIdsOf,
  sameSelection,
  selectionOf,
  slotSpecification,
  slotType,
  slotCandidates,
  statKeyLabel,
  customizedName,
  statKeyId,
  statKeyOptions,
  statTrends,
  swapPreview,
  alignRows,
  weaponAdviceText,
  weaponCandidates,
  weaponSpecifications,
} from './customSets';
import { formatStatBonus } from './format';
import { ownStatLabel } from '../i18n/labels';

const units = statUnits(CONSTANTS);

const armor = (id: number, name: string, overrides: Partial<Item>) =>
  item({ id, name, type: 'ARMOR', specification: 'HAT', armorSet: 'COWBOY', ...overrides });

const row = (
  stat: StatComparison['stat'],
  unit: StatComparison['unit'],
  current: number,
  top: number,
  weapon: { current: number; top: number } | null = null,
): StatComparison => ({
  stat,
  unit,
  own: false,
  current,
  top,
  weaponCurrent: weapon?.current ?? null,
  weaponTop: weapon?.top ?? null,
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
        bonuses: [{ rarity: 'RARE', stat: 'LUCK', unit: 'PERCENT', amount: 3, own: false, unlocked: false }],
      }),
      item({
        id: 2,
        name: 'Pistola',
        type: 'WEAPON',
        specification: 'RANGED',
        bonuses: [
          { rarity: 'RARE', stat: 'MAX_HP', unit: 'PERCENT', amount: 3, own: false, unlocked: false },
        ],
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

  it('compares the totals with the weapon', () => {
    const trends = statTrends(
      [row('LUCK', 'FLAT', 5, 5)],
      [row('LUCK', 'FLAT', 3, 3, { current: 2, top: 4 })],
    );
    expect(trends.get('LUCK-FLAT')).toEqual({ current: null, top: 'up' });
  });
});

describe('weapons', () => {
  it('lists weapons by category, then rarity and name', () => {
    const weapons = weaponCandidates(
      [
        item({ id: 1, name: 'Daga', type: 'WEAPON', specification: 'MELEE', rarity: 'EPIC' }),
        item({ id: 2, name: 'Pistola', type: 'WEAPON', specification: 'RANGED', rarity: 'COMMON' }),
        item({ id: 3, name: 'Fionda', type: 'WEAPON', specification: 'RANGED', rarity: 'RARE' }),
        armor(4, 'Cappello', {}),
      ],
      weaponSpecifications(CONSTANTS),
    );
    expect(weapons.map((weapon) => weapon.name)).toEqual(['Fionda', 'Pistola', 'Daga']);
  });

  it('describes recommended types, adding the top ones only when they differ', () => {
    expect(weaponAdviceText(['ELEMENTAL'], ['ELEMENTAL'])).toBe('elementale');
    expect(weaponAdviceText(['RANGED'], ['RANGED', 'MELEE'])).toBe(
      'a distanza (al massimo potenziale: a distanza, ravvicinata)',
    );
    expect(weaponAdviceText([], [])).toBe('nessuna in particolare');
  });

  it('keeps own stats apart from the general ones', () => {
    expect(statKeyId({ stat: 'DAMAGE', unit: 'PERCENT', own: true })).toBe('DAMAGE-PERCENT-own');
    expect(ownStatLabel('DAMAGE')).toBe('Proprio danno');
    expect(ownStatLabel('LUCK')).toBe('Propria fortuna');
    expect(ownStatLabel('MAX_HP')).toBe('Propri HP');
    expect(formatStatBonus('DAMAGE', 10, 'PERCENT', true)).toBe('+10% proprio danno');
  });
});

describe('customize a full set', () => {
  it('proposes the name with the right preposition', () => {
    expect(customizedName('BANDIT')).toBe('Set del Bandito personalizzato');
    expect(customizedName('SUPERMAN')).toBe('Set di Superman personalizzato');
  });
});

describe('preview of a candidate in the picker', () => {
  const bonus = (
    rarity: RarityBonus['rarity'],
    stat: RarityBonus['stat'],
    unit: RarityBonus['unit'],
    amount: number,
    unlocked: boolean,
    own = false,
  ): RarityBonus => ({ rarity, stat, unit, amount, own, unlocked });

  it('shows the whole candidate in an empty slot, in game order', () => {
    const candidate = armor(1, 'Cappello', {
      bonuses: [bonus('UNCOMMON', 'LUCK', 'FLAT', 2, true), bonus('RARE', 'DAMAGE', 'PERCENT', 5, false)],
    });
    expect(swapPreview(candidate, null, CONSTANTS)).toEqual([
      { stat: 'DAMAGE', unit: 'PERCENT', own: false, current: 0, top: 5 },
      { stat: 'LUCK', unit: 'FLAT', own: false, current: 2, top: 2 },
    ]);
  });

  it('subtracts the replaced item and drops the rows that do not change', () => {
    const replaced = armor(1, 'Vecchio', {
      bonuses: [bonus('UNCOMMON', 'MAX_HP', 'FLAT', 5, true), bonus('RARE', 'LUCK', 'FLAT', 2, true)],
    });
    const candidate = armor(2, 'Nuovo', {
      bonuses: [bonus('UNCOMMON', 'LUCK', 'FLAT', 2, true), bonus('RARE', 'DAMAGE', 'PERCENT', 15, true)],
    });
    expect(swapPreview(candidate, replaced, CONSTANTS)).toEqual([
      { stat: 'DAMAGE', unit: 'PERCENT', own: false, current: 15, top: 15 },
      { stat: 'MAX_HP', unit: 'FLAT', own: false, current: -5, top: -5 },
    ]);
    expect(swapPreview(replaced, replaced, CONSTANTS)).toEqual([]);
  });

  it('keeps own stats after the general ones and abilities in their fixed order', () => {
    const weapon = item({
      id: 3,
      name: 'Pistola',
      type: 'WEAPON',
      bonuses: [
        bonus('UNCOMMON', 'DAMAGE', 'PERCENT', 10, true, true),
        bonus('RARE', 'LUCK', 'FLAT', 1.1, true),
      ],
    });
    expect(swapPreview(weapon, null, CONSTANTS).map((delta) => statKeyId(delta))).toEqual([
      'LUCK-FLAT',
      'DAMAGE-PERCENT-own',
    ]);
    const ability = item({
      id: 4,
      name: 'Granata',
      bonuses: [
        bonus('UNCOMMON', 'DURATION', 'SECONDS', 1.5, true),
        bonus('RARE', 'COOLDOWN', 'SECONDS', 2, false),
      ],
    });
    expect(swapPreview(ability, null, CONSTANTS).map((delta) => delta.stat)).toEqual([
      'COOLDOWN',
      'DURATION',
    ]);
  });
});

describe('compare two sets side by side', () => {
  it('gives both tables the same rows, in the backend order', () => {
    const own = { ...row('DAMAGE', 'PERCENT', 10, 10), own: true };
    const original = [row('DAMAGE', 'PERCENT', 1, 2), row('LUCK', 'FLAT', 3, 3), own];
    const modified = [
      row('DAMAGE', 'PERCENT', 2, 2),
      row('LUCK', 'PERCENT', 4, 4),
      row('LUCK', 'FLAT', 1, 1),
    ];
    const [left, right] = alignRows(original, modified, CONSTANTS);
    const ids = ['DAMAGE-PERCENT', 'LUCK-FLAT', 'LUCK-PERCENT', 'DAMAGE-PERCENT-own'];
    expect(left.map((r) => statKeyId(r))).toEqual(ids);
    expect(right.map((r) => statKeyId(r))).toEqual(ids);
    expect(left[2]).toMatchObject({ current: 0, top: 0, currentHighlight: 'NONE' });
    expect(right[3]).toMatchObject({ own: true, current: 0, top: 0 });
    expect(right[1]).toMatchObject({ current: 1 });
  });

  it('keeps the abilities in their fixed order', () => {
    const [left, right] = alignRows(
      [row('DURATION', 'SECONDS', 1, 1)],
      [row('COOLDOWN', 'SECONDS', 2, 2)],
      CONSTANTS,
      true,
    );
    expect(left.map((r) => r.stat)).toEqual(['COOLDOWN', 'DURATION']);
    expect(right.map((r) => r.stat)).toEqual(['COOLDOWN', 'DURATION']);
  });
});

describe('slotType / slotSpecification', () => {
  it('armatura con la sua specifica, arma e abilità senza', () => {
    expect([slotType('HAT'), slotSpecification('HAT')]).toEqual(['ARMOR', 'HAT']);
    expect([slotType('WEAPON'), slotSpecification('WEAPON')]).toEqual(['WEAPON', null]);
    expect([slotType('ABILITY'), slotSpecification('ABILITY')]).toEqual(['ABILITY', null]);
  });
});
