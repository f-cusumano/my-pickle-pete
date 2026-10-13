import { AppShell, Burger, Group, NavLink, Text, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconClipboardList,
  IconLayoutCards,
  IconListDetails,
  IconTools,
  type Icon,
} from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';
import type { FullSet } from './api/types';
import { PickleLogo } from './components/PickleLogo';
import { HOME, hashOf, sectionFromHash, type Section } from './domain/navigation';
import { CensusPage } from './pages/CensusPage';
import { CustomSetsPage } from './pages/CustomSetsPage';
import { FullSetsPage } from './pages/FullSetsPage';
import { ItemsPage } from './pages/ItemsPage';

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
];

/** Intestazione con logo, menu laterale (a scomparsa su cellulare) e sezione corrente. */
export function App() {
  const [section, setSection] = useState<Section>(() => sectionFromHash(window.location.hash));
  // Full Set da personalizzare: passa da Full Sets a Custom Sets, che apre subito la modifica
  const [customizing, setCustomizing] = useState<FullSet | null>(null);
  const customizingOpened = useCallback(() => setCustomizing(null), []);
  const [menuOpened, { toggle: toggleMenu, close: closeMenu }] = useDisclosure(false);

  useEffect(() => {
    const onHashChange = () => setSection(sectionFromHash(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

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
        {MENU.map((entry) => (
          <NavLink
            key={entry.section}
            active={entry.section === section}
            label={entry.label}
            description={entry.description}
            leftSection={<entry.icon size={22} stroke={1.8} />}
            onClick={() => navigate(entry.section)}
            variant="filled"
            py="sm"
            style={{ borderRadius: 10 }}
            fw={700}
          />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>
        {section === 'items' && <ItemsPage onGoToCensus={() => navigate('census')} />}
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
      </AppShell.Main>
    </AppShell>
  );
}
