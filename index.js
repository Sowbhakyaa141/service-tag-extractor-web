import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { HashRouter } from 'react-router-dom';  // If you're using React Router

// Get the root element
const container = document.getElementById('root');
const root = createRoot(container);

// Render the app
root.render(
  <React.StrictMode>
    <HashRouter basename="/service-tag-extractor-web">
      <App />
    </HashRouter>
  </React.StrictMode>
);