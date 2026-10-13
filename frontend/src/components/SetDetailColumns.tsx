import type { ReactNode } from 'react';
import classes from './SetDetailColumns.module.css';

/**
 * Corpo di un set: a sinistra bonus, pezzi, consigli sull'arma, arma e abilità; a destra le tabelle delle
 * caratteristiche. Su schermi stretti le due colonne vanno una sotto l'altra.
 */
export function SetDetailColumns({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <div className={classes.columns}>
      <div className={classes.column}>{left}</div>
      <div className={classes.column}>{right}</div>
    </div>
  );
}
