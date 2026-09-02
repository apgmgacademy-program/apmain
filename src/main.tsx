import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import '@fontsource-variable/manrope';
import '@fontsource-variable/inter';
import './styles/index.css';
import './styles/site.css';
import './i18n';
import App from './App';
import { installGreekDisplayGuard } from './lib/greekDisplayGuard';

installGreekDisplayGuard();

// Every route is prerendered (scripts/prerender.mjs), so the root already has
// markup and this attaches to it rather than replacing it. A mismatch here means
// the server and client disagreed about what to render - React logs it, and it
// is a bug worth fixing rather than papering over with createRoot.
hydrateRoot(
  document.getElementById('root')!,
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
