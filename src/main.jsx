import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import DemoApp from './demo/DemoApp';
const LiveApp = import.meta.env.VITE_DEMO_MODE === 'false' ? lazy(() => Promise.all([import('./App'), import('./index.css')]).then(([app])=>app)) : null;
ReactDOM.createRoot(document.getElementById('root')).render(LiveApp ? <Suspense fallback={<p>Loading competition…</p>}><LiveApp/></Suspense> : <DemoApp/>);
