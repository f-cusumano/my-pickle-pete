import type { CurrentUser } from '../api/types';
import { confirmationError, nicknameError, passwordError, profileFormOf, toProfile } from './userForm';

const USER: CurrentUser = {
  id: 2,
  nickname: 'francesco',
  role: 'USER',
  firstName: 'Francesco',
  lastName: null,
  birthDate: '1985-03-02',
  email: null,
};

describe('profileFormOf / toProfile', () => {
  it('i null diventano stringhe vuote e tornano null, i testi si ripuliscono', () => {
    const form = profileFormOf(USER);
    expect(form).toEqual({ firstName: 'Francesco', lastName: '', birthDate: '1985-03-02', email: '' });
    expect(toProfile({ ...form, lastName: '  Rossi ', email: '   ' })).toEqual({
      firstName: 'Francesco',
      lastName: 'Rossi',
      birthDate: '1985-03-02',
      email: null,
    });
  });

  it('senza utente il modulo è vuoto', () => {
    expect(toProfile(profileFormOf(null))).toEqual({ firstName: null, lastName: null, birthDate: null, email: null });
  });
});

describe('nicknameError', () => {
  it.each([
    ['luigi', null],
    ['l.verdi_90-x', null],
    ['ab', 'Da 3 a 30 caratteri'],
    ['a'.repeat(31), 'Da 3 a 30 caratteri'],
    ['luigi verdi', 'Solo lettere, numeri, punto, trattino e trattino basso'],
  ])('%s → %s', (nickname, expected) => {
    expect(nicknameError(nickname)).toBe(expected);
  });
});

describe('passwordError / confirmationError', () => {
  it('lunghezza tra 8 e 72 e conferma identica', () => {
    expect(passwordError('1234567')).toBe('Da 8 a 72 caratteri');
    expect(passwordError('12345678')).toBeNull();
    expect(passwordError('x'.repeat(73))).toBe('Da 8 a 72 caratteri');
    expect(confirmationError('segreta1', 'segreta1')).toBeNull();
    expect(confirmationError('segreta1', 'segreta2')).toBe('Le due password non coincidono');
  });
});
