import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // limit besar untuk gambar base64

// Helper: normalisasi spesifikasi barang (mysql2 mengembalikan kolom JSON sudah ter-parse)
const parseSpesifikasi = (val) => {
  if (val == null) return undefined;
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return undefined; }
  }
  return val;
};

// ======================================================
// BOOTSTRAP — ambil seluruh data dalam satu panggilan
// ======================================================
app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.get('/api/bootstrap', async (req, res) => {
  try {
    const [users] = await pool.query('SELECT * FROM users');
    const [kategori] = await pool.query('SELECT * FROM kategori');
    const [barangRows] = await pool.query('SELECT * FROM barang');
    const [pemRows] = await pool.query('SELECT * FROM peminjaman ORDER BY tgl_pengajuan DESC');
    const [itemRows] = await pool.query('SELECT * FROM peminjaman_items');
    const [pengRows] = await pool.query('SELECT * FROM pengaturan_surat WHERE id = 1');

    const barang = barangRows.map((b) => ({ ...b, spesifikasi: parseSpesifikasi(b.spesifikasi) }));

    const peminjaman = pemRows.map((p) => ({
      ...p,
      items: itemRows
        .filter((i) => i.peminjaman_id === p.id)
        .map((i) => ({
          barang_id: i.barang_id,
          jumlah: i.jumlah,
          kondisi_kembali: i.kondisi_kembali || undefined,
          catatan_kondisi: i.catatan_kondisi || undefined,
        })),
    }));

    res.json({ users, kategori, barang, peminjaman, pengaturan: pengRows[0] || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ======================================================
// BULK REPLACE — mengganti seluruh isi koleksi
// (cocok dengan pola "simpan semua" di frontend)
// ======================================================

app.put('/api/users', async (req, res) => {
  const list = Array.isArray(req.body) ? req.body : [];
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM users');
    for (const u of list) {
      await conn.query(
        'INSERT INTO users (id, nis_nip, nama, email, role, kelas_jabatan, organisasi, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [u.id, u.nis_nip, u.nama, u.email || null, u.role, u.kelas_jabatan || null, u.organisasi || null, u.password || null]
      );
    }
    await conn.commit();
    res.json({ success: true, count: list.length });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

app.put('/api/kategori', async (req, res) => {
  const list = Array.isArray(req.body) ? req.body : [];
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM kategori');
    for (const k of list) {
      await conn.query('INSERT INTO kategori (id, nama, ikon) VALUES (?, ?, ?)', [k.id, k.nama, k.ikon || null]);
    }
    await conn.commit();
    res.json({ success: true, count: list.length });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

app.put('/api/barang', async (req, res) => {
  const list = Array.isArray(req.body) ? req.body : [];
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM barang');
    for (const b of list) {
      await conn.query(
        `INSERT INTO barang (id, kode, nama, kategori_id, foto, stok_total, stok_tersedia, lokasi, status, deskripsi, spesifikasi)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          b.id, b.kode, b.nama, b.kategori_id || null, b.foto || null,
          b.stok_total ?? 0, b.stok_tersedia ?? 0, b.lokasi || null,
          b.status || 'aktif', b.deskripsi || null,
          b.spesifikasi ? JSON.stringify(b.spesifikasi) : null,
        ]
      );
    }
    await conn.commit();
    res.json({ success: true, count: list.length });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

app.put('/api/peminjaman', async (req, res) => {
  const list = Array.isArray(req.body) ? req.body : [];
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    // Hapus items dulu lalu peminjaman (FK cascade juga menangani, tapi eksplisit lebih aman)
    await conn.query('DELETE FROM peminjaman_items');
    await conn.query('DELETE FROM peminjaman');
    for (const p of list) {
      await conn.query(
        `INSERT INTO peminjaman
         (id, kode, peminjam_id, peminjam_nama, peminjam_role, peminjam_kelas, approver_id,
          tgl_pengajuan, tgl_mulai, tgl_kembali_rencana, tgl_kembali_aktual, status, keperluan,
          kategori_kegiatan, catatan_peminjam, catatan_admin,
          surat_nama_kegiatan, surat_hari, surat_tanggal_kegiatan, surat_waktu_mulai, surat_waktu_selesai,
          surat_tempat, surat_ketua_panitia, surat_nis_ketua)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.id, p.kode, p.peminjam_id, p.peminjam_nama, p.peminjam_role, p.peminjam_kelas || null, p.approver_id || null,
          p.tgl_pengajuan, p.tgl_mulai, p.tgl_kembali_rencana, p.tgl_kembali_aktual || null, p.status || 'menunggu_surat', p.keperluan || null,
          p.kategori_kegiatan || 'osis', p.catatan_peminjam || null, p.catatan_admin || null,
          p.surat_nama_kegiatan || null, p.surat_hari || null, p.surat_tanggal_kegiatan || null, p.surat_waktu_mulai || null, p.surat_waktu_selesai || null,
          p.surat_tempat || null, p.surat_ketua_panitia || null, p.surat_nis_ketua || null,
        ]
      );
      for (const it of p.items || []) {
        await conn.query(
          'INSERT INTO peminjaman_items (peminjaman_id, barang_id, jumlah, kondisi_kembali, catatan_kondisi) VALUES (?, ?, ?, ?, ?)',
          [p.id, it.barang_id, it.jumlah ?? 1, it.kondisi_kembali || null, it.catatan_kondisi || null]
        );
      }
    }
    await conn.commit();
    res.json({ success: true, count: list.length });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

app.put('/api/pengaturan-surat', async (req, res) => {
  try {
    const s = req.body || {};
    await pool.query(
      `REPLACE INTO pengaturan_surat
       (id, waka_kesiswaan_nama, waka_kesiswaan_nip, waka_sarpras_nama, waka_sarpras_nip, surat_counter, surat_tahun, logo_sekolah)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?)`,
      [
        s.waka_kesiswaan_nama || null, s.waka_kesiswaan_nip || null,
        s.waka_sarpras_nama || null, s.waka_sarpras_nip || null,
        s.surat_counter ?? 1, s.surat_tahun ?? new Date().getFullYear(), s.logo_sekolah || null,
      ]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ======================================================
// UPDATE PROFIL — edit info & ganti password
// ======================================================
app.patch('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { nama, email, kelas_jabatan, organisasi, password_lama, password_baru } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
    const user = rows[0];

    if (password_baru !== undefined && password_baru !== '') {
      if (!password_lama) return res.status(400).json({ error: 'Password lama wajib diisi untuk mengganti password.' });
      if (user.password !== password_lama) return res.status(400).json({ error: 'Password lama salah.' });
      if (password_baru.length < 6) return res.status(400).json({ error: 'Password baru minimal 6 karakter.' });

      await pool.query(
        'UPDATE users SET nama = ?, email = ?, kelas_jabatan = ?, organisasi = ?, password = ? WHERE id = ?',
        [nama?.trim() || user.nama, email?.trim() || null, kelas_jabatan?.trim() || null, organisasi?.trim() || null, password_baru, id]
      );
    } else {
      await pool.query(
        'UPDATE users SET nama = ?, email = ?, kelas_jabatan = ?, organisasi = ? WHERE id = ?',
        [nama?.trim() || user.nama, email?.trim() || null, kelas_jabatan?.trim() || null, organisasi?.trim() || null, id]
      );
    }

    const [updated] = await pool.query('SELECT id, nis_nip, nama, email, role, kelas_jabatan, organisasi, password FROM users WHERE id = ?', [id]);
    res.json({ success: true, user: updated[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ======================================================
// REGISTER — pendaftaran akun peminjam baru (role: siswa)
// ======================================================
app.post('/api/register', async (req, res) => {
  const { nis_nip, nama, email, kelas_jabatan, organisasi, password } = req.body;

  if (!nis_nip || !nis_nip.trim()) return res.status(400).json({ error: 'NIS wajib diisi.' });
  if (!nama || !nama.trim()) return res.status(400).json({ error: 'Nama lengkap wajib diisi.' });
  if (!kelas_jabatan || !kelas_jabatan.trim()) return res.status(400).json({ error: 'Kelas wajib diisi.' });
  if (!password || password.length < 6) return res.status(400).json({ error: 'Password minimal 6 karakter.' });

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE nis_nip = ?', [nis_nip.trim()]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'NIS sudah terdaftar. Silakan login.' });
    }

    const id = nis_nip.trim();
    await pool.query(
      'INSERT INTO users (id, nis_nip, nama, email, role, kelas_jabatan, organisasi, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, nis_nip.trim(), nama.trim(), email?.trim() || null, 'siswa', kelas_jabatan.trim(), organisasi?.trim() || null, password]
    );

    const newUser = { id, nis_nip: nis_nip.trim(), nama: nama.trim(), email: email?.trim() || null, role: 'siswa', kelas_jabatan: kelas_jabatan.trim(), organisasi: organisasi?.trim() || null };
    res.status(201).json({ success: true, user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`SIPINJAM Backend Server berjalan di http://localhost:${PORT}`);
});
