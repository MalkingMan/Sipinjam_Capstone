import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { hydrateFromBackend, markOverdueLoans } from './data/db';

const rootEl = document.getElementById('root')!;

// Tampilkan loader singkat selagi menarik data dari backend MySQL.
rootEl.innerHTML = `
  <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:#f8fafc;font-family:Inter,system-ui,sans-serif;color:#334155">
    <div style="width:34px;height:34px;border:3px solid #cbd5e1;border-top-color:#334155;border-radius:9999px;animation:spin 0.7s linear infinite"></div>
    <div style="font-size:13px;font-weight:500">Memuat data SIPINJAM…</div>
    <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
  </div>
`;

async function boot() {
  // Sinkronkan localStorage dari backend (sumber kebenaran), lalu evaluasi keterlambatan.
  await hydrateFromBackend();
  markOverdueLoans();

  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

boot();
