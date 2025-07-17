import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './app/store';
createRoot(document.getElementById('root')).render(_jsx(Provider, { store: store, children: _jsx(React.StrictMode, { children: _jsx(App, {}) }) }));
