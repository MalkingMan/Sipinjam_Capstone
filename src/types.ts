/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'siswa' | 'guru' | 'admin';

export interface User {
  id: string; // matches nis_nip (for simplicity in prototype login)
  nis_nip: string;
  nama: string;
  email: string;
  role: UserRole;
  kelas_jabatan: string;
  organisasi?: string;
  password?: string;
}

export interface Kategori {
  id: string;
  nama: string;
  ikon: string; // lucide icon name
}

export type BarangStatus = 'aktif' | 'perawatan' | 'nonaktif';

export interface Barang {
  id: string; // e.g., 'BRG-1'
  kode: string; // e.g., 'PRJ-001', 'MIC-002'
  nama: string;
  kategori_id: string;
  foto: string; // image placeholder/url
  stok_total: number;
  stok_tersedia: number;
  lokasi: string;
  status: BarangStatus;
  deskripsi: string;
  spesifikasi?: {
    merk?: string;
    tipe?: string;
    [key: string]: string | undefined;
  };
}

export type PeminjamanStatus = 'menunggu_surat' | 'menunggu' | 'disetujui' | 'ditolak' | 'dipinjam' | 'selesai' | 'terlambat';
export type KategoriKegiatan = 'osis' | 'ekskul' | 'kelas' | 'pribadi';

export interface DetailPeminjaman {
  barang_id: string;
  jumlah: number;
  kondisi_kembali?: 'baik' | 'rusak_ringan' | 'rusak_berat' | 'hilang';
  catatan_kondisi?: string;
}

export interface Peminjaman {
  id: string; // e.g. 'PJM-2026-001'
  kode: string;
  peminjam_id: string; // references User.id
  peminjam_nama: string; // cached for easy rendering
  peminjam_role: UserRole; // cached
  peminjam_kelas: string; // cached
  approver_id?: string;
  tgl_pengajuan: string; // ISO Date YYYY-MM-DD
  tgl_mulai: string; // ISO Date YYYY-MM-DD
  tgl_kembali_rencana: string; // ISO Date YYYY-MM-DD
  tgl_kembali_aktual?: string; // ISO Date YYYY-MM-DD
  status: PeminjamanStatus;
  keperluan: string; // brief descriptions
  kategori_kegiatan: KategoriKegiatan;
  catatan_peminjam?: string;
  catatan_admin?: string; // reasons for rejection/revisions
  items: DetailPeminjaman[];
  
  // Extension for Surat Permohonan
  surat_nama_kegiatan?: string;
  surat_hari?: string;
  surat_tanggal_kegiatan?: string;
  surat_waktu_mulai?: string;
  surat_waktu_selesai?: string;
  surat_tempat?: string;
  surat_ketua_panitia?: string;
  surat_nis_ketua?: string;
}
