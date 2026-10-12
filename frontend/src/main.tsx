import '@fontsource/nunito/400.css';
import '@fontsource/nunito/700.css';
import '@fontsource/lilita-one/400.css';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './styles.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { Providers } from './Providers';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Elemento #root mancante');
}
createRoot(root).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>,
);
