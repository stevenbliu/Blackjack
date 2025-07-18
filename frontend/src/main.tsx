import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
createRoot(document.getElementById('root')!).render(

  <Provider store={store}>
    <DndProvider backend={HTML5Backend}>

    <React.StrictMode>
      <App />
    </React.StrictMode>
    
    </DndProvider>
  </Provider>
);
