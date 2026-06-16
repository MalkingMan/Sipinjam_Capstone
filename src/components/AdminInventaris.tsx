/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Barang, Kategori, BarangStatus } from '../types';
import { getBarang, getKategori, getPeminjaman, saveBarang } from '../data/db';
import { Plus, Edit, Trash2, Search, X, Database } from 'lucide-react';

interface AdminInventarisProps {
  key?: any;
  currentUser: User;
  onRefresh: () => void;
}

export default function AdminInventaris({ currentUser, onRefresh }: AdminInventarisProps) {
  const [search, setSearch] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBarang, setEditingBarang] = useState<Barang | null>(null);

  const [kode, setKode] = useState('');
  const [nama, setNama] = useState('');
  const [kategoriId, setKategoriId] = useState('');
  const [foto, setFoto] = useState('');
  const [stokTotal, setStokTotal] = useState(1);
  const [lokasi, setLokasi] = useState('');
  const [status, setStatus] = useState<BarangStatus>('aktif');
  const [deskripsi, setDeskripsi] = useState('');
  const [specMerk, setSpecMerk] = useState('');
  const [specFitur, setSpecFitur] = useState('');

  const barangList = getBarang();
  const kategoriList = getKategori();
  const allLoans = getPeminjaman();

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
      const diff = stokTotal - editingBarang.stok_total;
      const nextTersedia = Math.max(0, editingBarang.stok_tersedia + diff);
      const updated = currentBarangList.map((b) => {
        if (b.id === editingBarang.id) {
          return { ...b, kode: kode.trim().toUpperCase(), nama: nama.trim(), kategori_id: kategoriId, foto: foto.trim(), stok_total: stokTotal, stok_tersedia: nextTersedia, lokasi: lokasi.trim(), status, deskripsi: deskripsi.trim(), spesifikasi: specObject };
        }
        return b;
      });
      saveBarang(updated);
    } else {
      const newBarang: Barang = {
        id: `BRG-${Date.now()}`,
        kode: kode.trim().toUpperCase(),
        nama: nama.trim(),
        kategori_id: kategoriId,
        foto: foto.trim(),
        stok_total: stokTotal,
        stok_tersedia: stokTotal,
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
    const isBorrowed = allLoans.some(
      (l) => (l.status === 'dipinjam' || l.status === 'terlambat') &&
             l.items.some((it) => it.barang_id === barangId)
    );
    if (isBorrowed) {
      alert('Sistem Menolak Aksi: Barang ini sedang dalam masa peminjaman aktif. Ubah status menjadi "Nonaktif/Perawatan" terlebih dahulu.');
      return;
    }
    const response = confirm(`Hapus "${barangTarget.nama}" secara permanen?`);
    if (response) {
      const updated = barangList.filter(b => b.id !== barangId);
      saveBarang(updated);
      onRefresh();
    }
  };

  return (
    <div id="admin_inventaris_view" className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 font-sans">

      {/* Title & Actions */}
      <div className="flex justify-between items-center flex-wrap gap-4 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-gray-400" />
            Inventaris & Sarana SMAN 1 Sentolo
          </h2>
          <span className="text-xs text-gray-400 block mt-0.5 uppercase tracking-wide">Pencatatan SKU, Lokasi Simpan, serta Volume</span>
        </div>
        <button
          onClick={openAddModal}
          className="bg-[#1E3A8A] hover:bg-[#1e40af] text-white font-medium text-sm px-4 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Tambah Barang Baru
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white border border-gray-200 p-4 rounded-xl">
        <div className="flex gap-2 w-full sm:w-auto flex-wrap">
          <button
            onClick={() => setSelectedKategori('semua')}
            className={`px-3.5 py-1.5 border rounded-full text-xs font-medium transition shrink-0 cursor-pointer ${
              selectedKategori === 'semua' ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Semua
          </button>
          {kategoriList.map(kat => (
            <button
              key={kat.id}
              onClick={() => setSelectedKategori(kat.id)}
              className={`px-3.5 py-1.5 border rounded-full text-xs font-medium transition shrink-0 cursor-pointer ${
                selectedKategori === kat.id ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {kat.nama}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Cari kode/nama..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm pl-9 pr-3 py-2 text-gray-800 placeholder-gray-400 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs font-medium uppercase tracking-wide">
            <tr>
              <th className="p-3.5 pl-4">Foto</th>
              <th className="p-3.5">Kode SKU</th>
              <th className="p-3.5">Nama Inventaris</th>
              <th className="p-3.5 text-center">Stok (Tersedia / Total)</th>
              <th className="p-3.5">Lokasi Simpan</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right pr-4">Kontrol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredList.map((item) => {
              const available = item.stok_tersedia;
              const total = item.stok_total;
              return (
                <tr key={item.id} className="hover:bg-gray-50 transition">
                  <td className="p-3 pl-4">
                    <div className="w-12 h-9 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                      <img
                        src={item.foto}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.src = 'https://placehold.co/150x150/f9fafb/6b7280?text=Tidak+Ada+Gambar'; }}
                      />
                    </div>
                  </td>
                  <td className="p-3 font-medium text-[#1E3A8A] text-xs uppercase">{item.kode}</td>
                  <td className="p-3">
                    <span className="font-medium text-gray-900 block text-sm leading-tight">{item.nama}</span>
                    <span className="text-xs text-gray-400 mt-0.5 block">
                      {kategoriList.find(c => c.id === item.kategori_id)?.nama || 'Lain-lain'}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`font-bold text-sm ${available === 0 ? 'text-[#B91C1C]' : 'text-[#0F766E]'}`}>
                      {available} / {total}
                    </span>
                    <span className="text-[10px] text-gray-400 block font-medium uppercase tracking-wide mt-0.5">Unit</span>
                  </td>
                  <td className="p-3 text-gray-600 text-sm max-w-[120px] truncate" title={item.lokasi}>
                    {item.lokasi}
                  </td>
                  <td className="p-3">
                    {item.status === 'aktif' && (
                      <span className="bg-teal-50 text-teal-700 text-xs font-medium px-2.5 py-0.5 rounded-full">Aktif</span>
                    )}
                    {item.status === 'perawatan' && (
                      <span className="bg-amber-50 text-amber-700 text-xs font-medium px-2.5 py-0.5 rounded-full">Servis</span>
                    )}
                    {item.status === 'nonaktif' && (
                      <span className="bg-gray-100 text-gray-500 text-xs font-medium px-2.5 py-0.5 rounded-full">Nonaktif</span>
                    )}
                  </td>
                  <td className="p-3 text-right pr-4 space-x-1.5">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 border border-gray-200 rounded-md hover:bg-gray-50 text-gray-500 hover:text-[#1E3A8A] transition cursor-pointer inline-flex items-center"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 border border-gray-200 rounded-md hover:bg-red-50 text-gray-500 hover:text-[#B91C1C] transition cursor-pointer inline-flex items-center"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-gray-200 w-full max-w-lg overflow-hidden flex flex-col shadow-lg animate-scale-up">

            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
              <span className="font-semibold text-sm text-gray-900">
                {editingBarang ? 'Edit Detail Inventaris' : 'Tambah Barang Inventaris Baru'}
              </span>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-5 overflow-y-auto max-h-[75vh] space-y-4">

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="kode_field" className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Kode SKU</label>
                  <input
                    id="kode_field"
                    type="text"
                    value={kode}
                    onChange={(e) => setKode(e.target.value)}
                    className="w-full py-2 px-3 border border-gray-300 rounded-md text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Contoh: PRJ-E01"
                  />
                </div>
                <div>
                  <label htmlFor="kat_field" className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Kategori</label>
                  <select
                    id="kat_field"
                    value={kategoriId}
                    onChange={(e) => setKategoriId(e.target.value)}
                    className="w-full py-2 px-3 border border-gray-300 rounded-md text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {kategoriList.map(c => <option key={c.id} value={c.id}>{c.nama}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="nama_field" className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Nama Barang Lengkap *</label>
                <input
                  id="nama_field"
                  type="text"
                  value={nama}
                  required
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full py-2 px-3 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Contoh: Kamera Canon DSLR 3000D"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="stok_field" className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Jumlah Stok Total *</label>
                  <input
                    id="stok_field"
                    type="number"
                    min={1}
                    value={stokTotal}
                    required
                    onChange={(e) => setStokTotal(parseInt(e.target.value) || 1)}
                    className="w-full py-2 px-3 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="stat_field" className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Status</label>
                  <select
                    id="stat_field"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as BarangStatus)}
                    className="w-full py-2 px-3 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="aktif">Aktif (Dapat Dipinjam)</option>
                    <option value="perawatan">Servis / Dalam Perbaikan</option>
                    <option value="nonaktif">Nonaktif / Rusak</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="lok_field" className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Lokasi Penyimpanan *</label>
                <input
                  id="lok_field"
                  type="text"
                  required
                  value={lokasi}
                  onChange={(e) => setLokasi(e.target.value)}
                  className="w-full py-2 px-3 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Contoh: Loker Inventaris TU"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Foto Inventaris</label>
                <div
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer relative overflow-hidden"
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-blue-400', 'bg-blue-50'); }}
                  onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50'); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      const file = e.dataTransfer.files[0];
                      if (!file.type.startsWith('image/')) { alert('Silakan upload file gambar.'); return; }
                      const reader = new FileReader();
                      reader.onload = (event) => { if (event.target?.result) setFoto(event.target.result as string); };
                      reader.readAsDataURL(file);
                    }
                  }}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => {
                      const tgt = e.target as HTMLInputElement;
                      if (tgt.files && tgt.files[0]) {
                        const file = tgt.files[0];
                        const reader = new FileReader();
                        reader.onload = (event) => { if (event.target?.result) setFoto(event.target.result as string); };
                        reader.readAsDataURL(file);
                      }
                    };
                    input.click();
                  }}
                >
                  {foto && foto !== 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=600&auto=format&fit=crop&q=60' ? (
                    <div className="absolute inset-0 w-full h-full">
                      <img src={foto} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-white text-xs font-medium bg-gray-900/80 px-3 py-1 rounded-lg">Ganti Foto</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      </div>
                      <p className="text-sm font-medium text-gray-700 text-center">Tarik gambar ke sini, atau klik untuk memilih</p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP</p>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide col-span-2">Spesifikasi Tambahan:</span>
                <div>
                  <label htmlFor="spec_m" className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Merek</label>
                  <input
                    id="spec_m"
                    value={specMerk}
                    onChange={(e) => setSpecMerk(e.target.value)}
                    className="w-full py-1.5 px-3 border border-gray-300 rounded-md bg-white text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Contoh: Epson"
                  />
                </div>
                <div>
                  <label htmlFor="spec_f" className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Kondisi / Resolusi</label>
                  <input
                    id="spec_f"
                    value={specFitur}
                    onChange={(e) => setSpecFitur(e.target.value)}
                    className="w-full py-1.5 px-3 border border-gray-300 rounded-md bg-white text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Contoh: Sangat Baik"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="desc_field" className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Deskripsi Rinci *</label>
                <textarea
                  id="desc_field"
                  rows={3}
                  required
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  className="w-full py-2 px-3 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Deskripsikan fitur alat..."
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2 px-4 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium cursor-pointer"
                >
                  Batalkan
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 bg-[#1E3A8A] hover:bg-[#1e40af] text-white rounded-lg text-sm font-medium transition cursor-pointer"
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
