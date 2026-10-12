import { formatLevel, formatStatBonus, formatStatValue } from './format';

describe('format', () => {
  it('formats stat values with sign and unit', () => {
    expect(formatStatValue(40, 'PERCENT')).toBe('+40%');
    expect(formatStatValue(40, 'FLAT')).toBe('+40');
    expect(formatStatValue(2.5, 'FLAT')).toBe('+2,5');
    expect(formatStatValue(0, 'PERCENT')).toBe('0');
  });

  it('formats bonuses with the Italian stat name', () => {
    expect(formatStatBonus('PICK_UP_RADIUS', 5, 'PERCENT')).toBe('+5% Raggio di raccolta');
    expect(formatStatBonus('LUCK', 3, 'FLAT')).toBe('+3 Fortuna');
  });

  it('formats levels as N / M', () => {
    expect(formatLevel(7, 30)).toBe('7 / 30');
  });
});
