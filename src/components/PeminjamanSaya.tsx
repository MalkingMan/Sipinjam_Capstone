/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Peminjaman, Barang } from '../types';
import { getPeminjaman, getBarang } from '../data/db';
import { ClipboardList, AlertTriangle, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface PeminjamanSayaProps {
  key?: any;
  currentUser: User;
  onSelectPeminjaman: (pjm: Peminjaman) => void;
  onNavigate: (tab: string) => void;
}

export default function PeminjamanSaya({ currentUser, onSelectPeminjaman, onNavigate }: PeminjamanSayaProps) {
  const [filter, setFilter] = useState<'semua' | 'menunggu' | 'dipinjam' | 'selesai' | 'terlambat'>('semua');

  const allLoans = getPeminjaman();
  const allBarang = getBarang();

  const myLoans = allLoans.filter((l) => l.peminjam_id === currentUser.id);
  const filteredLoans = myLoans.filter((l) => {
    if (filter === 'semua') return true;
    return l.status === filter;
  });

  const tabFilters: { key: typeof filter; label: string }[] = [
    { key: 'semua', label: `Semua (${myLoans.length})` },
    { key: 'menunggu', label: `Menunggu (${myLoans.filter(l => l.status === 'menunggu').length})` },
    { key: 'dipinjam', label: `Aktif (${myLoans.filter(l => l.status === 'dipinjam').length})` },
    { key: 'selesai', label: `Kembali (${myLoans.filter(l => l.status === 'selesai').length})` },
  ];

  return (
    <div id="peminjaman_saya_view" className="p-4 md:p-6 max-w-5xl mx-auto space-y-6 font-sans">

      {/* Title */}
      <div className="flex justify-between items-center flex-wrap gap-4 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-gray-400" />
            Riwayat & Daftar Peminjaman Saya
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Pantau status verifikasi dan lihat pesan dari Tata Usaha.
          </p>
        </div>
        <button
          onClick={() => onNavigate('cetak_template')}
          className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-medium px-4 py-2 rounded-lg transition cursor-pointer"
        >
          Cetak Template Surat Blanko
        </button>
      </div>

      {/* Tab Bar */}
      <div className="flex bg-white p-1 rounded-xl border border-gray-200 max-w-lg overflow-x-auto">
        {tabFilters.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`text-center py-1.5 text-xs font-medium rounded-lg transition-colors shrink-0 px-3.5 cursor-pointer ${
              filter === key ? 'bg-[#1E3A8A] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      {filteredLoans.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
            <ClipboardList className="w-6 h-6" />
          </div>
          <p className="font-semibold text-gray-900 text-sm">Belum ada peminjaman aktif</p>
          <p className="text-xs text-gray-400 mt-1">Tidak ada pengajuan berstatus "{filter}" saat ini.</p>
          <button
            onClick={() => onNavigate('katalog')}
            className="mt-4 bg-[#1E3A8A] hover:bg-[#1e40af] text-white font-medium text-xs px-4 py-2 rounded-lg transition cursor-pointer inline-block"
          >
            Lihat Katalog Barang
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLoans.map((loan) => (
            <div
              key={loan.id}
              onClick={() => onSelectPeminjaman(loan)}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 active:scale-[0.99] cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-[#1E3A8A]">{loan.kode}</span>
                  <span className="bg-gray-100 text-gray-600 border border-gray-200 text-xs font-medium px-2 py-0.5 rounded">
                    {loan.kategori_kegiatan}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-gray-800 leading-snug line-clamp-1">{loan.keperluan}</p>
                  <p className="text-xs text-gray-400">
                    Jadwal: <span className="font-medium text-gray-600">{loan.tgl_mulai}</span> s/d <span className="font-medium text-gray-600">{loan.tgl_kembali_rencana}</span>
                  </p>
                </div>

                {/* Item Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {loan.items.map((it, idx) => {
                    const match = allBarang.find(b => b.id === it.barang_id);
                    return (
                      <span key={idx} className="bg-gray-50 text-gray-600 border border-gray-200 text-xs font-medium px-2 py-0.5 rounded">
                        {match ? match.nama : 'Barang'} ×{it.jumlah}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Status + Actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                <div className="flex items-center gap-2 flex-wrap">
                  {(loan.status === 'menunggu_surat' || loan.status === 'menunggu') && (
                    <span className="bg-amber-50 text-amber-700 text-xs font-medium px-2.5 py-0.5 rounded-full">Menunggu Surat Fisik</span>
                  )}
                  {loan.status === 'disetujui' && (
                    <span className="bg-teal-50 text-teal-700 text-xs font-medium px-2.5 py-0.5 rounded-full">Disetujui — Ambil di TU</span>
                  )}
                  {loan.status === 'dipinjam' && (
                    <span className="bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full">Sedang Dipinjam</span>
                  )}
                  {loan.status === 'selesai' && (
                    <span className="bg-gray-100 text-gray-500 text-xs font-medium px-2.5 py-0.5 rounded-full">Selesai Dikembalikan</span>
                  )}
                  {loan.status === 'ditolak' && (
                    <span className="bg-red-50 text-red-600 text-xs font-medium px-2.5 py-0.5 rounded-full">Ditolak Admin</span>
                  )}
                  {loan.status === 'terlambat' && (
                    <span className="bg-red-50 text-red-700 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Terlambat
                    </span>
                  )}

                  {(loan.status === 'menunggu_surat' || loan.status === 'menunggu' || loan.status === 'disetujui') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate(`cetak_surat_${loan.id}`);
                      }}
                      className="bg-[#1E3A8A] hover:bg-[#1e40af] text-white font-medium text-xs px-3 py-1.5 rounded-lg shrink-0 cursor-pointer transition"
                    >
                      🖨 Cetak Surat
                    </button>
                  )}
                </div>

                <div className="w-8 h-8 rounded-full hidden sm:flex bg-gray-50 items-center justify-center text-gray-400">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
