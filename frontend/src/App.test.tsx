import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';
import type { CurrentUser } from './api/types';
import { Providers } from './Providers';
import { CONSTANTS, ITEMS, USER } from './test/fixtures';

const ADMIN: CurrentUser = { ...USER, id: 1, nickname: 'admin', role: 'ADMIN' };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

/** Backend finto: l'utente della sessione (null = nessuna sessione, 401) e il login che restituisce {@code loggedIn}. */
function fakeBackend(user: CurrentUser | null, loggedIn: CurrentUser = USER) {
  return (input: string): Promise<Response> => {
    if (input.endsWith('/api/user')) {
      return Promise.resolve(user ? json(user) : json({ key: 'x', code: 'NOT_AUTHENTICATED', messages: [] }, 401));
    }
    if (input.endsWith('/api/auth/login')) return Promise.resolve(json(loggedIn));
    if (input.includes('/api/constants/game')) return Promise.resolve(json(CONSTANTS));
    return Promise.resolve(json(ITEMS));
  };
}

function renderApp(fetchApi: (input: string) => Promise<Response>) {
  return render(
    <Providers fetchApi={fetchApi} environment="test">
      <App />
    </Providers>,
  );
}

describe('App', () => {
  it('without a session shows the login, then the app of the logged-in user', async () => {
    const user = userEvent.setup();
    renderApp(fakeBackend(null));
    await user.type(await screen.findByLabelText('Nickname'), 'francesco');
    await user.type(screen.getByLabelText('Password'), 'segreta123');
    await user.click(screen.getByRole('button', { name: 'Accedi' }));
    expect(await screen.findByText('Cappellaccio')).toBeInTheDocument();
    expect(screen.getByText('Custom Sets')).toBeInTheDocument();
    expect(screen.queryByText('Censimento')).not.toBeInTheDocument();
  });

  it('the admin sees the census and no custom sets', async () => {
    renderApp(fakeBackend(ADMIN));
    expect(await screen.findByText('Censimento')).toBeInTheDocument();
    expect(screen.queryByText('Custom Sets')).not.toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument(); //Profilo con il nickname
  });
});
