/**
 * SCRIPT MIGRASI DATA LOKAL KE MYSQL
 * 
 * Cara Penggunaan:
 * 1. Pastikan Backend Server (Node.js) Anda sudah berjalan di port 5000 (http://localhost:5000)
 * 2. Buka aplikasi SIPINJAM Anda di browser
 * 3. Tekan F12 atau klik kanan -> Inspect untuk membuka Developer Tools, masuk ke tab "Console"
 * 4. Copy (salin) seluruh script di bawah ini
 * 5. Paste (tempel) di dalam Console, lalu tekan Enter!
 */

(async function migrateData() {
  console.log("Mulai proses migrasi data dari LocalStorage ke MySQL...");
  const BASE_URL = 'http://localhost:5000/api';

  try {
    // 1. Migrasi Users
    const usersData = localStorage.getItem('sipinjam_users');
    if (usersData) {
      const users = JSON.parse(usersData);
      console.log(`Mengirim ${users.length} data Users...`);
      let userErrors = 0;
      for (const u of users) {
        const res = await fetch(`${BASE_URL}/users`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(u)
        });
        if (!res.ok) { const e = await res.json(); console.error(`❌ Gagal user ${u.username}:`, e.error); userErrors++; }
      }
      if (userErrors === 0) console.log(`✅ Semua ${users.length} Users berhasil.`);
    }

    // 2. Migrasi Kategori
    const katData = localStorage.getItem('sipinjam_kategori');
    if (katData) {
      const kategori = JSON.parse(katData);
      console.log(`Mengirim ${kategori.length} data Kategori...`);
      let katErrors = 0;
      for (const k of kategori) {
        const res = await fetch(`${BASE_URL}/kategori`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(k)
        });
        if (!res.ok) { const e = await res.json(); console.error(`❌ Gagal kategori ${k.nama}:`, e.error); katErrors++; }
      }
      if (katErrors === 0) console.log(`✅ Semua ${kategori.length} Kategori berhasil.`);
    }

    // 3. Migrasi Barang
    const brgData = localStorage.getItem('sipinjam_barang');
    if (brgData) {
      const barang = JSON.parse(brgData);
      console.log(`Mengirim ${barang.length} data Barang...`);
      let brgErrors = 0;
      for (const b of barang) {
        const res = await fetch(`${BASE_URL}/barang`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b)
        });
        if (!res.ok) { const e = await res.json(); console.error(`❌ Gagal barang ${b.nama}:`, e.error); brgErrors++; }
      }
      if (brgErrors === 0) console.log(`✅ Semua ${barang.length} Barang berhasil.`);
    }

    // 4. Migrasi Peminjaman
    const pjmData = localStorage.getItem('sipinjam_peminjaman');
    if (pjmData) {
      const peminjaman = JSON.parse(pjmData);
      console.log(`Mengirim ${peminjaman.length} data Peminjaman...`);
      let pjmErrors = 0;
      for (const p of peminjaman) {
        const payload = {
          id: p.id,
          user_id: p.peminjam_id,
          status: p.status,
          tgl_pengajuan: p.tgl_pengajuan,
          tgl_mulai: p.tgl_mulai,
          tgl_kembali_rencana: p.tgl_kembali_rencana,
          tgl_kembali_aktual: p.tgl_kembali_aktual || null,
          keperluan: p.keperluan,
          kategori_kegiatan: p.kategori_kegiatan || null,
          catatan_peminjam: p.catatan_peminjam || null,
          catatan_admin: p.catatan_admin || null,
          kode: p.kode,
          items: (p.items || []).map(i => ({ barang_id: i.barang_id, jumlah: i.jumlah || 1 }))
        };
        const res = await fetch(`${BASE_URL}/peminjaman`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
        if (!res.ok) { const e = await res.json(); console.error(`❌ Gagal peminjaman ${p.id}:`, e.error); pjmErrors++; }
      }
      if (pjmErrors === 0) console.log(`✅ Semua ${peminjaman.length} Peminjaman berhasil.`);
    }

    // 5. Migrasi Pengaturan Surat
    const pgtData = localStorage.getItem('sipinjam_pengaturan_surat');
    if (pgtData) {
      const pengaturan = JSON.parse(pgtData);
      console.log(`Mengirim data Pengaturan Surat...`);
      const res = await fetch(`${BASE_URL}/pengaturan-surat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pengaturan)
      });
      if (!res.ok) { const e = await res.json(); console.error(`❌ Gagal pengaturan surat:`, e.error); }
      else console.log(`✅ Pengaturan Surat berhasil.`);
    }

    console.log("✅ MIGRASI SELESAI!");
    console.log("Data localStorage berhasil disalin ke MySQL database melalui API.");

  } catch (error) {
    console.error("❌ Terjadi kesalahan saat migrasi:", error);
  }
})();
