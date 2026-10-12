import { Alert, Title } from '@mantine/core';
import { IconTools } from '@tabler/icons-react';

/** Custom Sets: in arrivo nella prossima versione (modalità Da zero, Best now, Best potential). */
export function CustomSetsPage() {
  return (
    <>
      <Title order={2} mb="md">
        Custom Sets
      </Title>
      <Alert icon={<IconTools />} color="pickle" title="In arrivo">
        Qui potrai costruire i tuoi set: da zero, oppure facendoti proporre i migliori con le caratteristiche
        attuali o al massimo potenziale.
      </Alert>
    </>
  );
}
