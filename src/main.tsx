import React from 'react';
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client';
import App from './App';
import { ToastContainer } from 'react-toastify';
import { ThemeProvider } from './components/ThemeProvider'
import { BrowserRouter } from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.css'; // Optional, but often needed for styling

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
