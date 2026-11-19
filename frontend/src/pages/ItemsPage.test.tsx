import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { CurrentUser } from '../api/types';
import { Providers } from '../Providers';
import { CONSTANTS, ITEMS, USER } from '../test/fixtures';
import { ItemsPage } from './ItemsPage';

/** Backend finto con {@code user} come utente della sessione. */
function fakeBackend(user: CurrentUser) {
  return (input: string): Promise<Response> => {
    const body = input.includes('/api/constants/game') ? CONSTANTS : input.endsWith('/api/user') ? user : ITEMS;
    return Promise.resolve(
      new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } }),
    );
  };
}

function renderPage(user: CurrentUser = USER) {
  return render(
    <Providers fetchApi={fakeBackend(user)} environment="test">
      <ItemsPage />
    </Providers>,
  );
}

describe('ItemsPage', () => {
  it('shows every item with its columns', async () => {
    renderPage();
    expect(await screen.findByText('Cappellaccio')).toBeInTheDocument();
    expect(screen.getByText('Pistola')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(ITEMS.length + 1);
    const pistolRow = screen.getByText('Pistola').closest('tr');
    expect(pistolRow).not.toBeNull();
    expect(await within(pistolRow!).findByText('Epico')).toBeInTheDocument();
    expect(within(pistolRow!).getByText('1 / 10')).toBeInTheDocument();
    expect(within(pistolRow!).getByText('A distanza')).toBeInTheDocument();
  });

  it('without progress (admin) hides rarity and level', async () => {
    renderPage({ ...USER, role: 'ADMIN' });
    expect(await screen.findByText('Cappellaccio')).toBeInTheDocument();
    expect(screen.queryByText('Livello')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Filtra Rarità' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Filtra Tipologia' })).toBeInTheDocument();
  });

  it('filters by name while typing', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Cappellaccio');
    await user.type(screen.getByRole('textbox', { name: 'Cerca per nome' }), 'pist');
    expect(screen.getByText('Pistola')).toBeInTheDocument();
    expect(screen.queryByText('Cappellaccio')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancella la ricerca' }));
    expect(screen.getByText('Cappellaccio')).toBeInTheDocument();
  });

  it('header check selects visible rows and enables the eye', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Cappellaccio');
    const eye = screen.getByRole('button', { name: 'Vedi gli item selezionati' });
    expect(eye).toBeDisabled();
    await user.click(screen.getByRole('checkbox', { name: 'Seleziona tutte le righe visibili' }));
    expect(screen.getByRole('checkbox', { name: 'Seleziona Pistola' })).toBeChecked();
    expect(eye).toBeEnabled();
    await user.click(eye);
    expect(await screen.findByText(`Item selezionati (${String(ITEMS.length)})`)).toBeInTheDocument();
  });

  it('row filtered out leaves the selection', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Cappellaccio');
    await user.click(screen.getByRole('checkbox', { name: 'Seleziona Pistola' }));
    await user.click(screen.getByRole('button', { name: 'Filtra Tipologia' }));
    await user.click(await screen.findByRole('checkbox', { name: 'Armatura' }));
    expect(screen.queryByText('Pistola')).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Seleziona tutte le righe visibili' })).not.toBeChecked();
    expect(screen.getByRole('button', { name: 'Filtra Tipologia' })).toBeInTheDocument();
  });
});
