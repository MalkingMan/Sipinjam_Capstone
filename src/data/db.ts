/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Kategori, Barang, Peminjaman } from '../types';
import { initializeDatabase } from './seedData';

// Ensure seed data is populated
initializeDatabase();

export function getUsers(): User[] {
  const data = localStorage.getItem('sipinjam_users');
  return data ? JSON.parse(data) : [];
}

export function saveUsers(users: User[]) {
  localStorage.setItem('sipinjam_users', JSON.stringify(users));
}

export function getKategori(): Kategori[] {
  const data = localStorage.getItem('sipinjam_kategori');
  return data ? JSON.parse(data) : [];
}

export function saveKategori(kategori: Kategori[]) {
  localStorage.setItem('sipinjam_kategori', JSON.stringify(kategori));
}

export function getBarang(): Barang[] {
  const data = localStorage.getItem('sipinjam_barang');
  return data ? JSON.parse(data) : [];
}

export function saveBarang(barang: Barang[]) {
  localStorage.setItem('sipinjam_barang', JSON.stringify(barang));
}

export function getPeminjaman(): Peminjaman[] {
  const data = localStorage.getItem('sipinjam_peminjaman');
  return data ? JSON.parse(data) : [];
}

export function savePeminjaman(peminjaman: Peminjaman[]) {
  localStorage.setItem('sipinjam_peminjaman', JSON.stringify(peminjaman));
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
