/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Kategori, Barang, Peminjaman, DetailPeminjaman } from '../types';
import { initializeDatabase } from './seedData';
import { apiBootstrap, apiPut } from './api';

// Seed localStorage sebagai fallback (dipakai jika backend tidak terjangkau).
initializeDatabase();

/**
 * Tarik seluruh data dari backend MySQL ke localStorage (mirror lokal).
 * Dipanggil sekali saat aplikasi dimuat (lihat main.tsx) SEBELUM render,
 * sehingga semua getX() membaca data terbaru dari backend. Bila backend
 * tidak terjangkau, data localStorage (fallback/seed) tetap dipakai.
 */
export async function hydrateFromBackend(): Promise<boolean> {
  try {
    const data = await apiBootstrap();
    if (Array.isArray(data.users)) localStorage.setItem('sipinjam_users', JSON.stringify(data.users));
    if (Array.isArray(data.kategori)) localStorage.setItem('sipinjam_kategori', JSON.stringify(data.kategori));
    if (Array.isArray(data.barang)) localStorage.setItem('sipinjam_barang', JSON.stringify(data.barang));
    if (Array.isArray(data.peminjaman)) localStorage.setItem('sipinjam_peminjaman', JSON.stringify(data.peminjaman));
    if (data.pengaturan) localStorage.setItem('sipinjam_pengaturan_surat', JSON.stringify(data.pengaturan));
    return true;
  } catch (err) {
    console.warn('[SIPINJAM] Backend tidak terjangkau — memakai data lokal (localStorage).', err);
    return false;
  }
}

export function getUsers(): User[] {
  const data = localStorage.getItem('sipinjam_users');
  return data ? JSON.parse(data) : [];
}

export function saveUsers(users: User[]) {
  localStorage.setItem('sipinjam_users', JSON.stringify(users));
  apiPut('/api/users', users);
}

export function getKategori(): Kategori[] {
  const data = localStorage.getItem('sipinjam_kategori');
  return data ? JSON.parse(data) : [];
}

export function saveKategori(kategori: Kategori[]) {
  localStorage.setItem('sipinjam_kategori', JSON.stringify(kategori));
  apiPut('/api/kategori', kategori);
}

export function getBarang(): Barang[] {
  const data = localStorage.getItem('sipinjam_barang');
  return data ? JSON.parse(data) : [];
}

export function saveBarang(barang: Barang[]) {
  localStorage.setItem('sipinjam_barang', JSON.stringify(barang));
  apiPut('/api/barang', barang);
}

export function getPeminjaman(): Peminjaman[] {
  const data = localStorage.getItem('sipinjam_peminjaman');
  return data ? JSON.parse(data) : [];
}

export function savePeminjaman(peminjaman: Peminjaman[]) {
  localStorage.setItem('sipinjam_peminjaman', JSON.stringify(peminjaman));
  apiPut('/api/peminjaman', peminjaman);
}

/**
 * Tandai peminjaman berstatus 'dipinjam' yang sudah melewati tanggal
 * rencana kembali menjadi 'terlambat'. Idempoten — hanya menyimpan
 * jika ada perubahan.
 */
export function markOverdueLoans() {
  const loans = getPeminjaman();
  const today = new Date().toISOString().split('T')[0];
  let changed = false;
  const updated: Peminjaman[] = loans.map((l) => {
    if (l.status === 'dipinjam' && l.tgl_kembali_rencana < today) {
      changed = true;
      return { ...l, status: 'terlambat' };
    }
    return l;
  });
  if (changed) savePeminjaman(updated);
}

export interface PengaturanSurat {
  waka_kesiswaan_nama: string;
  waka_kesiswaan_nip: string;
  waka_sarpras_nama: string;
  waka_sarpras_nip: string;
  surat_counter: number;
  surat_tahun: number;
  logo_sekolah: string; // base64
}

export function getPengaturanSurat(): PengaturanSurat {
  const data = localStorage.getItem('sipinjam_pengaturan_surat');
  if (data) return JSON.parse(data);
  return {
    waka_kesiswaan_nama: 'Jajan Wahyudi, S.Pd',
    waka_kesiswaan_nip: '197001171979021001',
    waka_sarpras_nama: 'Zhainuri, S.Pd',
    waka_sarpras_nip: '197204282006011007',
    surat_counter: 1,
    surat_tahun: new Date().getFullYear(),
    logo_sekolah: ''
  };
}

export function savePengaturanSurat(pengaturan: PengaturanSurat) {
  localStorage.setItem('sipinjam_pengaturan_surat', JSON.stringify(pengaturan));
  apiPut('/api/pengaturan-surat', pengaturan);
}

export function getDaftarPinjam(): DetailPeminjaman[] {
  const data = localStorage.getItem('sipinjam_daftar_pinjam');
  if (data) return JSON.parse(data);
  return [];
}

export function saveDaftarPinjam(items: DetailPeminjaman[]) {
  localStorage.setItem('sipinjam_daftar_pinjam', JSON.stringify(items));
}

export function clearDaftarPinjam() {
  localStorage.removeItem('sipinjam_daftar_pinjam');
}

// Simulated active session
export function getCurrentUser(): User | null {
  const data = localStorage.getItem('sipinjam_current_user');
  return data ? JSON.parse(data) : null;
}

export function setCurrentUser(user: User | null) {
  if (user) {
    localStorage.setItem('sipinjam_current_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('sipinjam_current_user');
  }
}
