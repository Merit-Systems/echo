import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { EchoProvider } from '@merit-systems/echo-react-sdk';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <EchoProvider config={{ appId: import.meta.env.VITE_ECHO_APP_ID! }}>
      <App />
    </EchoProvider>
  </StrictMode>
);
