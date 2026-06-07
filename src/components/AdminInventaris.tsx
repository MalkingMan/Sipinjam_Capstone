/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Barang, Kategori, BarangStatus } from '../types';
import { getBarang, getKategori, getPeminjaman, saveBarang } from '../data/db';
import { Plus, Edit, Trash2, Search, X, Check, Eye, EyeOff, FileText, Database, ShieldAlert, CheckCircle, Info } from 'lucide-react';

interface AdminInventarisProps {
  key?: any;
  currentUser: User;
  onRefresh: () => void;
}

export default function AdminInventaris({ currentUser, onRefresh }: AdminInventarisProps) {
  const [search, setSearch] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('semua');
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBarang, setEditingBarang] = useState<Barang | null>(null);

  // Form states
  const [kode, setKode] = useState('');
  const [nama, setNama] = useState('');
  const [kategoriId, setKategoriId] = useState('');
  const [foto, setFoto] = useState('');
  const [stokTotal, setStokTotal] = useState(1);
  const [lokasi, setLokasi] = useState('');
  const [status, setStatus] = useState<BarangStatus>('aktif');
  const [deskripsi, setDeskripsi] = useState('');
  // specs
  const [specMerk, setSpecMerk] = useState('');
  const [specFitur, setSpecFitur] = useState('');

  const barangList = getBarang();
  const kategoriList = getKategori();
  const allLoans = getPeminjaman();

  // Filters
  const filteredList = barangList.filter((b) => {
    const matchesSearch = b.nama.toLowerCase().includes(search.toLowerCase()) ||
                          b.kode.toLowerCase().includes(search.toLowerCase());
    const matchesKategori = selectedKategori === 'semua' || b.kategori_id === selectedKategori;
    return matchesSearch && matchesKategori;
  });

  const openAddModal = () => {
    setEditingBarang(null);
    setKode(`BRG-${Math.floor(Math.random() * 900) + 100}`);
    setNama('');
    setKategoriId(kategoriList[0]?.id || '');
    setFoto('https://images.unsplash.com/photo-1535016120720-40c646be5580?w=600&auto=format&fit=crop&q=60');
    setStokTotal(5);
    setLokasi('Gudang SMAN 1 Sentolo');
    setStatus('aktif');
    setDeskripsi('');
    setSpecMerk('');
    setSpecFitur('');
    setIsModalOpen(true);
  };

  const openEditModal = (b: Barang) => {
    setEditingBarang(b);
    setKode(b.kode);
    setNama(b.nama);
    setKategoriId(b.kategori_id);
    setFoto(b.foto);
    setStokTotal(b.stok_total);
    setLokasi(b.lokasi);
    setStatus(b.status);
    setDeskripsi(b.deskripsi);
    setSpecMerk(b.spesifikasi?.Merk || '');
    setSpecFitur(b.spesifikasi?.Fitur || b.spesifikasi?.Resolusi || b.spesifikasi?.Pembesaran || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !kode.trim() || !lokasi.trim() || !deskripsi.trim()) {
      alert('Mohon isi seluruh field wajib.');
      return;
    }

    const currentBarangList = getBarang();

    const specObject: { [key: string]: string } = {};
    if (specMerk.trim()) specObject['Merk'] = specMerk.trim();
    if (specFitur.trim()) specObject['Kondisi'] = specFitur.trim();

    if (editingBarang) {
      // Edit operation: maintain stock availability changes proportionately
      const diff = stokTotal - editingBarang.stok_total;
      const nextTersedia = Math.max(0, editingBarang.stok_tersedia + diff);

      const updated = currentBarangList.map((b) => {
        if (b.id === editingBarang.id) {
          return {
            ...b,
            kode: kode.trim().toUpperCase(),
            nama: nama.trim(),
            kategori_id: kategoriId,
            foto: foto.trim(),
            stok_total: stokTotal,
            stok_tersedia: nextTersedia,
            lokasi: lokasi.trim(),
            status,
            deskripsi: deskripsi.trim(),
            spesifikasi: specObject
          };
        }
        return b;
      });
      saveBarang(updated);
    } else {
      // Create operation
      const newBarang: Barang = {
        id: `BRG-${Date.now()}`,
        kode: kode.trim().toUpperCase(),
        nama: nama.trim(),
        kategori_id: kategoriId,
        foto: foto.trim(),
        stok_total: stokTotal,
        stok_tersedia: stokTotal, // initially all available
        lokasi: lokasi.trim(),
        status,
        deskripsi: deskripsi.trim(),
        spesifikasi: specObject
      };
      saveBarang([...currentBarangList, newBarang]);
    }

    setIsModalOpen(false);
    onRefresh();
  };

  const handleDelete = (barangId: string) => {
    const barangTarget = barangList.find(b => b.id === barangId);
    if (!barangTarget) return;

    // Edge Cases Check: Is the item currently borrowed?
    // Let's scan for any loans on 'dipinjam' or 'terlambat' status containing this item
    const isBorrowed = allLoans.some(
      (l) => (l.status === 'dipinjam' || l.status === 'terlambat') && 
             l.items.some((it) => it.barang_id === barangId)
    );

    if (isBorrowed) {
      alert('Sistem Menolak Aksi: Barang ini sedang dalam masa peminjaman aktif oleh siswa/guru. Anda tidak dapat menghapusnya. Silakan ubah status menjadi "Nonaktif/Perawatan" terlebih dahulu jika ingin membatalkan ketersediaan.');
      return;
    }

    const response = confirm(`Apakah Anda yakin ingin menghapus "${barangTarget.nama}" secara permanen? Data riwayat peminjaman lampau item ini akan tetap terjaga.`);
    if (response) {
      const updated = barangList.filter(b => b.id !== barangId);
      saveBarang(updated);
      onRefresh();
    }
  };

  return (
    <div id="admin_inventaris_view" className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Title & Actions */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b-2 border-slate-900 pb-4">
        <div>
          <h2 className="text-xl font-black text-[#1E3A8A] flex items-center gap-1.5 leading-none">
            <Database className="w-5 h-5 text-[#1E3A8A] stroke-[2.5]" />
            Inventaris & Sarana SMAN 1 Sentolo
          </h2>
          <span className="text-[10px] text-slate-500 font-bold block mt-1 uppercase tracking-wider">Pencatatan SKU, Lokasi Simpan, Serta Volume</span>
        </div>

        <button
          onClick={openAddModal}
          className="bg-[#1E3A8A] hover:bg-slate-900 border-2 border-slate-950 text-white font-black text-[10px] tracking-wider px-4 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5 stroke-[3]" />
          Tambah Barang Baru
        </button>
      </div>

      {/* Filters block */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white border-2 border-slate-900 p-4 rounded-xl shadow-sm">
        
        {/* Category selector */}
        <div className="flex gap-2 w-full sm:w-auto flex-wrap">
          <button
            onClick={() => setSelectedKategori('semua')}
            className={`px-3 py-1.5 border-2 border-slate-900 rounded-lg text-[10px] font-black tracking-wider transition shrink-0 cursor-pointer ${
              selectedKategori === 'semua' ? 'bg-[#1E3A8A] text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-705'
            }`}
          >
            Semua
          </button>
          {kategoriList.map(kat => (
            <button
              key={kat.id}
              onClick={() => setSelectedKategori(kat.id)}
              className={`px-3 py-1.5 border-2 border-slate-900 rounded-lg text-[10px] font-black tracking-wider transition shrink-0 cursor-pointer ${
                selectedKategori === kat.id ? 'bg-[#1E3A8A] text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-705'
              }`}
            >
              {kat.nama}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
            <Search className="w-4 h-4 stroke-[2.5]" />
          </span>
          <input
            type="text"
            placeholder="Cari kode/nama..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-8.5 pr-2.5 py-1.5 text-slate-800 placeholder-slate-400 rounded-lg border-2 border-slate-900 focus:outline-none focus:bg-white"
          />
        </div>

      </div>

      {/* Equipment Table */}
      <div className="bg-white border-2 border-slate-900 rounded-xl overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-[#f8fafc] border-b-2 border-slate-900 text-slate-800 font-black tracking-widest text-[9.5px]">
            <tr>
              <th className="p-3.5 pl-4">Foto</th>
              <th className="p-3.5">Kode SKU</th>
              <th className="p-3.5">Nama Inventaris</th>
              <th className="p-3.5 text-center">Stok (Tersedia / Total)</th>
              <th className="p-3.5">Lokasi Simpan</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right pr-4 mb-2">Kontrol</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-slate-100">
            {filteredList.map((item) => {
              const available = item.stok_tersedia;
              const total = item.stok_total;

              return (
                <tr key={item.id} className="hover:bg-slate-50/70 transition">
                  {/* Photo thumbnail */}
                  <td className="p-3 pl-4">
                    <div className="w-12 h-9 rounded overflow-hidden border-2 border-slate-900 bg-slate-100">
                      <img
                        src={item.foto}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.src = 'https://placehold.co/150x150/f8fafc/475569?text=Tidak+Ada+Gambar'; }}
                      />
                    </div>
                  </td>

                  {/* SKU code */}
                  <td className="p-3 font-black text-[#1E3A8A] uppercase">
                    {item.kode}
                  </td>

                  {/* Name and category */}
                  <td className="p-3 text-slate-900">
                    <span className="font-bold text-slate-900 block text-[12px] leading-tight">{item.nama}</span>
                    <span className="text-[9.5px] text-slate-500 font-extrabold uppercase mt-0.5 block">
                      {kategoriList.find(c => c.id === item.kategori_id)?.nama || 'Lain-lain'}
                    </span>
                  </td>

                  {/* Stock limits */}
                  <td className="p-3 text-center">
                    <span className={`font-black tracking-wide text-xs ${available === 0 ? 'text-[#B91C1C]' : 'text-[#0F766E]'}`}>
                      {available} / {total} UNIT
                    </span>
                    <span className="text-[9px] text-slate-450 block font-bold uppercase tracking-wider mt-0.5">TERSEDIA</span>
                  </td>

                  {/* Location saved */}
                  <td className="p-3 text-slate-700 font-bold max-w-[120px] truncate" title={item.lokasi}>
                    {item.lokasi}
                  </td>

                  {/* Status labels */}
                  <td className="p-3">
                    {item.status === 'aktif' && (
                      <span className="bg-[#CCFBF1] text-[#0F766E] border-2 border-[#0F766E] text-[9px] font-black px-1.5 py-0.5 rounded uppercase">AKTIF</span>
                    )}
                    {item.status === 'perawatan' && (
                      <span className="bg-amber-100 text-[#B45309] border-2 border-[#B45309] text-[9px] font-black px-1.5 py-0.5 rounded uppercase">SERVIS</span>
                    )}
                    {item.status === 'nonaktif' && (
                      <span className="bg-slate-100 text-slate-450 border-2 border-slate-500 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">OFFLINE</span>
                    )}
                  </td>

                  {/* Action buttons */}
                  <td className="p-3 text-right pr-4 space-x-1.5">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 bg-white hover:bg-[#1E3A8A]/10 text-slate-800 hover:text-[#1E3A8A] rounded border-2 border-slate-900 transition-colors cursor-pointer inline-flex items-center"
                      title="Edit Detail SKU"
                    >
                      <Edit className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 bg-white hover:bg-red-50 text-slate-800 hover:text-[#B91C1C] rounded border-2 border-slate-900 transition-colors cursor-pointer inline-flex items-center"
                      title="Hapus SKU"
                    >
                      <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* CREATE & EDIT MODAL OVERLAY */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border-2 border-slate-900 w-full max-w-lg overflow-hidden flex flex-col shadow-2xl animate-scale-up">
            
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b-2 border-slate-900 flex justify-between items-center text-[#1E3A8A] bg-slate-50">
              <span className="font-black text-xs tracking-wider italic">
                {editingBarang ? 'Edit Detail Inventaris SKU' : 'Tambah Barang Inventaris Baru'}
              </span>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-900 transition cursor-pointer">
                <X className="w-5 h-5 stroke-[3]" />
              </button>
            </div>

            {/* Modal Scroll area Form */}
            <form onSubmit={handleSave} className="p-5 overflow-y-auto max-h-[75vh] space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="kode_field" className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1">KODE SKU (ID)</label>
                  <input
                    id="kode_field"
                    type="text"
                    value={kode}
                    onChange={(e) => setKode(e.target.value)}
                    className="w-full py-1.5 px-3 border-2 border-slate-900 rounded-lg text-xs font-bold text-slate-950 bg-[#f8fafc]"
                    placeholder="Contoh: PRJ-E01"
                  />
                </div>

                <div>
                  <label htmlFor="kat_field" className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1">KELOMPOK KATEGORI</label>
                  <select
                    id="kat_field"
                    value={kategoriId}
                    onChange={(e) => setKategoriId(e.target.value)}
                    className="w-full py-1.5 px-2 border-2 border-slate-900 rounded-lg text-xs font-bold text-slate-950 bg-[#f8fafc]"
                  >
                    {kategoriList.map(c => <option key={c.id} value={c.id}>{c.nama.toUpperCase()}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="nama_field" className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1">NAMA BARANG LENGKAP *</label>
                <input
                  id="nama_field"
                  type="text"
                  value={nama}
                  required
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full py-2 px-3 border-2 border-slate-900 rounded-lg text-xs font-bold text-slate-900"
                  placeholder="Contoh: Kamera Canon DSLR 3000D"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="stok_field" className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1">JUMLAH STOK TOTAL UNIT *</label>
                  <input
                    id="stok_field"
                    type="number"
                    min={1}
                    value={stokTotal}
                    required
                    onChange={(e) => setStokTotal(parseInt(e.target.value) || 1)}
                    className="w-full py-1.5 px-3 border-2 border-slate-900 rounded-lg text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label htmlFor="stat_field" className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1">STATUS KETERSEDIAAN</label>
                  <select
                    id="stat_field"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as BarangStatus)}
                    className="w-full py-1.5 px-2 border-2 border-slate-900 rounded-lg text-xs font-bold text-slate-900"
                  >
                    <option value="aktif">Aktif (Dapat Dipinjam)</option>
                    <option value="perawatan">Servis / Dalam Perbaikan</option>
                    <option value="nonaktif">Nonaktif / Rusak</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="lok_field" className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1">LOKASI PENYIMPANAN SARPRAS *</label>
                <input
                  id="lok_field"
                  type="text"
                  required
                  value={lokasi}
                  onChange={(e) => setLokasi(e.target.value)}
                  className="w-full py-2 px-3 border-2 border-slate-900 rounded-lg text-xs font-bold text-slate-900"
                  placeholder="Contoh: Loker Inventaris TU SMAN 1"
                />
              </div>

              <div>
                <label htmlFor="foto_field" className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1">TAUTAN URL FOTO INVENTARIS *</label>
                <input
                  id="foto_field"
                  type="url"
                  required
                  value={foto}
                  onChange={(e) => setFoto(e.target.value)}
                  className="w-full py-2 px-3 border-2 border-slate-900 rounded-lg text-xs font-bold text-slate-900"
                  placeholder="Format link https://"
                />
              </div>

              {/* Specs parameters section */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-2.5 rounded border-2 border-slate-900">
                <span className="block text-[10px] font-black text-[#1E3A8A] uppercase tracking-wider col-span-2">SPESIFIKASI TAMBAHAN:</span>
                <div>
                  <label htmlFor="spec_m" className="block text-[9px] font-black text-slate-500 uppercase mb-0.5">MEREK / MANUFACTURER</label>
                  <input
                    id="spec_m"
                    value={specMerk}
                    onChange={(e) => setSpecMerk(e.target.value)}
                    className="w-full p-1.5 border-2 border-slate-900 bg-white text-xs text-slate-900 font-bold"
                    placeholder="Contoh: Epson / Canon"
                  />
                </div>
                <div>
                  <label htmlFor="spec_f" className="block text-[9px] font-black text-slate-500 uppercase mb-0.5">KONDISI FISIK / RESOLUSI</label>
                  <input
                    id="spec_f"
                    value={specFitur}
                    onChange={(e) => setSpecFitur(e.target.value)}
                    className="w-full p-1.5 border-2 border-slate-900 bg-white text-xs text-slate-900 font-bold"
                    placeholder="Contoh: Sangat Baik"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="desc_field" className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1">DESKRIPSI RINCI & PERUNTUKAN ALAT *</label>
                <textarea
                  id="desc_field"
                  rows={3}
                  required
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  className="w-full py-2 px-3 border-2 border-slate-900 rounded-lg text-xs font-bold text-slate-900"
                  placeholder="Deskripsikan fitur alat..."
                />
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t-2 border-slate-900 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-1.5 px-4 bg-white text-slate-800 hover:bg-slate-100 border-2 border-slate-900 rounded text-[10px] font-black tracking-wider cursor-pointer transition-colors"
                >
                  Batalkan
                </button>
                <button
                  type="submit"
                  className="py-1.5 px-5 bg-[#1E3A8A] hover:bg-slate-900 text-white rounded border-2 border-slate-950 text-[10px] font-black tracking-wider active:scale-95 transition-all shadow cursor-pointer"
                >
                  Simpan SKU
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
