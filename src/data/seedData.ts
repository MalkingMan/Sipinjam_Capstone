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
  },
  {
    id: 'BRG-006',
    kode: 'PBT-W06',
    nama: 'Papan Tulis Whiteboard 120x240',
    kategori_id: 'perabot',
    foto: 'https://images.unsplash.com/photo-1577563908411-50cb98976fea?w=600&auto=format&fit=crop&q=60',
    stok_total: 10,
    stok_tersedia: 10,
    lokasi: 'Gudang Sarpras Utama',
    status: 'aktif',
    deskripsi: 'Papan tulis putih ukuran besar untuk ruang kelas atau ruang rapat. Dilengkapi dengan roda yang bisa dikunci.',
    spesifikasi: {
      'Merk': 'Sakura',
      'Ukuran': '120x240 cm',
      'Material': 'Magnetik',
      'Kondisi': 'Baik'
    }
  },
  {
    id: 'BRG-007',
    kode: 'KSN-G07',
    nama: 'Gitar Akustik Yamaha F310',
    kategori_id: 'kesenian',
    foto: 'https://images.unsplash.com/photo-1550227298-1b22db9eb2c5?w=600&auto=format&fit=crop&q=60',
    stok_total: 4,
    stok_tersedia: 4,
    lokasi: 'Ruang Seni Musik',
    status: 'aktif',
    deskripsi: 'Gitar akustik standar untuk pembelajaran seni musik atau ekstrakurikuler band. Senar mudah diatur dan suara nyaring.',
    spesifikasi: {
      'Merk': 'Yamaha',
      'Tipe': 'F310',
      'Jenis': 'Akustik String',
      'Kondisi': 'Baik'
    }
  },
  {
    id: 'BRG-008',
    kode: 'ORG-M08',
    nama: 'Matras Senam Lantai Ketebalan 10cm',
    kategori_id: 'olahraga',
    foto: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=60',
    stok_total: 15,
    stok_tersedia: 15,
    lokasi: 'Gudang Olahraga',
    status: 'aktif',
    deskripsi: 'Matras tebal yang biasa digunakan untuk kegiatan senam lantai (roll depan, belakang, sikap lilin).',
    spesifikasi: {
      'Merk': 'Kettler',
      'Ketebalan': '10 cm',
      'Material': 'Busa Super',
      'Kondisi': 'Cukup Baik'
    }
  },
  {
    id: 'BRG-009',
    kode: 'PBT-T09',
    nama: 'Tenda Dome Pramuka Kapasitas 6-8 Orang',
    kategori_id: 'perabot',
    foto: 'https://images.unsplash.com/photo-1504280390224-dd94fb778641?w=600&auto=format&fit=crop&q=60',
    stok_total: 8,
    stok_tersedia: 8,
    lokasi: 'Ruang Pramuka',
    status: 'aktif',
    deskripsi: 'Tenda dome double layer anti air yang bisa menampung satu regu pramuka. Cocok untuk kemah persami.',
    spesifikasi: {
      'Merk': 'Eiger',
      'Kapasitas': '6-8 Orang',
      'Tipe': 'Double Layer',
      'Kondisi': 'Baik'
    }
  },
  {
    id: 'BRG-010',
    kode: 'ELK-K10',
    nama: 'Kamera DSLR Canon EOS 1500D',
    kategori_id: 'elektronik',
    foto: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=60',
    stok_total: 2,
    stok_tersedia: 2,
    lokasi: 'Ruang Jurnalistik',
    status: 'aktif',
    deskripsi: 'Kamera DSLR standar untuk dokumentasi kegiatan sekolah. Termasuk lensa kit 18-55mm, memori 32GB, dan tas kamera.',
    spesifikasi: {
      'Merk': 'Canon',
      'Tipe': 'EOS 1500D',
      'Resolusi': '24.1 MP',
      'Kondisi': 'Sangat Baik'
    }
  },
  {
    id: 'BRG-011',
    kode: 'PBT-M11',
    nama: 'Meja Lipat Ujian Kayu',
    kategori_id: 'perabot',
    foto: 'https://images.unsplash.com/photo-1565538420870-da08ff96a207?w=600&auto=format&fit=crop&q=60',
    stok_total: 100,
    stok_tersedia: 95,
    lokasi: 'Gudang Sarpras Utama',
    status: 'aktif',
    deskripsi: 'Meja belajar lipat berbahan dasar kayu tebal, biasa digunakan saat ujian nasional atau tes massal di GOR.',
    spesifikasi: {
      'Merk': 'Lokal',
      'Bahan': 'Kayu Jati Belanda',
      'Model': 'Lipat',
      'Kondisi': 'Bervariasi'
    }
  },
  {
    id: 'BRG-012',
    kode: 'PBT-K12',
    nama: 'Kursi Lipat Chitose Hitam',
    kategori_id: 'perabot',
    foto: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=600&auto=format&fit=crop&q=60',
    stok_total: 200,
    stok_tersedia: 150,
    lokasi: 'Gedung Serba Guna',
    status: 'aktif',
    deskripsi: 'Kursi lipat besi dengan sandaran yang dapat digunakan untuk acara pertemuan wali murid atau pelepasan siswa.',
    spesifikasi: {
      'Merk': 'Chitose',
      'Warna': 'Hitam',
      'Material': 'Besi & Kalp',
      'Kondisi': 'Bervariasi'
    }
  },
  {
    id: 'BRG-013',
    kode: 'LAB-G13',
    nama: 'Gelas Ukur Laboratorium 500ml',
    kategori_id: 'laboratorium',
    foto: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=60',
    stok_total: 20,
    stok_tersedia: 20,
    lokasi: 'Laboratorium Kimia',
    status: 'aktif',
    deskripsi: 'Alat ukur volume cairan bahan kaca borosilikat tahan panas untuk keperluan praktikum kimia dasar.',
    spesifikasi: {
      'Merk': 'Pyrex',
      'Kapasitas': '500 ml',
      'Bahan': 'Kaca Borosilikat',
      'Kondisi': 'Utuh'
    }
  },
  {
    id: 'BRG-014',
    kode: 'ORG-R14',
    nama: 'Raket Bulutangkis Yonex',
    kategori_id: 'olahraga',
    foto: 'https://images.unsplash.com/photo-1613918431703-b09e25bfa139?w=600&auto=format&fit=crop&q=60',
    stok_total: 10,
    stok_tersedia: 10,
    lokasi: 'Gudang Olahraga',
    status: 'aktif',
    deskripsi: 'Raket untuk permainan bulu tangkis saat pelajaran penjasorkes atau kegiatan ekstrakurikuler.',
    spesifikasi: {
      'Merk': 'Yonex',
      'Tipe': 'Carbonex',
      'Tarikan': '24 lbs',
      'Kondisi': 'Baik'
    }
  },
  {
    id: 'BRG-015',
    kode: 'LAB-T15',
    nama: 'Timbangan Analitik Digital',
    kategori_id: 'laboratorium',
    foto: 'https://images.unsplash.com/photo-1621601006579-247659424840?w=600&auto=format&fit=crop&q=60',
    stok_total: 3,
    stok_tersedia: 3,
    lokasi: 'Laboratorium Fisika',
    status: 'aktif',
    deskripsi: 'Timbangan digital dengan tingkat presisi tinggi (hingga 0,001 gram) untuk menimbang bahan-bahan percobaan.',
    spesifikasi: {
      'Merk': 'Ohaus',
      'Kapasitas': 'Max 200g',
      'Akurasi': '0.001g',
      'Kondisi': 'Sangat Baik'
    }
  },
  {
    id: 'BRG-016',
    kode: 'ORG-C16',
    nama: 'Papan Catur Standar Turnamen',
    kategori_id: 'olahraga',
    foto: 'https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=600&auto=format&fit=crop&q=60',
    stok_total: 5,
    stok_tersedia: 5,
    lokasi: 'Ruang Guru Olahraga',
    status: 'aktif',
    deskripsi: 'Papan catur lipat beserta bidaknya. Terbuat dari kayu dengan ukuran kotak standar kompetisi (2 inci).',
    spesifikasi: {
      'Merk': 'Lokal',
      'Bahan': 'Kayu Jati',
      'Ukuran': '50x50 cm',
      'Kondisi': 'Baik'
    }
  },
  {
    id: 'BRG-017',
    kode: 'KSN-K17',
    nama: 'Keyboard Arranger Yamaha PSR',
    kategori_id: 'kesenian',
    foto: 'https://images.unsplash.com/photo-1590845947376-2638caa89309?w=600&auto=format&fit=crop&q=60',
    stok_total: 1,
    stok_tersedia: 1,
    lokasi: 'Ruang Kesenian',
    status: 'aktif',
    deskripsi: 'Keyboard elektronik untuk iringan paduan suara sekolah dan pentas seni. Termasuk stand keyboard dan adaptor.',
    spesifikasi: {
      'Merk': 'Yamaha',
      'Tipe': 'PSR-E463',
      'Tuts': '61 Keys',
      'Kondisi': 'Baik'
    }
  },
  {
    id: 'BRG-018',
    kode: 'ELK-T18',
    nama: 'Tripod Kamera Takara',
    kategori_id: 'elektronik',
    foto: 'https://images.unsplash.com/photo-1527011045974-4b5768cb4da7?w=600&auto=format&fit=crop&q=60',
    stok_total: 3,
    stok_tersedia: 3,
    lokasi: 'Ruang Jurnalistik',
    status: 'aktif',
    deskripsi: 'Tripod kokoh yang bisa digunakan untuk kamera DSLR, handycam, maupun smartphone untuk menstabilkan pengambilan gambar.',
    spesifikasi: {
      'Merk': 'Takara',
      'Tinggi': 'Max 1.5 Meter',
      'Bahan': 'Aluminium',
      'Kondisi': 'Baik'
    }
  },
  {
    id: 'BRG-019',
    kode: 'ORG-N19',
    nama: 'Net Bola Voli Mikasa',
    kategori_id: 'olahraga',
    foto: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=600&auto=format&fit=crop&q=60',
    stok_total: 4,
    stok_tersedia: 4,
    lokasi: 'Gudang Olahraga',
    status: 'aktif',
    deskripsi: 'Net voli nilon kualitas turnamen dengan kawat baja penguat di bagian atas agar net tidak kendur.',
    spesifikasi: {
      'Merk': 'Mikasa',
      'Bahan': 'Nilon & Sling Baja',
      'Panjang': '9.5 Meter',
      'Kondisi': 'Baru'
    }
  },
  {
    id: 'BRG-020',
    kode: 'ELK-M20',
    nama: 'Audio Mixer Yamaha 8 Channel',
    kategori_id: 'elektronik',
    foto: 'https://images.unsplash.com/photo-1598488035139-04d50937a70d?w=600&auto=format&fit=crop&q=60',
    stok_total: 1,
    stok_tersedia: 1,
    lokasi: 'Ruang Sound System',
    status: 'aktif',
    deskripsi: 'Mixer audio untuk mengatur keluaran suara beberapa mic dan instrumen secara bersamaan. Sangat krusial untuk event besar sekolah.',
    spesifikasi: {
      'Merk': 'Yamaha',
      'Tipe': 'MG08',
      'Channel': '8 Ch',
      'Kondisi': 'Baik'
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
