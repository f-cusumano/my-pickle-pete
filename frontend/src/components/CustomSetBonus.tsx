import type { CustomSet } from '../api/types';
import { ARMOR_SET_LABELS } from '../i18n/labels';
import { SetBonusCard } from './SetBonusCard';

/** Bonus di un set custom: quello del set con almeno 4 pezzi, se c'è. */
export function CustomSetBonus({ set, threshold }: { set: CustomSet; threshold: number }) {
  if (!set.bonusArmorSet) {
    return (
      <SetBonusCard
        title="Bonus di set"
        active={false}
        description={`Servono almeno ${String(threshold)} pezzi dello stesso set.`}
      />
    );
  }
  return (
    <SetBonusCard
      title={`Bonus ${ARMOR_SET_LABELS[set.bonusArmorSet]}`}
      active
      description={set.bonusDescription}
    />
  );
}
