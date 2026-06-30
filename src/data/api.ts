/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Klien API ke backend Express + MySQL.
 * Base URL bisa diatur lewat env VITE_API_BASE, default ke localhost:3001.
 */

const API_BASE =
  ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_BASE) ||
  'http://localhost:3001';

export interface BootstrapData {
  users?: unknown[];
  kategori?: unknown[];
  barang?: unknown[];
  peminjaman?: unknown[];
  pengaturan?: unknown | null;
}

/** Ambil seluruh data awal dari backend dalam satu panggilan. */
export async function apiBootstrap(): Promise<BootstrapData> {
  const res = await fetch(`${API_BASE}/api/bootstrap`);
  if (!res.ok) throw new Error(`Bootstrap gagal: HTTP ${res.status}`);
  return res.json();
}

/**
 * Kirim koleksi/data ke backend (bulk replace). Fire-and-forget:
 * error hanya dicatat ke console agar tidak memblokir UI (data lokal tetap aman
 * tersimpan di localStorage sebagai mirror).
 */
export async function apiPut(path: string, body: unknown): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const detail = await res.json().catch(() => ({}));
      console.error(`[API] PUT ${path} gagal (HTTP ${res.status}):`, (detail as { error?: string }).error || '');
    }
  } catch (err) {
    console.error(`[API] PUT ${path} error koneksi:`, err);
  }
}
