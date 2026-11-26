import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/fraunces/latin-400.css';
import '@fontsource/fraunces/latin-500.css';
import '@fontsource/fraunces/latin-600.css';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import './styles/tokens.css';
import './styles/global.css';
import App from './App';
import { registerSW } from 'virtual:pwa-register';

// PWA: instala a versão nova assim que existir e procura atualizações sempre que a app volta a ficar visível
// (no iPhone a app instalada pode ficar dias aberta em segundo plano).
registerSW({
  immediate: true,
  onRegisteredSW(_url, r) {
    if (!r) return;
    const procurar = () => { r.update().catch(() => {}); };
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') procurar(); });
    setInterval(procurar, 30 * 60 * 1000);
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
