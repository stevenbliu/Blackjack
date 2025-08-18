import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { BrowserRouter } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './tailwind.css';

// import styles from 'index.module.css'


createRoot(document.getElementById('root')!).render(

  <Provider store={store}>
    <DndProvider backend={HTML5Backend}>
      {/* <React.StrictMode> */}
        <BrowserRouter>
          <App />
        </BrowserRouter>
      {/* </React.StrictMode> */}
    </DndProvider>
  </Provider>
);
