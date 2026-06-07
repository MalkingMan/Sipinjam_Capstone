/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Peminjaman, Barang } from '../types';
import { getPeminjaman, getBarang } from '../data/db';
import { Plus, Boxes, ClipboardList, TrendingUp, Calendar, CheckCircle2, Clock, AlertTriangle, AlertCircle, Info, ArrowUpRight, HelpCircle } from 'lucide-react';

interface PeminjamDashboardProps {
  key?: any;
  currentUser: User;
  onNavigate: (tab: string) => void;
  onSelectPeminjaman: (pjm: Peminjaman) => void;
}

export default function PeminjamDashboard({ currentUser, onNavigate, onSelectPeminjaman }: PeminjamDashboardProps) {
  const currentLoans = getPeminjaman();
  const allBarang = getBarang();

  // Filter loans belonging to this specific user
  const myLoans = currentLoans.filter((l) => l.peminjam_id === currentUser.id);

  // Stats
  const activeLoans = myLoans.filter((l) => l.status === 'dipinjam' || l.status === 'terlambat');
  const waitingLoans = myLoans.filter((l) => l.status === 'menunggu' || l.status === 'disetujui');
  const finishedLoans = myLoans.filter((l) => l.status === 'selesai');

  // Teacher statistics (for reports requested in prompt)
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
      <div className="bg-[#1E3A8A] rounded-xl py-3.5 px-5 md:py-4 md:px-6 text-white shadow-md flex flex-wrap justify-between items-center gap-4 relative overflow-hidden border-2 border-slate-950">
        <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full translate-x-12 -translate-y-12"></div>
        <div className="relative">
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-white leading-none">
            Halo, {currentUser.nama}!
          </h2>
          <p className="text-[11px] md:text-xs text-blue-100 font-medium mt-1.5 max-w-lg leading-relaxed">
            Selamat datang di SIPINJAM SMAN 1 Sentolo. Cari barang, ajukan peminjaman, dan pantau status pengajuan dengan mudah.
          </p>
        </div>
        <button
          onClick={() => onNavigate('katalog')}
          className="bg-white hover:bg-amber-100 text-[#1E3A8A] border-2 border-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow transition-all transform active:scale-95 cursor-pointer tracking-wider"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Mulai Pinjam Barang
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Waiting card */}
        <div className="bg-white p-4.5 rounded-xl shadow-sm border-2 border-slate-905 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Menunggu Approval</p>
            <p className={`text-3xl font-black mt-1 leading-none ${waitingLoans.length > 0 ? 'text-[#B45309]' : 'text-slate-400'}`}>{waitingLoans.length}</p>
            <p className="text-[10px] text-slate-500 font-bold mt-1.5">Pengajuan segera ditinjau TU</p>
          </div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${waitingLoans.length > 0 ? 'bg-amber-50 border border-amber-200 text-[#B45309]' : 'bg-slate-50 border border-slate-200 text-slate-400'}`}>
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Borrowing card */}
        <div className="bg-white p-4.5 rounded-xl shadow-sm border-2 border-slate-905 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Sedang Dipinjam</p>
            <p className={`text-3xl font-black mt-1 leading-none ${activeLoans.length > 0 ? 'text-[#1E3A8A]' : 'text-slate-400'}`}>{activeLoans.length}</p>
            <p className="text-[10px] text-slate-500 font-bold mt-1.5">Wajib dijaga & dikembalikan tepat</p>
          </div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${activeLoans.length > 0 ? 'bg-blue-50 border border-blue-200 text-[#1E3A8A]' : 'bg-slate-50 border border-slate-200 text-slate-400'}`}>
            <Boxes className="w-6 h-6" />
          </div>
        </div>

        {/* Finished card */}
        <div className="bg-white p-4.5 rounded-xl shadow-sm border-2 border-slate-905 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Riwayat</p>
            <p className={`text-3xl font-black mt-1 leading-none ${finishedLoans.length > 0 ? 'text-[#0F766E]' : 'text-slate-400'}`}>{finishedLoans.length}</p>
            <p className="text-[10px] text-slate-500 font-bold mt-1.5">Transaksi peminjaman selesai</p>
          </div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${finishedLoans.length > 0 ? 'bg-teal-50 border border-teal-200 text-[#0F766E]' : 'bg-slate-50 border border-slate-200 text-slate-400'}`}>
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Loan List and Stepper Tracking (Left 2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-[#1E3A8A] tracking-tight text-base md:text-lg flex items-center gap-1.5">
              <ClipboardList className="w-5 h-5 text-[#1E3A8A] stroke-[2.5]" />
              Peminjaman Aktif & Terbaru
            </h3>
            <button 
              onClick={() => onNavigate('peminjaman_saya')} 
              className="text-xs font-bold text-[#1E3A8A] tracking-wider hover:underline hover:text-[#1E3A8A]/80 transition-colors cursor-pointer"
            >
              Lihat Semua &rarr;
            </button>
          </div>

          {myLoans.length === 0 ? (
            <div className="bg-white border text-left md:text-center border-slate-300 rounded-xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400 border border-slate-200">
                <Boxes className="w-6 h-6" />
              </div>
              <p className="font-extrabold text-slate-900 text-sm">Belum ada peminjaman draf atau aktif</p>
              <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
                Anda belum mengajukan peminjaman inventaris apa pun di sistem SIPINJAM. Cari peralatan kegiatan Anda sekarang!
              </p>
              <button
                onClick={() => onNavigate('katalog')}
                className="mt-4 bg-[#1E3A8A] hover:bg-slate-900 text-white font-black text-xs py-2 px-4 rounded-lg shadow border-2 border-slate-900 transition-all tracking-wider"
              >
                Mulai Telusuri Katalog
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myLoans.slice(0, 3).map((loan) => {
                const stepIdx = getStepIndex(loan.status);
                const isRejectedOrDelayed = loan.status === 'ditolak' || loan.status === 'terlambat';

                return (
                  <div key={loan.id} className="bg-white border-2 border-slate-900 rounded-xl shadow-sm p-4 hover:shadow transition-shadow">
                    {/* Header bar of loan item */}
                    <div className="flex justify-between items-start gap-4 pb-3 border-b border-slate-150">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-[#1E3A8A]">{loan.kode}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">• {loan.tgl_pengajuan}</span>
                        </div>
                        <h4 className="text-xs text-slate-650 mt-1 leading-snug line-clamp-1">
                          Keperluan: <span className="font-bold text-slate-900">{loan.keperluan}</span>
                        </h4>
                      </div>

                      {/* Status badge */}
                      {loan.status === 'menunggu' && (
                        <span className="bg-amber-100 text-[#B45309] text-[10px] font-bold px-2 py-1 rounded">MENUNGGU</span>
                      )}
                      {loan.status === 'disetujui' && (
                        <span className="bg-[#CCFBF1] text-[#0F766E] text-[10px] font-bold px-2 py-1 rounded">DISETUJUI</span>
                      )}
                      {loan.status === 'dipinjam' && (
                        <span className="bg-blue-100 text-[#1E3A8A] text-[10px] font-bold px-2 py-1 rounded">DIPINJAM</span>
                      )}
                      {loan.status === 'selesai' && (
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded">SELESAI</span>
                      )}
                      {loan.status === 'ditolak' && (
                        <span className="bg-red-100 text-[#B91C1C] text-[10px] font-bold px-2 py-1 rounded">DITOLAK</span>
                      )}
                      {loan.status === 'terlambat' && (
                        <span className="bg-red-100 text-[#B91C1C] text-[10px] font-bold px-2 py-1 rounded flex items-center gap-0.5">
                          <AlertTriangle className="w-3 h-3 text-[#B91C1C]" />
                          TERLAMBAT
                        </span>
                      )}
                    </div>

                    {/* Details and items */}
                    <div className="my-3 text-xs text-slate-600">
                      <p className="font-medium">Barang yang dipinjam:</p>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {loan.items.map((it, idx) => {
                          const matched = allBarang.find((b) => b.id === it.barang_id);
                          return (
                            <span key={idx} className="bg-slate-100 text-slate-800 px-2 py-1 rounded border border-slate-200">
                              {matched ? matched.nama : 'Barang'} ({it.jumlah} unit)
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Horizontal Stepper Progress Tracking */}
                    {!isRejectedOrDelayed && (
                      <div className="pt-3 border-t border-slate-50">
                        <p className="text-[10px] text-slate-400 font-bold tracking-wider mb-2">Status Alur Pengembalian:</p>
                        <div className="flex items-center justify-between relative mt-1.5 px-4">
                          
                          {/* Connecting lines */}
                          <div className="absolute left-6 right-6 top-2 h-0.5 bg-slate-200 -z-10">
                            <div 
                              className="h-full bg-[#0F766E] transition-all duration-300" 
                              style={{ width: `${(stepIdx / (steps.length - 1)) * 100}%` }}
                            ></div>
                          </div>

                          {steps.map((step, sIdx) => {
                            const isCompleted = sIdx <= stepIdx;
                            const isActive = sIdx === stepIdx;

                            return (
                              <div key={sIdx} className="flex flex-col items-center">
                                <div 
                                  className={`w-4.5 h-4.5 rounded-full flex items-center justify-center border text-[9px] font-bold transition-all ${
                                    isCompleted 
                                      ? 'bg-[#0F766E] border-[#0F766E] text-white shadow-sm scale-110' 
                                      : 'bg-white border-slate-300 text-slate-400'
                                  } ${isActive ? 'ring-4 ring-teal-150 animate-pulse' : ''}`}
                                >
                                  {isCompleted ? '✓' : sIdx + 1}
                                </div>
                                <span className={`text-[9px] font-bold mt-1 ${isCompleted ? 'text-[#0F766E]' : 'text-slate-400'}`}>
                                  {step}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Explanatory Info Alerts / Feedbacks */}
                    {loan.status === 'ditolak' && loan.catatan_admin && (
                      <div className="mt-3 p-2.5 bg-red-50 text-red-900 rounded-lg text-xs border border-red-150 flex gap-1.5 items-start">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#B91C1C]" />
                        <div>
                          <p className="font-bold">Alasan Penolakan Staff TU:</p>
                          <p className="text-slate-600 mt-0.5">{loan.catatan_admin}</p>
                        </div>
                      </div>
                    )}

                    {loan.status === 'disetujui' && (
                      <div className="mt-3 p-2.5 bg-teal-50 text-teal-900 rounded-lg text-xs border border-teal-100 flex gap-1.5 items-start">
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#0F766E]" />
                        <div>
                          <p className="font-bold">Barang siap diambil di Ruang TU!</p>
                          <p className="text-slate-600 mt-0.5">Tunjukkan kode pengajuannya kepada <strong>Pak Bagas</strong> untuk penyerahan barang.</p>
                        </div>
                      </div>
                    )}

                    {loan.status === 'terlambat' && (
                      <div className="mt-3 p-2.5 bg-red-50 text-[#B91C1C] rounded-lg text-xs border border-red-200 flex gap-1.5 items-start">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#B91C1C]" />
                        <div>
                          <p className="font-bold">Batas Tanggal Pengembalian Terlewati!</p>
                          <p className="text-slate-600 mt-0.5">Harap segera mengembalikan barang ke Ruang TU untuk menghindari teguran tertulis.</p>
                        </div>
                      </div>
                    )}

                    {/* Detail button */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => onSelectPeminjaman(loan)}
                        className="text-xs font-semibold text-[#1E3A8A] border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
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

        {/* Informational Sidebar and Special Reports (Teacher role) (Right 1 Column) */}
        <div className="space-y-6">
          
          {/* Guru - Laporan Pribadi section, requested specifically in role specification */}
          {currentUser.role === 'guru' && (
            <div className="bg-white border border-[#0F766E]/20 rounded-xl p-4 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-150">
                <TrendingUp className="w-5 h-5 text-[#0F766E]" />
                <h4 className="font-bold text-slate-800 text-sm">Laporan Pribadi Guru</h4>
              </div>
              <div className="space-y-3">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 block tracking-wider">Frekuensi Penggunaan</span>
                  <span className="text-xl font-extrabold text-slate-800">{totalBorrowedTimes} kali</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">mengajukan pinjaman semester ini</span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 block tracking-wider">Logistik Terpopuler</span>
                  <span className="text-xs font-bold text-slate-800 block mt-1">
                    {Object.keys(categoriesMap).length > 0 
                      ? `${allBarang.find(b => b.kategori_id === Object.keys(categoriesMap)[0])?.nama || 'Elektronik'}`
                      : 'Belum ada data'}
                  </span>
                  <span className="text-[10px] text-slate-500">Paling sering dipinjam untuk kelas/kegiatan</span>
                </div>
              </div>
              <div className="p-3 bg-[#CCFBF1]/40 border border-[#0F766E]/20 rounded-lg text-[11px] text-[#0F766E]">
                <p className="font-bold">Hak Prioritas Peminjam Guru:</p>
                <p className="text-slate-600 mt-1">Peminjaman oleh Guru mendapatkan prioritas persetujuan instan dari sistem untuk kebutuhan darurat pembelajaran kelas.</p>
              </div>
            </div>
          )}

          {/* Quick Guidance Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <HelpCircle className="w-4.5 h-4.5 text-[#1E3A8A]" />
              Prosedur Peminjaman
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-slate-100 text-slate-700 font-bold rounded-full flex items-center justify-center shrink-0">1</span>
                <span>Pilih barang di menu <strong>Katalog</strong>, tentukan kuantitas & durasi.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-slate-100 text-slate-700 font-bold rounded-full flex items-center justify-center shrink-0">2</span>
                <span>Staff TU (Pak Bagas) akan memeriksa jadwal bentrok & kelayakan.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-slate-100 text-slate-700 font-bold rounded-full flex items-center justify-center shrink-0">3</span>
                <span>Ambil barang ke ruang TU jika status berubah menjadi <strong>DISETUJUI</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-slate-100 text-slate-700 font-bold rounded-full flex items-center justify-center shrink-0">4</span>
                <span>Kembalikan tepat waktu agar tercatat di lembaran pengembalian.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
