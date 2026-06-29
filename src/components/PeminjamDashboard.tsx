/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Peminjaman, Barang } from '../types';
import { getPeminjaman, getBarang } from '../data/db';
import { Plus, Boxes, ClipboardList, TrendingUp, CheckCircle2, Clock, AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react';

interface PeminjamDashboardProps {
  key?: any;
  currentUser: User;
  onNavigate: (tab: string) => void;
  onSelectPeminjaman: (pjm: Peminjaman) => void;
}

export default function PeminjamDashboard({ currentUser, onNavigate, onSelectPeminjaman }: PeminjamDashboardProps) {
  const currentLoans = getPeminjaman();
  const allBarang = getBarang();

  const myLoans = currentLoans.filter((l) => l.peminjam_id === currentUser.id);

  const activeLoans = myLoans.filter((l) => l.status === 'dipinjam' || l.status === 'terlambat');
  const waitingLoans = myLoans.filter((l) => l.status === 'menunggu_surat' || l.status === 'menunggu' || l.status === 'disetujui');
  const finishedLoans = myLoans.filter((l) => l.status === 'selesai');

  const totalBorrowedTimes = myLoans.length;
  const categoriesMap: { [cat: string]: number } = {};
  myLoans.forEach((l) => {
    l.items.forEach((item) => {
      const itemData = allBarang.find((b) => b.id === item.barang_id);
      if (itemData) {
        categoriesMap[itemData.kategori_id] = (categoriesMap[itemData.kategori_id] || 0) + item.jumlah;
      }
    });
  });

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'menunggu_surat': return 0;
      case 'menunggu': return 0;
      case 'disetujui': return 1;
      case 'dipinjam': return 2;
      case 'selesai': return 3;
      default: return 0;
    }
  };

  const steps = ['Diajukan', 'Disetujui', 'Diambil', 'Kembali'];

  return (
    <div id="peminjam_dashboard" className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 font-sans">

      {/* Welcome Banner */}
      <div className="bg-linear-to-br from-slate-700 to-slate-900 rounded-2xl py-6 px-5 md:px-7 text-white flex flex-wrap justify-between items-center gap-4 relative overflow-hidden shadow-card">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full translate-x-14 -translate-y-14 pointer-events-none"></div>
        <div className="absolute bottom-0 right-24 w-24 h-24 bg-white/5 rounded-full translate-y-12 pointer-events-none"></div>
        <div className="relative">
          <h2 className="text-xl font-semibold text-white leading-none">
            Halo, {currentUser.nama}!
          </h2>
          <p className="text-xs text-slate-200 mt-1.5 max-w-lg leading-relaxed">
            Selamat datang di SIPINJAM SMAN 1 Sentolo. Cari barang, ajukan peminjaman, dan pantau status pengajuan dengan mudah.
          </p>
        </div>
        <button
          onClick={() => onNavigate('katalog')}
          className="bg-white hover:bg-blue-50 text-[#334155] font-medium text-sm px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Mulai Pinjam Barang
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-soft p-4 flex items-center justify-between" style={{ borderTop: '2px solid #F59E0B' }}>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Menunggu Approval</p>
            <p className={`text-3xl font-bold mt-1 leading-none ${waitingLoans.length > 0 ? 'text-[#B45309]' : 'text-gray-400'}`}>{waitingLoans.length}</p>
            <p className="text-xs text-gray-400 mt-1.5">Pengajuan segera ditinjau TU</p>
          </div>
          <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${waitingLoans.length > 0 ? 'bg-amber-50 text-[#B45309]' : 'bg-gray-50 text-gray-400'}`}>
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-soft p-4 flex items-center justify-between" style={{ borderTop: '2px solid #334155' }}>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Sedang Dipinjam</p>
            <p className={`text-3xl font-bold mt-1 leading-none ${activeLoans.length > 0 ? 'text-[#334155]' : 'text-gray-400'}`}>{activeLoans.length}</p>
            <p className="text-xs text-gray-400 mt-1.5">Wajib dijaga & dikembalikan tepat</p>
          </div>
          <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${activeLoans.length > 0 ? 'bg-blue-50 text-[#334155]' : 'bg-gray-50 text-gray-400'}`}>
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-soft p-4 flex items-center justify-between" style={{ borderTop: '2px solid #16A34A' }}>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Total Riwayat</p>
            <p className={`text-3xl font-bold mt-1 leading-none ${finishedLoans.length > 0 ? 'text-[#16A34A]' : 'text-gray-400'}`}>{finishedLoans.length}</p>
            <p className="text-xs text-gray-400 mt-1.5">Transaksi peminjaman selesai</p>
          </div>
          <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${finishedLoans.length > 0 ? 'bg-green-50 text-[#16A34A]' : 'bg-gray-50 text-gray-400'}`}>
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Loan List (Left 2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 text-base flex items-center gap-1.5">
              <ClipboardList className="w-4 h-4 text-gray-500" />
              Peminjaman Aktif & Terbaru
            </h3>
            <button
              onClick={() => onNavigate('peminjaman_saya')}
              className="text-xs font-medium text-[#334155] hover:underline cursor-pointer"
            >
              Lihat Semua →
            </button>
          </div>

          {myLoans.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                <Boxes className="w-6 h-6" />
              </div>
              <p className="font-semibold text-gray-900 text-sm">Belum ada peminjaman</p>
              <p className="text-xs text-gray-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
                Anda belum mengajukan peminjaman inventaris apa pun di sistem SIPINJAM.
              </p>
              <button
                onClick={() => onNavigate('katalog')}
                className="mt-4 bg-[#334155] hover:bg-[#1E293B] text-white font-medium text-xs py-2 px-4 rounded-lg transition-all cursor-pointer"
              >
                Telusuri Katalog
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myLoans.slice(0, 3).map((loan) => {
                const stepIdx = getStepIndex(loan.status);
                const isRejectedOrDelayed = loan.status === 'ditolak' || loan.status === 'terlambat';

                return (
                  <div key={loan.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-4 pb-3 border-b border-gray-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-[#334155]">{loan.kode}</span>
                          <span className="text-xs text-gray-400">· {loan.tgl_pengajuan}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                          {loan.keperluan}
                        </p>
                      </div>

                      {/* Status badge */}
                      {loan.status === 'menunggu' && (
                        <span className="bg-amber-50 text-amber-700 text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap">Menunggu</span>
                      )}
                      {loan.status === 'menunggu_surat' && (
                        <span className="bg-amber-50 text-amber-700 text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap">Menunggu Surat</span>
                      )}
                      {loan.status === 'disetujui' && (
                        <span className="bg-green-50 text-green-700 text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap">Disetujui</span>
                      )}
                      {loan.status === 'dipinjam' && (
                        <span className="bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap">Dipinjam</span>
                      )}
                      {loan.status === 'selesai' && (
                        <span className="bg-gray-100 text-gray-500 text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap">Selesai</span>
                      )}
                      {loan.status === 'ditolak' && (
                        <span className="bg-red-50 text-red-600 text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap">Ditolak</span>
                      )}
                      {loan.status === 'terlambat' && (
                        <span className="bg-red-50 text-red-700 text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Terlambat
                        </span>
                      )}
                    </div>

                    {/* Items */}
                    <div className="my-3 text-xs text-gray-600">
                      <p className="font-medium text-gray-500 mb-1.5">Barang dipinjam:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {loan.items.map((it, idx) => {
                          const matched = allBarang.find((b) => b.id === it.barang_id);
                          return (
                            <span key={idx} className="bg-gray-100 text-gray-600 border border-gray-200 px-2 py-0.5 rounded text-xs">
                              {matched ? matched.nama : 'Barang'} ({it.jumlah} unit)
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Stepper */}
                    {!isRejectedOrDelayed && (
                      <div className="pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-400 font-medium mb-2">Status alur:</p>
                        <div className="flex items-center justify-between relative px-4">
                          <div className="absolute left-6 right-6 top-2 h-0.5 bg-gray-200 -z-10">
                            <div
                              className="h-full bg-[#16A34A] transition-all duration-300"
                              style={{ width: `${(stepIdx / (steps.length - 1)) * 100}%` }}
                            ></div>
                          </div>
                          {steps.map((step, sIdx) => {
                            const isCompleted = sIdx <= stepIdx;
                            const isActive = sIdx === stepIdx;
                            return (
                              <div key={sIdx} className="flex flex-col items-center">
                                <div
                                  className={`w-4 h-4 rounded-full flex items-center justify-center border text-[8px] font-medium transition-all ${
                                    isCompleted
                                      ? 'bg-[#16A34A] border-[#16A34A] text-white'
                                      : 'bg-white border-gray-300 text-gray-400'
                                  } ${isActive ? 'ring-2 ring-green-100' : ''}`}
                                >
                                  {isCompleted ? '✓' : sIdx + 1}
                                </div>
                                <span className={`text-[10px] font-medium mt-1 ${isCompleted ? 'text-[#16A34A]' : 'text-gray-400'}`}>
                                  {step}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Alerts */}
                    {loan.status === 'ditolak' && loan.catatan_admin && (
                      <div className="mt-3 p-2.5 bg-red-50 text-red-700 rounded-lg text-xs border border-red-100 flex gap-1.5 items-start">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                        <div>
                          <p className="font-medium">Alasan Penolakan:</p>
                          <p className="text-gray-600 mt-0.5">{loan.catatan_admin}</p>
                        </div>
                      </div>
                    )}

                    {loan.status === 'disetujui' && (
                      <div className="mt-3 p-2.5 bg-green-50 text-green-700 rounded-lg text-xs border border-green-100 flex gap-1.5 items-start">
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Barang siap diambil di Ruang TU!</p>
                          <p className="text-gray-600 mt-0.5">Tunjukkan kode pengajuan kepada <strong>Pak Bagas</strong>.</p>
                        </div>
                      </div>
                    )}

                    {loan.status === 'terlambat' && (
                      <div className="mt-3 p-2.5 bg-red-50 text-red-700 rounded-lg text-xs border border-red-100 flex gap-1.5 items-start">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Batas Pengembalian Terlewati!</p>
                          <p className="text-gray-600 mt-0.5">Harap segera kembalikan barang ke Ruang TU.</p>
                        </div>
                      </div>
                    )}

                    {/* Detail button */}
                    <div className="mt-3 pt-2.5 border-t border-gray-100 flex justify-end">
                      <button
                        onClick={() => onSelectPeminjaman(loan)}
                        className="text-xs font-medium text-[#334155] border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        Info Selengkapnya
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar (Right 1 Column) */}
        <div className="space-y-4">
          {/* Guru Report */}
          {currentUser.role === 'guru' && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <TrendingUp className="w-4 h-4 text-[#16A34A]" />
                <h4 className="font-semibold text-gray-900 text-sm">Laporan Pribadi Guru</h4>
              </div>
              <div className="space-y-2">
                <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                  <span className="text-xs font-medium text-gray-400 block uppercase tracking-wide">Frekuensi Penggunaan</span>
                  <span className="text-xl font-bold text-gray-800">{totalBorrowedTimes} kali</span>
                  <span className="text-xs text-gray-400 block mt-0.5">mengajukan pinjaman semester ini</span>
                </div>
                <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                  <span className="text-xs font-medium text-gray-400 block uppercase tracking-wide">Logistik Terpopuler</span>
                  <span className="text-sm font-medium text-gray-800 block mt-1">
                    {Object.keys(categoriesMap).length > 0
                      ? `${allBarang.find(b => b.kategori_id === Object.keys(categoriesMap)[0])?.nama || 'Elektronik'}`
                      : 'Belum ada data'}
                  </span>
                  <span className="text-xs text-gray-400">Paling sering dipinjam</span>
                </div>
              </div>
              <div className="p-3 bg-green-50 border border-green-100 rounded-lg text-xs text-green-700">
                <p className="font-medium">Hak Prioritas Peminjam Guru:</p>
                <p className="text-gray-600 mt-1">Peminjaman oleh Guru mendapatkan prioritas persetujuan untuk kebutuhan darurat pembelajaran.</p>
              </div>
            </div>
          )}

          {/* Guidance Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-1.5 pb-2 border-b border-gray-100">
              <HelpCircle className="w-4 h-4 text-gray-400" />
              Prosedur Peminjaman
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-600">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-gray-100 text-gray-600 font-medium rounded-full flex items-center justify-center shrink-0 text-[10px]">1</span>
                <span>Pilih barang di menu <strong>Katalog</strong>, tentukan kuantitas & durasi.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-gray-100 text-gray-600 font-medium rounded-full flex items-center justify-center shrink-0 text-[10px]">2</span>
                <span>Staff TU (Pak Bagas) akan memeriksa jadwal & kelayakan.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-gray-100 text-gray-600 font-medium rounded-full flex items-center justify-center shrink-0 text-[10px]">3</span>
                <span>Ambil barang ke ruang TU jika status berubah menjadi <strong>Disetujui</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-gray-100 text-gray-600 font-medium rounded-full flex items-center justify-center shrink-0 text-[10px]">4</span>
                <span>Kembalikan tepat waktu agar tercatat di lembaran pengembalian.</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
