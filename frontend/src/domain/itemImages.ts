import type { ItemType, Rarity, Specification } from '../api/types';
import ability from '../assets/items/ability.svg';
import back from '../assets/items/back.svg';
import boots from '../assets/items/boots.svg';
import chest from '../assets/items/chest.svg';
import elemental from '../assets/items/elemental.svg';
import glasses from '../assets/items/glasses.svg';
import hat from '../assets/items/hat.svg';
import mechanical from '../assets/items/mechanical.svg';
import melee from '../assets/items/melee.svg';
import ranged from '../assets/items/ranged.svg';

/** Immagine predefinita per specifica (armi e armature); le abilità non hanno specifica e usano il barile. */
const SPECIFICATION_IMAGES: Record<Specification, string> = {
  RANGED: ranged,
  ELEMENTAL: elemental,
  MECHANICAL: mechanical,
  MELEE: melee,
  HAT: hat,
  GLASSES: glasses,
  CHEST: chest,
  BACK: back,
  BOOTS: boots,
};

/** Immagine della categoria; null finché tipologia o specifica non sono scelte. */
export function categoryImage(type: ItemType | null, specification: Specification | null): string | null {
  if (specification) {
    return SPECIFICATION_IMAGES[specification];
  }
  return type === 'ABILITY' ? ability : null;
}

/** Proprietà della miniatura di un item censito: categoria, rarità effettiva e nome. */
export function thumbnailOf(item: {
  type: ItemType;
  specification: Specification | null;
  rarity: Rarity;
  name: string;
}) {
  return { type: item.type, specification: item.specification, rarity: item.rarity, label: item.name };
}
