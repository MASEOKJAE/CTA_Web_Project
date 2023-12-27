import React from 'react';
import ReactDOM from 'react-dom';
import { AuthProvider } from '/home/ubuntu/WorkSpace/CTA_Web_Project/src/layouts/dashboard/AuthContext.js';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
