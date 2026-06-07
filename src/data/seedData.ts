/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Kategori, Barang, Peminjaman } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: '12345678',
    nis_nip: '12345678',
    nama: 'Dimas Aditya',
    email: 'dimas@sman1sentolo.sch.id',
    role: 'siswa',
    kelas_jabatan: 'Kelas XI IPS 1',
    organisasi: 'OSIS (Ketua Sie Acara)',
    password: 'password123'
  },
  {
    id: '1980110301',
    nis_nip: '1980110301',
    nama: 'Bu Sri Ratri, S.Pd.',
    email: 'ratri@sman1sentolo.sch.id',
    role: 'guru',
    kelas_jabatan: 'Guru Biologi / Pembina Pramuka',
    organisasi: 'Gerakan Pramuka',
    password: 'password123'
  },
  {
    id: '1978052402',
    nis_nip: '1978052402',
    nama: 'Pak Bagas Setyawan',
    email: 'bagas@sman1sentolo.sch.id',
    role: 'admin',
    kelas_jabatan: 'Staf Tata Usaha Bidang Sarpras',
    password: 'password123'
  }
];

export const INITIAL_KATEGORI: Kategori[] = [
  { id: 'elektronik', nama: 'Elektronik & Multimedia', ikon: 'Laptop' },
  { id: 'olahraga', nama: 'Peralatan Olahraga', ikon: 'Dribbble' },
  { id: 'kesenian', nama: 'Alat Musik & Kesenian', ikon: 'Music' },
  { id: 'laboratorium', nama: 'Alat Laboratorium', ikon: 'FlaskConical' },
  { id: 'perabot', nama: 'Perabot & Perlengkapan Acara', ikon: 'CalendarDays' }
];

export const INITIAL_BARANG: Barang[] = [
  {
    id: 'BRG-001',
    kode: 'PRJ-E01',
    nama: 'Proyektor Epson EB-X400',
    kategori_id: 'elektronik',
    foto: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=600&auto=format&fit=crop&q=60',
    stok_total: 5,
    stok_tersedia: 4,
    lokasi: 'Ruang Multimedia TU',
    status: 'aktif',
    deskripsi: 'Proyektor Epson resolusi XGA dengan kecerahan 3300 lumens. Dilengkapi kabel HDMI, kabel VGA, remote kontrol, dan tas jinjing. Sangat cocok untuk presentasi kelas atau rapat OSIS.',
    spesifikasi: {
      'Merk': 'Epson',
      'Resolusi': 'XGA (1024x768)',
      'Konektivitas': 'HDMI, VGA, USB',
      'Kondisi': 'Baik'
    }
  },
  {
    id: 'BRG-002',
    kode: 'MIC-W02',
    nama: 'Microphone Wireless JBL Dual',
    kategori_id: 'elektronik',
    foto: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&auto=format&fit=crop&q=60',
    stok_total: 3,
    stok_tersedia: 3,
    lokasi: 'Loker Inventaris TU',
    status: 'aktif',
    deskripsi: 'Satu set mic nirkabel (2 mic genggam + 1 receiver). Suara jernih UHF, baterai tahan hingga 6 jam. Cocok untuk acara di aula, ibadah sekolah, atau upacara bendera.',
    spesifikasi: {
      'Merk': 'JBL',
      'Frekuensi': 'UHF Wireless',
      'Kelengkapan': '2 Mic + Receiver + Charger',
      'Kondisi': 'Sangat Baik'
    }
  },
  {
    id: 'BRG-003',
    kode: 'SPK-B03',
    nama: 'Speaker Portable Baretone 15 Inch',
    kategori_id: 'elektronik',
    foto: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=60',
    stok_total: 2,
    stok_tersedia: 1,
    lokasi: 'Gudang Sarpras Belakang',
    status: 'aktif',
    deskripsi: 'Speaker active portable 15 inch dengan roda dan handle tarik. Dilengkapi koneksi Bluetooth, SD Card, USB, dan input gitar. Baterai internal dapat dicharge.',
    spesifikasi: {
      'Merk': 'Baretone',
      'Daya': '250 Watt',
      'Fitur': 'Bluetooth, Battery Built-in',
      'Kondisi': 'Normal (Baret pemakaian)'
    }
  },
  {
    id: 'BRG-004',
    kode: 'MKS-O04',
    nama: 'Mikroskop Binokuler Olympus CX23',
    kategori_id: 'laboratorium',
    foto: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=600&auto=format&fit=crop&q=60',
    stok_total: 8,
    stok_tersedia: 8,
    lokasi: 'Laboratorium Biologi',
    status: 'aktif',
    deskripsi: 'Mikroskop binokuler standar institusi dengan pencahayaan LED yang tahan lama. Pembesaran obyektif hingga 100x. Dipergunakan bagi praktikum Biologi siswa.',
    spesifikasi: {
      'Merk': 'Olympus',
      'Tipe': 'CX23 LED',
      'Pembesaran': '40x - 1000x',
      'Sistem': 'Binokuler'
    }
  },
  {
    id: 'BRG-005',
    kode: 'BBL-M05',
    nama: 'Bola Basket Molten GG7X Kulit',
    kategori_id: 'olahraga',
    foto: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a27?w=600&auto=format&fit=crop&q=60',
    stok_total: 6,
    stok_tersedia: 4,
    lokasi: 'Lemari Guru Olahraga',
    status: 'aktif',
    deskripsi: 'Bola basket Molten original seri GG7X bahan kulit sintetis kualitas tinggi. Standar FIBA, size 7 untuk turnamen, pegangan mantap dan bertekstur rata.',
    spesifikasi: {
      'Merk': 'Molten',
      'Ukuran': 'Size 7 (Pria)',
      'Bahan': 'Premium Composite Leather'
    }
  }
];

export const INITIAL_PEMINJAMAN: Peminjaman[] = [
  {
    id: 'PJM-001',
    kode: 'PJM-2026-001',
    peminjam_id: '12345678', // Dimas
    peminjam_nama: 'Dimas Aditya',
    peminjam_role: 'siswa',
    peminjam_kelas: 'Kelas XI IPS 1',
    status: 'disetujui',
    tgl_pengajuan: '2026-05-30',
    tgl_mulai: '2026-06-06',
    tgl_kembali_rencana: '2026-06-08',
    keperluan: 'Persiapan dan Pelaksanaan Class Meeting Semester Genap',
    kategori_kegiatan: 'osis',
    catatan_peminjam: 'Mohon dibantu disetujui Pak, speaker penting untuk pengumuman lomba tanding.',
    catatan_admin: 'Disetujui. Silakan ambil di gudang sarpras H-1 pagi hari.',
    items: [
      {
        barang_id: 'BRG-003', // Speaker
        jumlah: 1
      },
      {
        barang_id: 'BRG-001', // Proyektor
        jumlah: 1
      }
    ]
  },
  {
    id: 'PJM-002',
    kode: 'PJM-2026-002',
    peminjam_id: '1980110301', // Bu Sri Ratri
    peminjam_nama: 'Bu Sri Ratri, S.Pd.',
    peminjam_role: 'guru',
    peminjam_kelas: 'Guru Biologi / Pembina Pramuka',
    status: 'menunggu',
    tgl_pengajuan: '2026-06-03',
    tgl_mulai: '2026-06-07',
    tgl_kembali_rencana: '2026-06-11',
    keperluan: 'Kegiatan Perkemahan Penerimaan Tamu Ambalan (PTA) Pramuka SMAN 1 Sentolo',
    kategori_kegiatan: 'ekskul',
    catatan_peminjam: 'Meminjam bola basket untuk lomba olahraga antar regu pramuka.',
    items: [
      {
        barang_id: 'BRG-005', // Bola Basket
        jumlah: 2
      }
    ]
  }
];

export function initializeDatabase() {
  if (!localStorage.getItem('sipinjam_users')) {
    localStorage.setItem('sipinjam_users', JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem('sipinjam_kategori')) {
    localStorage.setItem('sipinjam_kategori', JSON.stringify(INITIAL_KATEGORI));
  }
  if (!localStorage.getItem('sipinjam_barang')) {
    localStorage.setItem('sipinjam_barang', JSON.stringify(INITIAL_BARANG));
  }
  if (!localStorage.getItem('sipinjam_peminjaman')) {
    localStorage.setItem('sipinjam_peminjaman', JSON.stringify(INITIAL_PEMINJAMAN));
  }
}
