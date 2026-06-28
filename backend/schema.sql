CREATE DATABASE IF NOT EXISTS sipinjam;
USE sipinjam;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  nis_nip VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(100),
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  role ENUM('admin', 'guru', 'siswa') NOT NULL,
  kelas_jabatan VARCHAR(50),
  organisasi VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS kategori (
  id VARCHAR(50) PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  ikon VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS barang (
  id VARCHAR(50) PRIMARY KEY,
  kategori_id VARCHAR(50),
  nama VARCHAR(150) NOT NULL,
  foto LONGTEXT,
  kode VARCHAR(50) NOT NULL,
  deskripsi TEXT,
  lokasi VARCHAR(100),
  stok_total INT DEFAULT 0,
  stok_tersedia INT DEFAULT 0,
  status ENUM('aktif', 'perawatan', 'nonaktif') DEFAULT 'aktif',
  spesifikasi JSON,
  FOREIGN KEY (kategori_id) REFERENCES kategori(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS peminjaman (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  status ENUM('menunggu_surat', 'menunggu', 'disetujui', 'dipinjam', 'selesai', 'terlambat', 'ditolak') DEFAULT 'menunggu',
  tgl_pengajuan VARCHAR(50) NOT NULL,
  tgl_mulai VARCHAR(50) NOT NULL,
  tgl_kembali_rencana VARCHAR(50) NOT NULL,
  tgl_kembali_aktual VARCHAR(50),
  keperluan VARCHAR(200) NOT NULL,
  kategori_kegiatan VARCHAR(50),
  catatan_peminjam TEXT,
  catatan_admin TEXT,
  kode VARCHAR(50) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS peminjaman_items (
  peminjaman_id VARCHAR(50) NOT NULL,
  barang_id VARCHAR(50) NOT NULL,
  jumlah INT NOT NULL DEFAULT 1,
  PRIMARY KEY (peminjaman_id, barang_id),
  FOREIGN KEY (peminjaman_id) REFERENCES peminjaman(id) ON DELETE CASCADE,
  FOREIGN KEY (barang_id) REFERENCES barang(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pengaturan_surat (
  id INT PRIMARY KEY AUTO_INCREMENT,
  waka_kesiswaan_nama VARCHAR(100),
  waka_kesiswaan_nip VARCHAR(50),
  waka_sarpras_nama VARCHAR(100),
  waka_sarpras_nip VARCHAR(50),
  surat_counter INT DEFAULT 1,
  surat_tahun INT,
  logo_sekolah LONGTEXT
);
