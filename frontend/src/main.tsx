import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import './styles/global.css';
import { AuthProvider } from './hooks/useAuth';

// Polyfill for libraries that expect a Node-like `global` in the browser (e.g. sockjs-client)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(window as any).global = window;

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

