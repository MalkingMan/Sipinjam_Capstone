import express from 'express';
import cors from 'cors';
import pool from './db.js';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for base64 images if needed

// ==========================
// API: USERS
// ==========================
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { id, nis_nip, password, nama, email, role, kelas_jabatan, organisasi } = req.body;
    await pool.query(
      'REPLACE INTO users (id, nis_nip, password, nama, email, role, kelas_jabatan, organisasi) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, nis_nip, password || null, nama, email || null, role, kelas_jabatan || null, organisasi || null]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================
// API: KATEGORI
// ==========================
app.get('/api/kategori', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM kategori');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/kategori', async (req, res) => {
  try {
    const { id, nama, ikon } = req.body;
    await pool.query('REPLACE INTO kategori (id, nama, ikon) VALUES (?, ?, ?)', [id, nama, ikon || null]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/kategori/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM kategori WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================
// API: BARANG
// ==========================
app.get('/api/barang', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM barang');
    // Parse spesifikasi from JSON string to object
    const barang = rows.map(b => ({
      ...b,
      spesifikasi: b.spesifikasi ? JSON.parse(b.spesifikasi) : null
    }));
    res.json(barang);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/barang', async (req, res) => {
  try {
    const { id, kategori_id, nama, foto, kode, deskripsi, lokasi, stok_total, stok_tersedia, status, spesifikasi } = req.body;
    await pool.query(
      'REPLACE INTO barang (id, kategori_id, nama, foto, kode, deskripsi, lokasi, stok_total, stok_tersedia, status, spesifikasi) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, kategori_id || null, nama, foto || null, kode, deskripsi || null, lokasi || null, stok_total || 0, stok_tersedia || 0, status || 'tersedia', spesifikasi ? JSON.stringify(spesifikasi) : null]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/barang/:id', async (req, res) => {
  try {
    const { kategori_id, nama, foto, kode, deskripsi, lokasi, stok_total, stok_tersedia, status, spesifikasi } = req.body;
    await pool.query(
      'UPDATE barang SET kategori_id=?, nama=?, foto=?, kode=?, deskripsi=?, lokasi=?, stok_total=?, stok_tersedia=?, status=?, spesifikasi=? WHERE id=?',
      [kategori_id || null, nama, foto || null, kode, deskripsi || null, lokasi || null, stok_total || 0, stok_tersedia || 0, status || 'tersedia', spesifikasi ? JSON.stringify(spesifikasi) : null, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/barang/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM barang WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================
// API: PEMINJAMAN
// ==========================
app.get('/api/peminjaman', async (req, res) => {
  try {
    const [peminjamanRows] = await pool.query('SELECT * FROM peminjaman');
    const [itemsRows] = await pool.query('SELECT * FROM peminjaman_items');
    
    // Group items by peminjaman_id
    const peminjamanList = peminjamanRows.map(p => {
      const items = itemsRows.filter(i => i.peminjaman_id === p.id).map(i => ({
        barang_id: i.barang_id,
        jumlah: i.jumlah
      }));
      return { ...p, items };
    });
    
    res.json(peminjamanList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/peminjaman', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { id, user_id, status, tgl_pengajuan, tgl_mulai, tgl_kembali_rencana, tgl_kembali_aktual, keperluan, kategori_kegiatan, catatan_peminjam, catatan_admin, kode, items } = req.body;
    
    await connection.query(
      'REPLACE INTO peminjaman (id, user_id, status, tgl_pengajuan, tgl_mulai, tgl_kembali_rencana, tgl_kembali_aktual, keperluan, kategori_kegiatan, catatan_peminjam, catatan_admin, kode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, user_id, status || 'menunggu', tgl_pengajuan, tgl_mulai, tgl_kembali_rencana, tgl_kembali_aktual || null, keperluan, kategori_kegiatan || null, catatan_peminjam || null, catatan_admin || null, kode || null]
    );
    
    if (items && items.length > 0) {
      for (const item of items) {
        await connection.query(
          'REPLACE INTO peminjaman_items (peminjaman_id, barang_id, jumlah) VALUES (?, ?, ?)',
          [id, item.barang_id, item.jumlah || 1]
        );
      }
    }
    
    await connection.commit();
    res.json({ success: true });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

app.put('/api/peminjaman/:id', async (req, res) => {
  try {
    const { status, tgl_kembali_aktual, catatan_admin } = req.body;
    await pool.query(
      'UPDATE peminjaman SET status=?, tgl_kembali_aktual=?, catatan_admin=? WHERE id=?',
      [status, tgl_kembali_aktual, catatan_admin, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================
// API: PENGATURAN SURAT
// ==========================
app.get('/api/pengaturan-surat', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM pengaturan_surat LIMIT 1');
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.json({
        waka_kesiswaan_nama: 'Jajan Wahyudi, S.Pd',
        waka_kesiswaan_nip: '197001171979021001',
        waka_sarpras_nama: 'Zhainuri, S.Pd',
        waka_sarpras_nip: '197204282006011007',
        surat_counter: 1,
        surat_tahun: new Date().getFullYear(),
        logo_sekolah: ''
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/pengaturan-surat', async (req, res) => {
  try {
    const { waka_kesiswaan_nama, waka_kesiswaan_nip, waka_sarpras_nama, waka_sarpras_nip, surat_counter, surat_tahun, logo_sekolah } = req.body;
    // Check if exists
    const [existing] = await pool.query('SELECT id FROM pengaturan_surat LIMIT 1');
    if (existing.length > 0) {
      await pool.query(
        'UPDATE pengaturan_surat SET waka_kesiswaan_nama=?, waka_kesiswaan_nip=?, waka_sarpras_nama=?, waka_sarpras_nip=?, surat_counter=?, surat_tahun=?, logo_sekolah=? WHERE id=?',
        [waka_kesiswaan_nama || null, waka_kesiswaan_nip || null, waka_sarpras_nama || null, waka_sarpras_nip || null, surat_counter || 1, surat_tahun || new Date().getFullYear(), logo_sekolah || null, existing[0].id]
      );
    } else {
      await pool.query(
        'INSERT INTO pengaturan_surat (waka_kesiswaan_nama, waka_kesiswaan_nip, waka_sarpras_nama, waka_sarpras_nip, surat_counter, surat_tahun, logo_sekolah) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [waka_kesiswaan_nama || null, waka_kesiswaan_nip || null, waka_sarpras_nama || null, waka_sarpras_nip || null, surat_counter || 1, surat_tahun || new Date().getFullYear(), logo_sekolah || null]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`SIPINJAM Backend Server is running on http://localhost:${PORT}`);
});
