import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

interface ViteImportMeta {
  readonly env?: {
    readonly VITE_GEMINI_API_KEY?: string;
    // Allow other env vars without strict typing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// For the standalone Vite build, read the API key from an environment variable.
// This keeps configuration external while the Next.js shell passes the key via props.
const viteImportMeta = import.meta as unknown as ViteImportMeta;
const apiKey = viteImportMeta.env?.VITE_GEMINI_API_KEY;

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App apiKey={apiKey ?? ""} />
  </React.StrictMode>
);