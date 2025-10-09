
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// This file is for standalone Vite builds only
// For Next.js integration, see app/page.tsx

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Get API key from localStorage for standalone mode
const apiKey = typeof window !== 'undefined' ? window.localStorage.getItem('GEMINI_API_KEY') || '' : '';

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App apiKey={apiKey} />
  </React.StrictMode>
);
