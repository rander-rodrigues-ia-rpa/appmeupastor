import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Apenas renderiza o App. O roteamento está dentro dele. */}
    <App />
  </React.StrictMode>
);