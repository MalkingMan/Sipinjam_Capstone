/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Peminjaman, Barang } from '../types';
import { getPeminjaman, getBarang } from '../data/db';
import { ClipboardList, Calendar, Info, Clock, CheckCircle2, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
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

  // Filter based on user and active status tab selectors
  const myLoans = allLoans.filter((l) => l.peminjam_id === currentUser.id);
  const filteredLoans = myLoans.filter((l) => {
    if (filter === 'semua') return true;
    return l.status === filter;
  });

  return (
    <div id="peminjaman_saya_view" className="p-4 md:p-6 max-w-5xl mx-auto space-y-6 font-sans">
      
      {/* Title */}
      <div className="flex justify-between items-center flex-wrap gap-2 pb-4 border-b-2 border-slate-900">
        <div>
          <h2 className="text-xl font-black text-[#1E3A8A] flex items-center gap-2 leading-none">
            <ClipboardList className="w-5 h-5 text-[#1E3A8A] stroke-[2.5]" />
            Riwayat & Daftar Peminjaman Saya
          </h2>
          <p className="text-xs text-slate-500 font-bold mt-1 tracking-wider">
            Pantau status verifikasi, catat pengembalian, dan lihat pesan dari Tata Usaha.
          </p>
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex bg-white p-1 rounded-lg border-2 border-slate-900 max-w-lg overflow-x-auto shadow-sm">
        <button
          onClick={() => setFilter('semua')}
          className={`text-center py-1.5 text-[10px] font-black uppercase tracking-wider rounded-md transition-colors shrink-0 px-3.5 cursor-pointer ${
            filter === 'semua' ? 'bg-[#1E3A8A] text-white shadow' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          Semua ({myLoans.length})
        </button>
        <button
          onClick={() => setFilter('menunggu')}
          className={`text-center py-1.5 text-[10px] font-black uppercase tracking-wider rounded-md transition-colors shrink-0 px-3.5 cursor-pointer ${
            filter === 'menunggu' ? 'bg-[#1E3A8A] text-white shadow' : 'text-slate-600 hover:text-slate-805'
          }`}
        >
          Menunggu ({myLoans.filter(l => l.status === 'menunggu').length})
        </button>
        <button
          onClick={() => setFilter('dipinjam')}
          className={`text-center py-1.5 text-[10px] font-black uppercase tracking-wider rounded-md transition-colors shrink-0 px-3.5 cursor-pointer ${
            filter === 'dipinjam' ? 'bg-[#1E3A8A] text-white shadow' : 'text-slate-600 hover:text-slate-805'
          }`}
        >
          Aktif ({myLoans.filter(l => l.status === 'dipinjam').length})
        </button>
        <button
          onClick={() => setFilter('selesai')}
          className={`text-center py-1.5 text-[10px] font-black uppercase tracking-wider rounded-md transition-colors shrink-0 px-3.5 cursor-pointer ${
            filter === 'selesai' ? 'bg-[#1E3A8A] text-white shadow' : 'text-slate-600 hover:text-slate-805'
          }`}
        >
          Kembali ({myLoans.filter(l => l.status === 'selesai').length})
        </button>
      </div>

      {/* List content */}
      {filteredLoans.length === 0 ? (
        <div className="bg-white border-2 border-slate-900 rounded-xl p-12 text-center shadow-sm">
          <div className="w-12 h-12 bg-slate-50 border-2 border-slate-900 rounded-full flex items-center justify-center mx-auto mb-3 text-[#1E3A8A]">
            <ClipboardList className="w-6 h-6 stroke-[2.5]" />
          </div>
          <p className="font-black text-slate-805 text-sm">Belum ada peminjaman aktif</p>
          <p className="text-xs text-slate-500 mt-1 font-bold">Anda tidak memiliki pengajuan berstatus "{filter}" per saat ini.</p>
          <button
            onClick={() => onNavigate('katalog')}
            className="mt-4 bg-[#1E3A8A] hover:bg-slate-900 border-2 border-slate-950 text-white font-bold text-[10px] uppercase tracking-wider px-4 py-2 rounded-lg transition-all shadow-sm cursor-pointer inline-block"
          >
            Lihat Katalog Barang
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLoans.map((loan) => (
            <div
              key={loan.id}
              onClick={() => onSelectPeminjaman(loan)}
              className="bg-white border-2 border-slate-900 rounded-xl p-4 shadow-sm hover:shadow active:scale-[0.99] cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#1E3A8A]">{loan.kode}</span>
                  <span className="text-[10px] text-slate-400 font-bold px-2 py-0.5 rounded bg-slate-100 uppercase">
                    {loan.kategori_kegiatan}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-800 leading-snug line-clamp-1">{loan.keperluan}</p>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Jadwal: <span className="font-semibold text-slate-700">{loan.tgl_mulai}</span> s/d <span className="font-semibold text-slate-700">{loan.tgl_kembali_rencana}</span>
                  </p>
                </div>

                {/* Goods tags list */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {loan.items.map((it, idx) => {
                    const match = allBarang.find(b => b.id === it.barang_id);
                    return (
                      <span key={idx} className="bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-bold px-1.5 py-0.5 rounded">
                        {match ? match.nama : 'Barang'} ×{it.jumlah}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Status and Action arrow */}
              <div className="flex flex-col sm:flex-row items-center justify-between sm:justify-end gap-3.5 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-50">
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  {(loan.status === 'menunggu_surat' || loan.status === 'menunggu') && (
                    <span className="bg-amber-100 text-[#B45309] border border-amber-200 text-[10px] font-bold px-2.5 py-1 rounded">Menunggu Surat Fisik</span>
                  )}
                  {loan.status === 'disetujui' && (
                    <span className="bg-[#CCFBF1] text-[#0F766E] border border-teal-150 text-[10px] font-bold px-2.5 py-1 rounded">Disetujui (Ambil di TU)</span>
                  )}
                  {loan.status === 'dipinjam' && (
                    <span className="bg-blue-100 text-[#1E3A8A] border border-blue-200 text-[10px] font-bold px-2.5 py-1 rounded">Sedang Dipinjam</span>
                  )}
                  {loan.status === 'selesai' && (
                    <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold px-2.5 py-1 rounded">Selesai Dikembalikan</span>
                  )}
                  {loan.status === 'ditolak' && (
                    <span className="bg-red-100 text-[#B91C1C] border border-red-150 text-[10px] font-bold px-2.5 py-1 rounded">Ditolak Admin</span>
                  )}
                  {loan.status === 'terlambat' && (
                    <span className="bg-red-100 text-[#B91C1C] border border-red-200 text-[10px] font-bold px-2.5 py-1 rounded">Terlambat (Segera Kembalikan)</span>
                  )}

                  {(loan.status === 'menunggu_surat' || loan.status === 'menunggu' || loan.status === 'disetujui') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Call global function to print this loan's format
                        onNavigate(`cetak_surat_${loan.id}`);
                      }}
                      className="bg-[#1E3A8A] hover:bg-slate-900 border-2 border-slate-950 text-white font-bold text-[10px] tracking-wider px-2 py-1 rounded shadow-sm shrink-0 uppercase"
                    >
                      🖨 Cetak Surat
                    </button>
                  )}
                </div>

                <div className="w-8 h-8 rounded-full hidden sm:flex bg-slate-50 group-hover:bg-blue-50 items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
