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
export interface RegisterPayload {
  nis_nip: string;
  nama: string;
  email?: string;
  kelas_jabatan: string;
  organisasi?: string;
  password: string;
}

export async function apiRegister(data: RegisterPayload): Promise<{ user: unknown }> {
  const res = await fetch(`${API_BASE}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((json as { error?: string }).error || `HTTP ${res.status}`);
  return json as { user: unknown };
}

export async function apiUpdateProfile(id: string, data: {
  nama: string;
  email?: string;
  kelas_jabatan: string;
  organisasi?: string;
  password_lama?: string;
  password_baru?: string;
}): Promise<{ user: unknown }> {
  const res = await fetch(`${API_BASE}/api/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((json as { error?: string }).error || `HTTP ${res.status}`);
  return json as { user: unknown };
}

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
