import { CONSTANTS, HAT } from '../test/fixtures';
import {
  emptyForm,
  formOf,
  missingPieceName,
  toRequest,
  validateForm,
  type BonusRow,
  type ItemFormValues,
} from './itemForm';

/** Tutti e 5 i potenziamenti compilati (+1 Fortuna), con quelli dati al posto dei rispettivi. */
const allBonuses = (given: ItemFormValues['bonuses'] = {}): ItemFormValues['bonuses'] => {
  const filler: BonusRow = { stat: 'LUCK', unit: 'FLAT', amount: 1, own: false };
  return { UNCOMMON: filler, RARE: filler, EPIC: filler, LEGENDARY: filler, ARTIFACT: filler, ...given };
};

describe('item form', () => {
  it('requires name, type and the attributes of the type', () => {
    expect(Object.keys(validateForm(emptyForm(), CONSTANTS))).toEqual(['name', 'type']);
    expect(
      Object.keys(
        validateForm({ ...emptyForm(), name: 'Elmo', type: 'ARMOR', bonuses: allBonuses() }, CONSTANTS),
      ),
    ).toEqual(['specification', 'armorSet']);
    expect(
      validateForm({ ...emptyForm(), name: 'Barattolo', type: 'ABILITY', bonuses: allBonuses() }, CONSTANTS),
    ).toEqual({});
  });

  it('rejects half filled bonus rows', () => {
    const errors = validateForm(
      {
        ...emptyForm(),
        name: 'Barattolo',
        type: 'ABILITY',
        bonuses: allBonuses({
          RARE: { stat: null, unit: null, amount: 3, own: false },
          EPIC: { stat: 'LUCK', unit: 'FLAT', amount: '', own: false },
        }),
      },
      CONSTANTS,
    );
    expect(Object.keys(errors).sort()).toEqual([
      'bonuses.EPIC.amount',
      'bonuses.RARE.stat',
      'bonuses.RARE.unit',
    ]);
  });

  it('requires a bonus for every rarity above Common', () => {
    const errors = validateForm(
      { ...emptyForm(), name: 'Barattolo', type: 'ABILITY', bonuses: { UNCOMMON: allBonuses().UNCOMMON } },
      CONSTANTS,
    );
    expect(Object.keys(errors).filter((key) => key.endsWith('.stat'))).toEqual([
      'bonuses.RARE.stat',
      'bonuses.EPIC.stat',
      'bonuses.LEGENDARY.stat',
      'bonuses.ARTIFACT.stat',
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
          EPIC: { stat: 'LUCK', unit: 'PERCENT', amount: '2,5', own: false },
          UNCOMMON: { stat: 'DAMAGE', unit: 'FLAT', amount: 3, own: true },
          RARE: { stat: null, unit: null, amount: '', own: false },
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
        { rarity: 'UNCOMMON', stat: 'DAMAGE', unit: 'FLAT', amount: 3, own: true },
        { rarity: 'EPIC', stat: 'LUCK', unit: 'PERCENT', amount: 2.5, own: false },
      ],
    });
  });

  it('requires an increase of at least 1', () => {
    const errors = validateForm(
      {
        ...emptyForm(),
        name: 'Barattolo',
        type: 'ABILITY',
        bonuses: allBonuses({ RARE: { stat: 'LUCK', unit: 'FLAT', amount: 0.5, own: false } }),
      },
      CONSTANTS,
    );
    expect(errors).toEqual({ 'bonuses.RARE.amount': 'Almeno 1' });
  });

  it('keeps own bonuses only for weapons', () => {
    const request = toRequest(
      {
        name: 'Barattolo',
        type: 'ABILITY',
        specification: null,
        armorSet: null,
        bonuses: { RARE: { stat: 'DAMAGE', unit: 'PERCENT', amount: 10, own: true } },
      },
      CONSTANTS,
    );
    expect(request.bonuses).toEqual([
      { rarity: 'RARE', stat: 'DAMAGE', unit: 'PERCENT', amount: 10, own: false },
    ]);
  });

  it('names the missing piece of a full set after slot and set', () => {
    expect(missingPieceName('HAT', 'KNIGHT')).toBe('Cappello da Cavaliere');
    expect(missingPieceName('BOOTS', 'SUPERMAN')).toBe('Stivali da Superman');
  });

  it('starts editing from the saved item', () => {
    const values = formOf({
      ...HAT,
      bonuses: [{ rarity: 'RARE', stat: 'LUCK', unit: 'PERCENT', amount: 3, own: false, unlocked: true }],
    });
    expect(values.bonuses.RARE).toEqual({ stat: 'LUCK', unit: 'PERCENT', amount: 3, own: false });
    expect(values.armorSet).toBe('COWBOY');
  });
});
