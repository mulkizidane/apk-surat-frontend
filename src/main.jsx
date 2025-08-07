import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
// 1. Import AuthProvider dari context
import { AuthProvider } from './context/AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
