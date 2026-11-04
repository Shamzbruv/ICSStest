import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App.jsx';
import ThemeProvider from '@/components/ThemeProvider';
import { isBackendPreview } from '@/api/base44Client';
import '@/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <ThemeProvider>
    {isBackendPreview && <div role="status" className="bg-primary/10 border-b border-primary/30 px-4 py-2 text-center text-xs text-foreground">Preview — backend connection pending. Accounts, voting, and payments are unavailable.</div>}
    <App />
  </ThemeProvider>
);
