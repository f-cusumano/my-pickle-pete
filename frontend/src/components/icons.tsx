import {
  IconBackpack,
  IconCrosshair,
  IconEyeglass2,
  IconFlame,
  IconFlask,
  IconHelmet,
  IconSettings,
  IconShield,
  IconShirt,
  IconShoe,
  IconSword,
  type Icon,
} from '@tabler/icons-react';
import type { ItemType, Specification } from '../api/types';

/** Simbolo che precede la specifica (categoria dell'arma o slot dell'armatura). */
export const SPECIFICATION_ICONS: Record<Specification, Icon> = {
  RANGED: IconCrosshair,
  ELEMENTAL: IconFlame,
  MECHANICAL: IconSettings,
  MELEE: IconSword,
  HAT: IconHelmet,
  GLASSES: IconEyeglass2,
  CHEST: IconShirt,
  BACK: IconBackpack,
  BOOTS: IconShoe,
};

export const ITEM_TYPE_ICONS: Record<ItemType, Icon> = {
  ARMOR: IconShield,
  WEAPON: IconSword,
  ABILITY: IconFlask,
};
