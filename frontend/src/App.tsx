import { Alert, AppShell, Burger, Center, Divider, Group, Loader, NavLink, Text, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconClipboardList,
  IconLayoutCards,
  IconListDetails,
  IconLogout,
  IconTools,
  IconUserCircle,
  type Icon,
} from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';
import { useCurrentUser, useSession } from './api/queries';
import type { CurrentUser, FullSet } from './api/types';
import { PickleLogo } from './components/PickleLogo';
import { HOME, hashOf, sectionAllowed, sectionFromHash, type Section } from './domain/navigation';
import { permissionsOf } from './domain/permissions';
import { AuthPage } from './pages/AuthPage';
import { CensusPage } from './pages/CensusPage';
import { CustomSetsPage } from './pages/CustomSetsPage';
import { FullSetsPage } from './pages/FullSetsPage';
import { ItemsPage } from './pages/ItemsPage';
import { ProfilePage } from './pages/ProfilePage';

const MENU: { section: Section; label: string; description: string; icon: Icon }[] = [
  { section: 'items', label: 'Items', description: 'Tutti gli oggetti indossabili', icon: IconListDetails },
  {
    section: 'full-sets',
    label: 'Full Sets',
    description: 'Set completi di armatura',
    icon: IconLayoutCards,
  },
  { section: 'custom-sets', label: 'Custom Sets', description: 'Set costruiti da te', icon: IconTools },
  {
    section: 'census',
    label: 'Censimento',
    description: 'Crea e modifica item e bonus',
    icon: IconClipboardList,
  },
  { section: 'profile', label: 'Profilo', description: 'I tuoi dati e la password', icon: IconUserCircle },
];

/** Senza sessione la pagina di accesso, altrimenti l'app con le sezioni del ruolo dell'utente. */
export function App() {
  const user = useCurrentUser();
  if (user.isPending) {
    return (
      <Center mih="100dvh">
        <Loader />
      </Center>
    );
  }
  if (user.isError) {
    return (
      <Alert color="red" title="Impossibile contattare il server" m="md">
        Il server non risponde: controlla che il backend sia avviato.
      </Alert>
    );
  }
  return user.data ? <Shell user={user.data} /> : <AuthPage />;
}

/** Intestazione con logo, menu laterale (a scomparsa su cellulare) e sezione corrente. */
function Shell({ user }: { user: CurrentUser }) {
  const permissions = permissionsOf(user.role);
  const { logout } = useSession();
  const [section, setSection] = useState<Section>(() => sectionFromHash(window.location.hash, permissions));
  // Full Set da personalizzare: passa da Full Sets a Custom Sets, che apre subito la modifica
  const [customizing, setCustomizing] = useState<FullSet | null>(null);
  const customizingOpened = useCallback(() => setCustomizing(null), []);
  const [menuOpened, { toggle: toggleMenu, close: closeMenu }] = useDisclosure(false);

  useEffect(() => {
    const onHashChange = () => setSection(sectionFromHash(window.location.hash, permissionsOf(user.role)));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [user.role]);

  const navigate = (target: Section) => {
    window.location.hash = hashOf(target);
    setSection(target);
    closeMenu();
    window.scrollTo({ top: 0 });
  };

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{ width: 240, breakpoint: 'sm', collapsed: { mobile: !menuOpened } }}
      padding={{ base: 'sm', sm: 'md' }}
    >
      <AppShell.Header bg="pickle.8" style={{ borderBottom: '3px solid #1d3a10' }}>
        <Group h="100%" px="md" gap="sm" wrap="nowrap">
          <Burger
            opened={menuOpened}
            onClick={toggleMenu}
            hiddenFrom="sm"
            size="sm"
            color="white"
            aria-label="Menu"
          />
          <UnstyledButton onClick={() => navigate(HOME)} aria-label="Torna alla home">
            <Group gap={10} wrap="nowrap">
              <PickleLogo size={44} />
              <Text className="game-title" fz={{ base: 24, sm: 28 }}>
                My Pickle Pete
              </Text>
            </Group>
          </UnstyledButton>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs" bg="#fbf8ee">
        {MENU.filter((entry) => sectionAllowed(entry.section, permissions)).map((entry) => (
          <NavLink
            key={entry.section}
            active={entry.section === section}
            label={entry.label}
            description={entry.section === 'profile' ? user.nickname : entry.description}
            leftSection={<entry.icon size={22} stroke={1.8} />}
            onClick={() => navigate(entry.section)}
            variant="filled"
            py="sm"
            style={{ borderRadius: 10 }}
            fw={700}
          />
        ))}
        <Divider my="xs" />
        <NavLink
          label="Esci"
          leftSection={<IconLogout size={22} stroke={1.8} />}
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
          py="sm"
          style={{ borderRadius: 10 }}
          fw={700}
        />
      </AppShell.Navbar>

      <AppShell.Main>
        {section === 'items' && (
          <ItemsPage onGoToCensus={permissions.canCensus ? () => navigate('census') : undefined} />
        )}
        {section === 'full-sets' && (
          <FullSetsPage
            onCustomize={(fullSet) => {
              setCustomizing(fullSet);
              navigate('custom-sets');
            }}
          />
        )}
        {section === 'custom-sets' && (
          <CustomSetsPage customizing={customizing} onCustomizingOpened={customizingOpened} />
        )}
        {section === 'census' && <CensusPage />}
        {section === 'profile' && <ProfilePage user={user} />}
      </AppShell.Main>
    </AppShell>
  );
}
