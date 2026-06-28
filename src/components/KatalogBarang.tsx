/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Barang, Kategori, DetailPeminjaman } from '../types';
import { getBarang, getKategori, getPeminjaman } from '../data/db';
import { Search, Info, MapPin, CheckCircle, XCircle, Grid, CalendarCheck, ArrowLeft, Plus, Minus } from 'lucide-react';

interface KatalogBarangProps {
  daftarPinjam?: DetailPeminjaman[];
  onStartBorrow?: (barangId: string) => void;
  onAddDaftarPinjam?: (barangId: string, jumlah: number) => void;
  isAdminPreview?: boolean;
}

export default function KatalogBarang({ daftarPinjam = [], onStartBorrow, onAddDaftarPinjam, isAdminPreview = false }: KatalogBarangProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('semua');
  const [selectedBarangDetail, setSelectedBarangDetail] = useState<Barang | null>(null);
  const [qtySelection, setQtySelection] = useState<Record<string, number>>({});
  const [conflictDialog, setConflictDialog] = useState<{ barang: Barang, qty: number, existingQty: number } | null>(null);

  const barangList = getBarang();
  const kategoriList = getKategori();
  const allLoans = getPeminjaman();

  const handleUpdateQty = (barangId: string, increment: number, max: number) => {
    setQtySelection(prev => {
      const current = prev[barangId] || 1;
      const next = Math.max(1, Math.min(max, current + increment));
      return { ...prev, [barangId]: next };
    });
  };

  const showToast = (message: string) => {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-xl text-xs font-medium z-50 animate-fade-in';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 2000);
  };

  const handleAddSubmit = (barang: Barang) => {
    const qty = qtySelection[barang.id] || 1;
    const existing = daftarPinjam.find(p => p.barang_id === barang.id);
    if (existing) {
      setConflictDialog({ barang, qty, existingQty: existing.jumlah });
      return;
    }
    if (onAddDaftarPinjam) {
      onAddDaftarPinjam(barang.id, qty);
      showToast(`${barang.nama} ×${qty} ditambahkan ke Daftar`);
      setQtySelection(prev => ({ ...prev, [barang.id]: 1 }));
    }
  };

  const handleResolveConflict = (mode: 'replace' | 'add') => {
    if (!conflictDialog || !onAddDaftarPinjam) return;
    const { barang, qty, existingQty } = conflictDialog;
    if (mode === 'replace') {
      onAddDaftarPinjam(barang.id, qty);
      showToast(`${barang.nama} diubah jumlahnya menjadi ×${qty}`);
    } else {
      const finalQty = Math.min(barang.stok_tersedia, existingQty + qty);
      onAddDaftarPinjam(barang.id, finalQty);
      showToast(`${barang.nama} ditambahkan menjadi ×${finalQty}`);
    }
    setQtySelection(prev => ({ ...prev, [barang.id]: 1 }));
    setConflictDialog(null);
  };

  const filteredBarangList = barangList.filter((b) => {
    const matchesSearch = b.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.deskripsi.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesKategori = selectedKategori === 'semua' || b.kategori_id === selectedKategori;
    return matchesSearch && matchesKategori;
  });

  const getBookedDatesInfo = (barangId: string) => {
    const bookedDays: { [day: number]: string } = {};
    allLoans
      .filter((l) => l.status === 'disetujui' || l.status === 'dipinjam')
      .forEach((loan) => {
        const itemHasItem = loan.items.some((item) => item.barang_id === barangId);
        if (itemHasItem) {
          const startDay = parseInt(loan.tgl_mulai.split('-')[2]);
          const endDay = parseInt(loan.tgl_kembali_rencana.split('-')[2]);
          for (let d = startDay; d <= endDay; d++) {
            bookedDays[d] = loan.kode;
          }
        }
      });
    return bookedDays;
  };

  const renderJune2026Calendar = (barangId: string) => {
    const bookedDays = getBookedDatesInfo(barangId);
    const totalDays = 30;
    const daysArr = Array.from({ length: totalDays }, (_, i) => i + 1);
    const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

    return (
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-medium text-gray-700 flex items-center gap-1">
            <CalendarCheck className="w-4 h-4 text-[#1E3A8A]" />
            Kalender Booking: Juni 2026
          </span>
          <div className="flex gap-2 text-[10px] font-medium">
            <span className="flex items-center gap-1 text-gray-400">
              <span className="w-2.5 h-2.5 bg-white border border-gray-200 rounded-full inline-block"></span>Tersedia
            </span>
            <span className="flex items-center gap-1 text-amber-600">
              <span className="w-2.5 h-2.5 bg-amber-50 border border-amber-300 rounded-full inline-block"></span>Dipesan
            </span>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-gray-400 pb-1 mb-1 border-b border-gray-200">
          {dayNames.map((name, i) => <div key={i}>{name}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {daysArr.map((day) => {
            const isBooked = !!bookedDays[day];
            const loanCode = bookedDays[day];
            return (
              <div
                key={day}
                title={isBooked ? `Sudah dibooking oleh ${loanCode}` : 'Tersedia'}
                className={`text-xs py-1.5 rounded-md font-medium select-none cursor-help transition-all ${isBooked
                  ? 'bg-amber-50 text-amber-600 border border-amber-200'
                  : 'bg-white text-gray-700 border border-gray-100 hover:bg-gray-100'
                  }`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div id="katalog_barang_view" className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 font-sans">

      {selectedBarangDetail ? (
        <div className="space-y-4">
          <button
            onClick={() => setSelectedBarangDetail(null)}
            className="flex items-center gap-1 text-xs font-medium text-[#1E3A8A] hover:underline cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Semua Barang
          </button>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {/* Left: Photo */}
            <div className="space-y-4">
              <div className="aspect-video md:aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 relative border border-gray-200">
                <img
                  src={selectedBarangDetail.foto}
                  alt={selectedBarangDetail.nama}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x400/f9fafb/6b7280?text=Tidak+Ada+Gambar'; }}
                />
                {isAdminPreview && (
                  <span className="absolute top-3 left-3 bg-[#1E3A8A] text-white text-xs font-medium px-2.5 py-1 rounded-full">
                    {selectedBarangDetail.kode}
                  </span>
                )}
                {selectedBarangDetail.stok_tersedia > 0 ? (
                  <span className="absolute bottom-3 right-3 bg-teal-50 text-teal-700 text-xs font-medium px-3 py-1 rounded-full border border-teal-200 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Tersedia ({selectedBarangDetail.stok_tersedia} unit)
                  </span>
                ) : (
                  <span className="absolute bottom-3 right-3 bg-red-50 text-red-600 text-xs font-medium px-3 py-1 rounded-full border border-red-200 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" />
                    Habis (0 unit)
                  </span>
                )}
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-2.5">
                <MapPin className="text-gray-400 w-4 h-4 shrink-0" />
                <div>
                  <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide block">Lokasi Penyimpanan</span>
                  <span className="text-xs font-medium text-gray-700">{selectedBarangDetail.lokasi}</span>
                </div>
              </div>
            </div>

            {/* Right: Info */}
            <div className="flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-blue-600 capitalize">
                    {kategoriList.find(k => k.id === selectedBarangDetail.kategori_id)?.nama || 'Lain-lain'}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mt-2 leading-tight">
                  {selectedBarangDetail.nama}
                </h3>
                <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                  {selectedBarangDetail.deskripsi}
                </p>
                {selectedBarangDetail.spesifikasi && (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Spesifikasi Detail:</p>
                    <div className="border border-gray-100 rounded-lg overflow-hidden text-xs">
                      {Object.entries(selectedBarangDetail.spesifikasi).map(([key, val], sIdx) => (
                        <div key={sIdx} className="flex border-b border-gray-100 last:border-b-0">
                          <span className="w-1/3 bg-gray-50 p-2 text-gray-400 font-medium border-r border-gray-100 text-[10px] uppercase tracking-wide">{key}</span>
                          <span className="w-2/3 p-2 font-medium text-gray-700">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {renderJune2026Calendar(selectedBarangDetail.id)}
              </div>

              <div className="pt-4 border-t border-gray-100 flex gap-3">
                <button
                  onClick={() => setSelectedBarangDetail(null)}
                  className="px-5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium py-2.5 rounded-lg cursor-pointer"
                >
                  Kembali
                </button>
                {!isAdminPreview && (
                  <div className="flex flex-1 items-center gap-2">
                    <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg p-1">
                      <button
                        onClick={() => handleUpdateQty(selectedBarangDetail.id, -1, selectedBarangDetail.stok_tersedia)}
                        disabled={selectedBarangDetail.stok_tersedia <= 0}
                        className="p-1.5 hover:bg-gray-200 rounded-md disabled:opacity-50 text-gray-700"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">{qtySelection[selectedBarangDetail.id] || 1}</span>
                      <button
                        onClick={() => handleUpdateQty(selectedBarangDetail.id, 1, selectedBarangDetail.stok_tersedia)}
                        disabled={selectedBarangDetail.stok_tersedia <= 0}
                        className="p-1.5 hover:bg-gray-200 rounded-md disabled:opacity-50 text-[#1E3A8A]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        if (selectedBarangDetail.stok_tersedia > 0) {
                          handleAddSubmit(selectedBarangDetail);
                          setSelectedBarangDetail(null);
                        } else {
                          alert('Stok barang ini sedang habis.');
                        }
                      }}
                      disabled={selectedBarangDetail.stok_tersedia <= 0}
                      className="flex-1 bg-[#1E3A8A] hover:bg-[#1e40af] text-white text-sm font-medium py-2.5 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      + Tambah ke Daftar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Header + Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Grid className="w-5 h-5 text-gray-400" />
                Katalog Inventaris
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">
                SMA Negeri 1 Sentolo · Pilih Sarana dan Inventaris Siap Pakai
              </p>
            </div>
            <div className="relative w-full md:w-72">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Cari SKU atau nama barang..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white text-sm text-gray-800 placeholder-gray-400 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedKategori('semua')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all border cursor-pointer ${selectedKategori === 'semua'
                ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
            >
              Semua Barang
            </button>
            {kategoriList.map((kat) => (
              <button
                key={kat.id}
                onClick={() => setSelectedKategori(kat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all border cursor-pointer ${selectedKategori === kat.id
                  ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
              >
                {kat.nama}
              </button>
            ))}
          </div>

          {/* Grid */}
          {filteredBarangList.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                <Search className="w-5 h-5" />
              </div>
              <p className="font-semibold text-gray-900 text-sm">Tidak ada barang cocok</p>
              <p className="text-xs text-gray-400 mt-1">Coba sesuaikan kata pencarian atau pilih kategori lainnya.</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedKategori('semua'); }}
                className="mt-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium py-1.5 px-3 rounded-lg border border-gray-200 transition cursor-pointer"
              >
                Atur Ulang Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredBarangList.map((barang) => {
                const isAvailable = barang.stok_tersedia > 0;
                return (
                  <div
                    key={barang.id}
                    className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all flex flex-col justify-between overflow-hidden"
                  >
                    <div>
                      <div className="aspect-[4/3] bg-gray-100 relative group overflow-hidden border-b border-gray-100">
                        <img
                          src={barang.foto}
                          alt={barang.nama}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x300/f9fafb/6b7280?text=Tidak+Ada+Gambar'; }}
                        />
                        {isAdminPreview && (
                          <span className="absolute top-2 left-2 bg-[#1E3A8A] text-white text-xs font-medium px-2 py-0.5 rounded-full">
                            {barang.kode}
                          </span>
                        )}
                        {isAvailable ? (
                          <span className="absolute top-2 right-2 bg-teal-50 text-teal-700 text-xs font-medium px-2 py-0.5 rounded-full border border-teal-200">
                            Sisa: {barang.stok_tersedia}
                          </span>
                        ) : (
                          <span className="absolute top-2 right-2 bg-red-50 text-red-600 text-xs font-medium px-2 py-0.5 rounded-full border border-red-200">
                            Kosong
                          </span>
                        )}
                      </div>
                      <div className="p-3.5 space-y-1.5">
                        <p className="text-xs text-blue-600 font-medium">
                          {kategoriList.find((k) => k.id === barang.kategori_id)?.nama || 'Lain-lain'}
                        </p>
                        <h4 className="text-sm font-semibold text-gray-900 line-clamp-1 leading-snug">
                          {barang.nama}
                        </h4>
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                          {barang.deskripsi}
                        </p>
                      </div>
                    </div>

                    <div className="px-3.5 pb-3.5 pt-2 flex flex-col gap-2 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => setSelectedBarangDetail(barang)}
                          className="text-xs font-medium text-[#1E3A8A] hover:underline cursor-pointer"
                        >
                          Info & Jadwal →
                        </button>
                      </div>
                      {!isAdminPreview && (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg p-0.5">
                            <button
                              onClick={() => handleUpdateQty(barang.id, -1, barang.stok_tersedia)}
                              disabled={!isAvailable}
                              className="p-1 hover:bg-gray-200 rounded-md disabled:opacity-50 text-gray-700"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-medium w-4 text-center">{qtySelection[barang.id] || 1}</span>
                            <button
                              onClick={() => handleUpdateQty(barang.id, 1, barang.stok_tersedia)}
                              disabled={!isAvailable}
                              className="p-1 hover:bg-gray-200 rounded-md disabled:opacity-50 text-[#1E3A8A]"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => handleAddSubmit(barang)}
                            disabled={!isAvailable}
                            className="flex-1 bg-[#1E3A8A] hover:bg-[#1e40af] text-white text-xs font-medium px-3 py-1.5 rounded-lg transition cursor-pointer select-none active:scale-95 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                          >
                            + Tambah ke Daftar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Conflict Dialog */}
      {conflictDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 animate-fade-in">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm border border-gray-200 shadow-lg">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Barang Sudah Ada di Daftar</h3>
            <p className="text-sm text-gray-600 mb-5 leading-relaxed">
              Anda sudah menambahkan <span className="font-semibold text-gray-900">{conflictDialog.barang.nama} (×{conflictDialog.existingQty})</span>. Ingin menambahkan lagi atau mengubah jumlahnya?
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleResolveConflict('add')}
                className="w-full bg-[#1E3A8A] hover:bg-[#1e40af] text-white py-2.5 rounded-lg text-sm font-medium cursor-pointer"
              >
                + Tambah Lagi (Total ×{Math.min(conflictDialog.barang.stok_tersedia, conflictDialog.existingQty + conflictDialog.qty)})
              </button>
              <button
                onClick={() => handleResolveConflict('replace')}
                className="w-full border border-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 cursor-pointer"
              >
                Ubah Jumlah menjadi ×{conflictDialog.qty}
              </button>
              <button
                onClick={() => setConflictDialog(null)}
                className="w-full text-gray-400 py-2 rounded-lg text-xs font-medium hover:text-gray-700 cursor-pointer"
              >
                Batalkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
