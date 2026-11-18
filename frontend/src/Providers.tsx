import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { createApi, type FetchApi } from './api/client';
import { ApiContext } from './api/context';
import { KEYS } from './api/queries';
import { theme } from './theme';

interface Props {
  children: ReactNode;
  fetchApi?: FetchApi;
  /** "test" disattiva transizioni e portali di Mantine (solo nei test). */
  environment?: 'default' | 'test';
}

/** Tema Mantine, client REST (con ritorno all'accesso a sessione scaduta), cache delle query, modali e notifiche. */
export function Providers({ children, fetchApi, environment = 'default' }: Props) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: environment === 'test' ? false : 1, refetchOnWindowFocus: false },
        },
      }),
  );
  // Sessione scaduta: l'utente torna null e l'app mostra la pagina di accesso
  const [api] = useState(() => createApi(fetchApi, () => queryClient.setQueryData(KEYS.user, null)));
  return (
    <MantineProvider theme={theme} defaultColorScheme="light" env={environment}>
      <QueryClientProvider client={queryClient}>
        <ApiContext.Provider value={api}>
          <ModalsProvider labels={{ confirm: 'Conferma', cancel: 'Annulla' }}>
            <Notifications position="top-center" limit={3} />
            {children}
          </ModalsProvider>
        </ApiContext.Provider>
      </QueryClientProvider>
    </MantineProvider>
  );
}
