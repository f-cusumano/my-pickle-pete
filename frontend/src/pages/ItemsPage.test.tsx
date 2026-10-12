import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Providers } from '../Providers';
import { CONSTANTS, ITEMS } from '../test/fixtures';
import { ItemsPage } from './ItemsPage';

function fakeBackend(input: string): Promise<Response> {
  const body = input.startsWith('/api/constants/game') ? CONSTANTS : ITEMS;
  return Promise.resolve(
    new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } }),
  );
}

function renderPage() {
  return render(
    <Providers fetchApi={fakeBackend} environment="test">
      <ItemsPage onGoToCensus={() => undefined} />
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
    expect(within(pistolRow!).getByText('Epico')).toBeInTheDocument();
    expect(within(pistolRow!).getByText('1 / 10')).toBeInTheDocument();
    expect(within(pistolRow!).getByText('A distanza')).toBeInTheDocument();
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
