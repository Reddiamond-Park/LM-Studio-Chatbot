import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

setTimeout(() => {
  const container = document.getElementById('root');
  if (container) {
    const root = ReactDOM.createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
}, 100);
