import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { WebSocketProvider } from './websockets/wsContext';
import { Provider } from 'react-redux';
import { store } from './redux/store';

createRoot(document.getElementById('root')!).render(
  // <WebSocketProvider>
  <Provider store={store}>

    <React.StrictMode>
      <App />

    </React.StrictMode>
  </Provider>

  /* </WebSocketProvider> */

);
