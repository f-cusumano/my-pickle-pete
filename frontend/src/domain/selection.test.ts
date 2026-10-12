import { keepVisible, toggleAll, toggleOne } from './selection';

describe('selection', () => {
  it('drops rows hidden by filters', () => {
    expect(keepVisible(new Set([1, 2, 3]), [2, 3, 4])).toEqual(new Set([2, 3]));
  });

  it('header check selects all visible rows when nothing is selected', () => {
    expect(toggleAll(new Set(), [1, 2])).toEqual(new Set([1, 2]));
  });

  it('header check clears the selection when at least one row is selected', () => {
    expect(toggleAll(new Set([2]), [1, 2])).toEqual(new Set());
  });

  it('toggles a single row', () => {
    expect(toggleOne(new Set([1]), 2)).toEqual(new Set([1, 2]));
    expect(toggleOne(new Set([1, 2]), 2)).toEqual(new Set([1]));
  });
});
