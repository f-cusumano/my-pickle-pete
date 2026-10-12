import { CONSTANTS, HAT } from '../test/fixtures';
import { emptyForm, formOf, toRequest, validateForm } from './itemForm';

describe('item form', () => {
  it('requires name, type and the attributes of the type', () => {
    expect(Object.keys(validateForm(emptyForm(), CONSTANTS))).toEqual(['name', 'type']);
    expect(Object.keys(validateForm({ ...emptyForm(), name: 'Elmo', type: 'ARMOR' }, CONSTANTS))).toEqual([
      'specification',
      'armorSet',
    ]);
    expect(validateForm({ ...emptyForm(), name: 'Barattolo', type: 'ABILITY' }, CONSTANTS)).toEqual({});
  });

  it('rejects half filled bonus rows', () => {
    const errors = validateForm(
      {
        ...emptyForm(),
        name: 'Barattolo',
        type: 'ABILITY',
        bonuses: {
          RARE: { stat: null, unit: null, amount: 3 },
          EPIC: { stat: 'LUCK', unit: 'FLAT', amount: '' },
        },
      },
      CONSTANTS,
    );
    expect(Object.keys(errors).sort()).toEqual([
      'bonuses.EPIC.amount',
      'bonuses.RARE.stat',
      'bonuses.RARE.unit',
    ]);
  });

  it('builds the request keeping only what applies to the type', () => {
    const request = toRequest(
      {
        name: '  Pistola ',
        type: 'WEAPON',
        specification: 'RANGED',
        armorSet: 'BANDIT',
        bonuses: {
          EPIC: { stat: 'LUCK', unit: 'PERCENT', amount: '2,5' },
          UNCOMMON: { stat: 'DAMAGE', unit: 'FLAT', amount: 3 },
          RARE: { stat: null, unit: null, amount: '' },
        },
      },
      CONSTANTS,
    );
    expect(request).toEqual({
      name: 'Pistola',
      type: 'WEAPON',
      specification: 'RANGED',
      armorSet: null,
      bonuses: [
        { rarity: 'UNCOMMON', stat: 'DAMAGE', unit: 'FLAT', amount: 3 },
        { rarity: 'EPIC', stat: 'LUCK', unit: 'PERCENT', amount: 2.5 },
      ],
    });
  });

  it('starts editing from the saved item', () => {
    const values = formOf({
      ...HAT,
      bonuses: [{ rarity: 'RARE', stat: 'LUCK', unit: 'PERCENT', amount: 3, unlocked: true }],
    });
    expect(values.bonuses.RARE).toEqual({ stat: 'LUCK', unit: 'PERCENT', amount: 3 });
    expect(values.armorSet).toBe('COWBOY');
  });
});
