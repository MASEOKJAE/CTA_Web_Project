import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import axios from 'axios';

axios.defaults.baseURL = "http://52.78.24.85:3000";

axios.defaults.withCredentials = true;

const rootElement = document.getElementById('root');
const root = rootElement.createRoot ? rootElement.createRoot() : ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);