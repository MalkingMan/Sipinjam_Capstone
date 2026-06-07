/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Barang, Kategori, Peminjaman } from '../types';
import { getBarang, getKategori, getPeminjaman } from '../data/db';
import { Search, Info, MapPin, CheckCircle, XCircle, Grid, Filter, CalendarCheck, HelpCircle, ArrowLeft } from 'lucide-react';

interface KatalogBarangProps {
  onStartBorrow: (barangId: string) => void;
  isAdminPreview?: boolean;
}

export default function KatalogBarang({ onStartBorrow, isAdminPreview = false }: KatalogBarangProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('semua');
  const [selectedBarangDetail, setSelectedBarangDetail] = useState<Barang | null>(null);

  const barangList = getBarang();
  const kategoriList = getKategori();
  const allLoans = getPeminjaman();

  // Filter logic
  const filteredBarangList = barangList.filter((b) => {
    const matchesSearch = b.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.deskripsi.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesKategori = selectedKategori === 'semua' || b.kategori_id === selectedKategori;
    return matchesSearch && matchesKategori;
  });

  // Calculate booked dates for a specific item in June 2026
  const getBookedDatesInfo = (barangId: string) => {
    const bookedDays: { [day: number]: string } = {}; // day_number -> project_code
    
    // Scan all approved or active loans for this item
    allLoans
      .filter((l) => l.status === 'disetujui' || l.status === 'dipinjam')
      .forEach((loan) => {
        const itemHasItem = loan.items.some((item) => item.barang_id === barangId);
        if (itemHasItem) {
          // Parse days in June 2026 (let's assume simple date range parse for days)
          const startDay = parseInt(loan.tgl_mulai.split('-')[2]);
          const endDay = parseInt(loan.tgl_kembali_rencana.split('-')[2]);
          for (let d = startDay; d <= endDay; d++) {
            bookedDays[d] = loan.kode;
          }
        }
      });
    return bookedDays;
  };

  // Modern grid calendar helper for June 2026
  const renderJune2026Calendar = (barangId: string) => {
    const bookedDays = getBookedDatesInfo(barangId);
    
    // June 2026 starts on Monday (1)
    // 30 days in June
    const totalDays = 30;
    const daysArr = Array.from({ length: totalDays }, (_, i) => i + 1);
    const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

    return (
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <CalendarCheck className="w-4 h-4 text-[#1E3A8A]" />
            Kalender Booking: Juni 2026
          </span>
          <div className="flex gap-2 text-[9px] font-semibold">
            <span className="flex items-center gap-1 text-slate-500">
              <span className="w-2.5 h-2.5 bg-white border border-slate-305 rounded-full inline-block"></span>Tersedia
            </span>
            <span className="flex items-center gap-1 text-[#B45309]">
              <span className="w-2.5 h-2.5 bg-amber-100 border border-amber-300 rounded-full inline-block animate-pulse"></span>Dipesan
            </span>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-500 pb-1 mb-1 border-b border-slate-200">
          {dayNames.map((name, i) => <div key={i}>{name}</div>)}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {daysArr.map((day) => {
            const isBooked = !!bookedDays[day];
            const loanCode = bookedDays[day];

            return (
              <div
                key={day}
                title={isBooked ? `Sudah dibooking oleh ${loanCode}` : 'Tersedia'}
                className={`text-xs py-1.5 rounded-md font-medium select-none cursor-help transition-all ${
                  isBooked
                    ? 'bg-amber-100 text-[#B45309] border border-amber-350 font-bold hover:bg-amber-150 shadow-sm'
                    : 'bg-white text-slate-800 border border-slate-150 hover:bg-slate-100'
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
      
      {/* Back button option if detail is shown */}
      {selectedBarangDetail ? (
        <div className="space-y-4">
          <button
            onClick={() => setSelectedBarangDetail(null)}
            className="flex items-center gap-1 text-xs font-bold text-[#1E3A8A] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Semua Barang
          </button>

          {/* ITEM DETAIL SCREEN */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            
            {/* Left: Big photo */}
            <div className="space-y-4">
              <div className="aspect-video md:aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 relative border border-slate-200">
                <img
                  src={selectedBarangDetail.foto}
                  alt={selectedBarangDetail.nama}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x400/f8fafc/475569?text=Tidak+Ada+Gambar'; }}
                />
                {isAdminPreview && (
                  <span className="absolute top-3 left-3 bg-[#1E3A8A] text-white text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full shadow-sm">
                    {selectedBarangDetail.kode}
                  </span>
                )}

                {selectedBarangDetail.stok_tersedia > 0 ? (
                  <span className="absolute bottom-3 right-3 bg-[#CCFBF1] text-[#0F766E] text-xs font-bold px-3 py-1 rounded-full shadow border border-teal-100 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Tersedia ({selectedBarangDetail.stok_tersedia} unit)
                  </span>
                ) : (
                  <span className="absolute bottom-3 right-3 bg-red-100 text-[#B91C1C] text-xs font-bold px-3 py-1 rounded-full shadow border border-red-150 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" />
                    Habis (0 unit)
                  </span>
                )}
              </div>

              {/* Location Specification */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5">
                <MapPin className="text-[#1E3A8A] w-5 h-5 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Lokasi Penyimpanan sarpras</span>
                  <span className="text-xs font-bold text-slate-700">{selectedBarangDetail.lokasi}</span>
                </div>
              </div>
            </div>

            {/* Right: Info and calendar */}
            <div className="flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 capitalize px-2 py-0.5 border border-slate-200 rounded bg-slate-50">
                    Kategori: {kategoriList.find(k => k.id === selectedBarangDetail.kategori_id)?.nama || 'Lain-lain'}
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl font-extrabold text-slate-800 mt-2 leading-tight">
                  {selectedBarangDetail.nama}
                </h3>
                
                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  {selectedBarangDetail.deskripsi}
                </p>

                {/* Specs Table */}
                {selectedBarangDetail.spesifikasi && (
                  <div className="mt-4">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Spesifikasi Detail:</p>
                    <div className="border border-slate-100 rounded-lg overflow-hidden text-xs">
                      {Object.entries(selectedBarangDetail.spesifikasi).map(([key, val], sIdx) => (
                        <div key={sIdx} className="flex border-b border-slate-100 last:border-b-0">
                          <span className="w-1/3 bg-slate-50 p-2 text-slate-400 font-semibold border-r border-slate-100 uppercase text-[9px] tracking-wider">{key}</span>
                          <span className="w-2/3 p-2 font-semibold text-slate-700">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* June 2026 Booking Calendar */}
                {renderJune2026Calendar(selectedBarangDetail.id)}
              </div>

              {/* CTA Action */}
              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button
                  onClick={() => setSelectedBarangDetail(null)}
                  className="flex-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold py-3 rounded-lg active:scale-95 transition-all text-center cursor-pointer"
                >
                  Kembali
                </button>
                {!isAdminPreview && (
                  <button
                    onClick={() => {
                      if (selectedBarangDetail.stok_tersedia > 0) {
                        onStartBorrow(selectedBarangDetail.id);
                        setSelectedBarangDetail(null);
                      } else {
                        alert('Stok barang ini sedang habis. Silakan periksa kalender ketersediaan untuk memperkirakan kapan barang dikembalikan oleh peminjam sebelumnya.');
                      }
                    }}
                    disabled={selectedBarangDetail.stok_tersedia <= 0}
                    className="flex-1 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white text-xs font-semibold py-3 rounded-lg active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow cursor-pointer text-center"
                  >
                    Pinjam Sekarang
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      ) : (
        <>
          {/* List View with search and filter */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-[#1E3A8A] leading-none flex items-center gap-2">
                <Grid className="w-6 h-6 text-[#1E3A8A] stroke-[2.5]" />
                Katalog Inventaris
              </h2>
              <p className="text-xs text-slate-500 font-bold mt-1 tracking-wide">
                SMA Negeri 1 Sentolo • Pilih Sarana dan Inventaris Siap Pakai
              </p>
            </div>

            {/* Sticky Search bar */}
            <div className="relative w-full md:w-80">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search className="w-4.5 h-4.5" />
              </span>
              <input
                type="text"
                placeholder="Cari SKU atau nama barang..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white text-xs font-bold text-slate-800 placeholder-slate-450 rounded-lg border-2 border-slate-900 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]"
              />
            </div>
          </div>

          {/* Categories Navigation Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => setSelectedKategori('semua')}
              className={`px-3 py-1.5 rounded-full text-[10px] font-black tracking-wider shrink-0 transition-all border-2 border-slate-900 cursor-pointer ${
                selectedKategori === 'semua'
                  ? 'bg-[#1E3A8A] text-white shadow'
                  : 'bg-white hover:bg-slate-100 text-slate-700'
              }`}
            >
              Semua Barang
            </button>
            {kategoriList.map((kat) => (
              <button
                key={kat.id}
                onClick={() => setSelectedKategori(kat.id)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-black tracking-wider shrink-0 transition-all border-2 border-slate-900 cursor-pointer ${
                   selectedKategori === kat.id
                    ? 'bg-[#1E3A8A] text-white shadow'
                    : 'bg-white hover:bg-slate-100 text-slate-700'
                }`}
              >
                {kat.nama}
              </button>
            ))}
          </div>

          {/* Grid Layout of items */}
          {filteredBarangList.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center shadow-sm">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2 text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <p className="font-bold text-slate-700 text-sm">Tidakada barang cocok</p>
              <p className="text-xs text-slate-500 mt-1">Coba sesuaikan kata pencarian atau pilih kategori lainnya.</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedKategori('semua'); }}
                className="mt-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-1.5 px-3 rounded-lg border border-slate-250 transition-all cursor-pointer"
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
                    className="bg-white rounded-xl border-2 border-slate-900 shadow-sm translate-y-0 hover:-translate-y-0.5 hover:shadow transition-all flex flex-col justify-between overflow-hidden"
                  >
                    {/* Top layout thumb image */}
                    <div>
                      <div className="aspect-[4/3] bg-slate-100 relative group overflow-hidden border-b-2 border-slate-900">
                        <img
                          src={barang.foto}
                          alt={barang.nama}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x300/f8fafc/475569?text=Tidak+Ada+Gambar'; }}
                        />
                        {isAdminPreview && (
                          <span className="absolute top-2 left-2 bg-[#1E3A8A] border border-slate-900 text-white text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded">
                            {barang.kode}
                          </span>
                        )}

                        {isAvailable ? (
                          <span className="absolute top-2 right-2 bg-[#CCFBF1] text-[#0F766E] border border-teal-700 text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded shadow-xs">
                            SISA: {barang.stok_tersedia}
                          </span>
                        ) : (
                          <span className="absolute top-2 right-2 bg-red-100 text-[#B91C1C] border border-red-700 text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded shadow-xs">
                            KOSONG
                          </span>
                        )}
                      </div>

                      {/* Info lines */}
                      <div className="p-3.5 space-y-2">
                        <p className="text-[9px] text-[#1E3A8A] font-black uppercase leading-none tracking-wider">
                          {kategoriList.find((k) => k.id === barang.kategori_id)?.nama || 'Lain-lain'}
                        </p>
                        <h4 className="text-sm font-black text-slate-900 line-clamp-1 leading-snug tracking-tight truncate">
                          {barang.nama}
                        </h4>
                        <p className="text-[11px] font-medium text-slate-500 line-clamp-2 leading-relaxed">
                          {barang.deskripsi}
                        </p>
                      </div>
                    </div>

                    {/* Bottom control links */}
                    <div className="px-3.5 pb-3.5 pt-2 flex items-center justify-between gap-2.5 border-t border-slate-200">
                      <button
                        onClick={() => setSelectedBarangDetail(barang)}
                        className="text-[10px] font-black tracking-wider text-[#1E3A8A] hover:underline"
                        title="Lihat Detail, Spesifikasi, & Kalender Reservasi"
                      >
                        Info & Jadwal &rarr;
                      </button>

                      {!isAdminPreview && (
                        <button
                          onClick={() => onStartBorrow(barang.id)}
                          disabled={!isAvailable}
                          className="bg-[#1E3A8A] hover:bg-slate-900 text-white border border-slate-950 text-[10px] font-black tracking-wider px-3 py-1.5 rounded transition-all cursor-pointer select-none active:scale-95 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed disabled:border-slate-200"
                        >
                          Pinjam
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

    </div>
  );
}
