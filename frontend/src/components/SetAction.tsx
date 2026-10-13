import { ActionIcon, Button } from '@mantine/core';
import type { ReactNode } from 'react';

interface Props {
  label: string;
  color: string;
  icon: ReactNode;
  ariaLabel: string;
  /** Solo il simbolo (cellulare). */
  compact: boolean;
  disabled?: boolean;
  onClick: () => void;
}

/** Tasto nell'intestazione di un set (Personalizza, Modifica, Elimina): con la scritta, o solo il simbolo su cellulare. */
export function SetAction({ label, color, icon, ariaLabel, compact, disabled, onClick }: Props) {
  if (compact) {
    return (
      <ActionIcon
        variant="light"
        color={color}
        size="lg"
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
      >
        {icon}
      </ActionIcon>
    );
  }
  return (
    <Button
      variant="light"
      color={color}
      leftSection={icon}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {label}
    </Button>
  );
}
