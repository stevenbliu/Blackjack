import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './app/store';

createRoot(document.getElementById('root')!).render(

  <Provider store={store}>
    <React.StrictMode>
      <App />
      <h1>12321321</h1>
    </React.StrictMode>
  </Provider>
);
