import type { CurrentUser, UserProfile } from '../api/types';

/** Stessi limiti del backend (RegisterRequest, PasswordRequest). */
export const MIN_NICKNAME_LENGTH = 3;
export const MAX_NICKNAME_LENGTH = 30;
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 72;
const NICKNAME_PATTERN = /^[A-Za-z0-9._-]+$/;

/** Dati anagrafici nel modulo: stringhe vuote al posto dei null, così gli input restano controllati. */
export interface ProfileFormValues {
  firstName: string;
  lastName: string;
  birthDate: string;
  email: string;
}

export function profileFormOf(user: CurrentUser | null): ProfileFormValues {
  return {
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    birthDate: user?.birthDate ?? '',
    email: user?.email ?? '',
  };
}

/** I campi vuoti diventano null (il backend li salva come "non indicati"). */
export function toProfile(values: ProfileFormValues): UserProfile {
  const orNull = (text: string) => (text.trim() === '' ? null : text.trim());
  return {
    firstName: orNull(values.firstName),
    lastName: orNull(values.lastName),
    birthDate: orNull(values.birthDate),
    email: orNull(values.email),
  };
}

export function nicknameError(nickname: string): string | null {
  const trimmed = nickname.trim();
  if (trimmed.length < MIN_NICKNAME_LENGTH || trimmed.length > MAX_NICKNAME_LENGTH) {
    return `Da ${String(MIN_NICKNAME_LENGTH)} a ${String(MAX_NICKNAME_LENGTH)} caratteri`;
  }
  return NICKNAME_PATTERN.test(trimmed) ? null : 'Solo lettere, numeri, punto, trattino e trattino basso';
}

export function passwordError(password: string): string | null {
  return password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH
    ? `Da ${String(MIN_PASSWORD_LENGTH)} a ${String(MAX_PASSWORD_LENGTH)} caratteri`
    : null;
}

export function confirmationError(password: string, confirmation: string): string | null {
  return password === confirmation ? null : 'Le due password non coincidono';
}
