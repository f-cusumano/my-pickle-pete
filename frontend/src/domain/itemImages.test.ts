import { categoryImage } from './itemImages';

describe('item images', () => {
  it('pick the default image of the category', () => {
    const images = [
      categoryImage('WEAPON', 'RANGED'),
      categoryImage('ARMOR', 'HAT'),
      categoryImage('ABILITY', null),
    ];
    expect(images.every((image) => typeof image === 'string' && image.length > 0)).toBe(true);
    expect(new Set(images).size).toBe(3);
  });

  it('have no image until the category is chosen', () => {
    expect(categoryImage(null, null)).toBeNull();
    expect(categoryImage('ARMOR', null)).toBeNull();
  });
});
