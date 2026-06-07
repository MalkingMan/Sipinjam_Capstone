/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { User, Peminjaman, Barang } from '../types';
import { getPeminjaman, getBarang, savePeminjaman, saveBarang } from '../data/db';
import { Clock, Boxes, AlertTriangle, Database, Check, X, Info, Calendar, User as UserIcon, Keyboard, MessageSquare, RefreshCw, ClipboardList, ShieldAlert } from 'lucide-react';

interface AdminDashboardProps {
  key?: any;
  currentUser: User;
  onRefresh: () => void;
}

type BottomTab = 'menunggu' | 'dipinjam' | 'selesai' | 'semua';

export default function AdminDashboard({ currentUser, onRefresh }: AdminDashboardProps) {
  const [selectedLoan, setSelectedLoan] = useState<Peminjaman | null>(null);
  const [activeListTab, setActiveListTab] = useState<BottomTab>('menunggu');
  const [adminNote, setAdminNote] = useState('');
  const [returnCondition, setReturnCondition] = useState<'baik' | 'rusak_ringan' | 'rusak_berat' | 'hilang'>('baik');
  const [returnNote, setReturnNote] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [isReturning, setIsReturning] = useState(false);

  const allLoans = getPeminjaman();
  const allBarang = getBarang();

  // Metrics calculation
  const pendingCount = allLoans.filter((l) => l.status === 'menunggu_surat' || l.status === 'menunggu').length;
  const activeCount = allLoans.filter((l) => l.status === 'dipinjam').length;
  const overdueCount = allLoans.filter((l) => l.status === 'terlambat').length;
  const totalItemCount = allBarang.length;

  // Ordering list based on tab
  const getFilteredLoans = () => {
    switch (activeListTab) {
      case 'menunggu':
        return allLoans.filter((l) => l.status === 'menunggu_surat' || l.status === 'menunggu').sort((a,b) => new Date(b.tgl_pengajuan).getTime() - new Date(a.tgl_pengajuan).getTime()); 
      case 'dipinjam':
        return allLoans.filter((l) => l.status === 'dipinjam' || l.status === 'terlambat' || l.status === 'disetujui');
      case 'selesai':
        return allLoans.filter((l) => l.status === 'selesai' || l.status === 'ditolak');
      default:
        return allLoans;
    }
  };

  const filteredLoans = getFilteredLoans();

  // Admin approval processing
  const handleApprove = (loanId: string) => {
    const loans = getPeminjaman();
    const barangList = getBarang();
    const targetLoanIndex = loans.findIndex((l) => l.id === loanId);
    
    if (targetLoanIndex === -1) return;
    const targetLoan = loans[targetLoanIndex];

    // Check inventory stocks availability
    for (const item of targetLoan.items) {
      const match = barangList.find((b) => b.id === item.barang_id);
      if (!match || match.stok_tersedia < item.jumlah) {
        alert(`Gagal menyetujui: Stok ${match ? match.nama : 'Barang'} tidak mencukupi.`);
        return;
      }
    }

    // Deduct stock
    const updatedBarang = barangList.map((b) => {
      const neededItem = targetLoan.items.find((it) => it.barang_id === b.id);
      if (neededItem) {
        return {
          ...b,
          stok_tersedia: Math.max(0, b.stok_tersedia - neededItem.jumlah)
        };
      }
      return b;
    });

    // Update loan status to 'disetujui' (can transition to 'dipinjam' after actual take)
    // For prototyping ease, let's allow moving directly to 'dipinjam' so users can see stock alterations
    const response = confirm('Setujui peminjaman ini? Status barang akan ditandai "DISETUJUI & Siap Diambil".');
    if (!response) return;

    loans[targetLoanIndex].status = 'disetujui';
    loans[targetLoanIndex].catatan_admin = adminNote.trim() || 'Disetujui oleh Tata Usaha.';
    loans[targetLoanIndex].approver_id = currentUser.id;

    savePeminjaman(loans);
    saveBarang(updatedBarang);
    
    setAdminNote('');
    setSelectedLoan(null);
    onRefresh();
  };

  // Reject processing
  const handleReject = (loanId: string) => {
    if (!adminNote.trim()) {
      alert('Harap masukkan alasan penolakan pada kolom catatan admin.');
      return;
    }

    const loans = getPeminjaman();
    const targetLoanIndex = loans.findIndex((l) => l.id === loanId);
    if (targetLoanIndex === -1) return;

    loans[targetLoanIndex].status = 'ditolak';
    loans[targetLoanIndex].catatan_admin = adminNote.trim();
    loans[targetLoanIndex].approver_id = currentUser.id;

    savePeminjaman(loans);
    
    setAdminNote('');
    setIsRejecting(false);
    setSelectedLoan(null);
    onRefresh();
  };

  // Convert status to general borrow (simulating student came to TU room and picked it up)
  const handleDeliverToPeminjam = (loanId: string) => {
    const loans = getPeminjaman();
    const index = loans.findIndex(l => l.id === loanId);
    if (index === -1) return;

    loans[index].status = 'dipinjam';
    savePeminjaman(loans);
    setSelectedLoan(null);
    onRefresh();
  };

  // Record item return processing
  const handleReturnConfirm = (loanId: string) => {
    const loans = getPeminjaman();
    const barangList = getBarang();
    const targetLoanIndex = loans.findIndex((l) => l.id === loanId);
    if (targetLoanIndex === -1) return;

    const targetLoan = loans[targetLoanIndex];

    // Return stock back if the item is not completely lost
    const updatedBarang = barangList.map((b) => {
      const returnedItem = targetLoan.items.find((it) => it.barang_id === b.id);
      if (returnedItem) {
        // If condition is 'hilang', total stock is permanently decremented
        const stockToIncrease = returnCondition === 'hilang' ? 0 : returnedItem.jumlah;
        const totalStockDelta = returnCondition === 'hilang' ? -returnedItem.jumlah : 0;
        
        return {
          ...b,
          stok_total: Math.max(0, b.stok_total + totalStockDelta),
          stok_tersedia: Math.min(b.stok_total + totalStockDelta, b.stok_tersedia + stockToIncrease)
        };
      }
      return b;
    });

    // Save subcollection detail values in main object for simple display
    loans[targetLoanIndex].status = 'selesai';
    loans[targetLoanIndex].tgl_kembali_aktual = new Date().toISOString().split('T')[0];
    loans[targetLoanIndex].catatan_admin = `Kondisi: ${returnCondition.toUpperCase()}. Catatan: ${returnNote.trim() || 'Kondisi baik.'}`;
    
    // Set returned items conditions details
    loans[targetLoanIndex].items = loans[targetLoanIndex].items.map((it) => ({
      ...it,
      kondisi_kembali: returnCondition,
      catatan_kondisi: returnNote.trim()
    }));

    savePeminjaman(loans);
    saveBarang(updatedBarang);

    setReturnNote('');
    setReturnCondition('baik');
    setIsReturning(false);
    setSelectedLoan(null);
    onRefresh();
  };

  return (
    <div id="admin_dashboard" className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Title block */}
      <div>
        <h2 className="text-2xl font-black text-[#1E3A8A] leading-none flex items-center gap-2">
          <Database className="w-6 h-6 text-[#1E3A8A] stroke-[2.5]" />
          Aktivitas Tata Usaha Sarpras
        </h2>
        <p className="text-xs text-slate-500 font-bold mt-1 tracking-wider">
          Panel Kendali Administrator • SMA Negeri 1 Sentolo Yogyakarta
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border-2 border-slate-900 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 tracking-widest leading-none">Menunggu Approval</p>
          <div className="flex items-center justify-between mt-3">
            <span className={`text-3xl font-black leading-none ${pendingCount > 0 ? 'text-[#B45309]' : 'text-slate-405'}`}>{pendingCount}</span>
            <span className={`p-2 rounded border ${pendingCount > 0 ? 'bg-amber-50 text-[#B45309] border-amber-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}><Clock className="w-5 h-5" /></span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border-2 border-slate-900 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 tracking-widest leading-none">Aktif Dipinjam</p>
          <div className="flex items-center justify-between mt-3">
            <span className={`text-3xl font-black leading-none ${activeCount > 0 ? 'text-[#1E3A8A]' : 'text-slate-405'}`}>{activeCount}</span>
            <span className={`p-2 rounded border ${activeCount > 0 ? 'bg-blue-50 text-[#1E3A8A] border-blue-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}><Boxes className="w-5 h-5" /></span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border-2 border-slate-900 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 tracking-widest leading-none">Terlambat Kembali</p>
          <div className="flex items-center justify-between mt-3">
            <span className={`text-3xl font-black leading-none ${overdueCount > 0 ? 'text-[#B91C1C]' : 'text-slate-405'}`}>{overdueCount}</span>
            <span className={`p-2 rounded border ${overdueCount > 0 ? 'bg-red-50 text-[#B91C1C] border-red-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}><AlertTriangle className="w-5 h-5" /></span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border-2 border-slate-900 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 tracking-widest leading-none">Total Ragam Barang</p>
          <div className="flex items-center justify-between mt-3">
            <span className={`text-3xl font-black leading-none ${totalItemCount > 0 ? 'text-[#0F766E]' : 'text-slate-405'}`}>{totalItemCount}</span>
            <span className={`p-2 rounded border ${totalItemCount > 0 ? 'bg-teal-50 text-[#0F766E] border-teal-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}><Database className="w-5 h-5" /></span>
          </div>
        </div>
      </div>

      {/* Main Container Layout: Left rows list, Right panel drawer (conditional) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Loan Requests Table & list */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Header & Section controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2 rounded-xl border-2 border-slate-900 shadow-sm">
            <span className="text-[10px] font-black text-[#1E3A8A] px-2 tracking-widest">Transaksi:</span>
            
            <div className="flex gap-1 overflow-x-auto">
              <button
                onClick={() => { setActiveListTab('menunggu'); setSelectedLoan(null); }}
                className={`text-[10px] font-black tracking-wider py-1.5 px-3 rounded-lg cursor-pointer ${
                  activeListTab === 'menunggu' ? 'bg-[#1E3A8A] text-white shadow' : 'text-slate-600 hover:text-slate-805'
                }`}
              >
                Menunggu ({pendingCount})
              </button>
              <button
                onClick={() => { setActiveListTab('dipinjam'); setSelectedLoan(null); }}
                className={`text-[10px] font-black tracking-wider py-1.5 px-3 rounded-lg cursor-pointer ${
                  activeListTab === 'dipinjam' ? 'bg-[#1E3A8A] text-white shadow' : 'text-slate-600 hover:text-slate-805'
                }`}
              >
                Dipinjam/Terlambat ({activeCount + overdueCount})
              </button>
              <button
                onClick={() => { setActiveListTab('selesai'); setSelectedLoan(null); }}
                className={`text-[10px] font-black tracking-wider py-1.5 px-3 rounded-lg cursor-pointer ${
                  activeListTab === 'selesai' ? 'bg-[#1E3A8A] text-white shadow' : 'text-slate-600 hover:text-slate-805'
                }`}
              >
                Selesai/Ditolak
              </button>
            </div>
          </div>

          {/* List layout */}
          {filteredLoans.length === 0 ? (
            <div className="bg-white border-2 border-slate-900 rounded-xl p-12 text-center">
              <ClipboardList className="w-8 h-8 text-slate-450 mx-auto mb-2" />
              <p className="font-black text-slate-800 text-sm animate-none">Tidak ada transaksi</p>
              <p className="text-xs text-slate-500 mt-1 font-bold">Daftar kosong untuk filter saat ini.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border-2 border-slate-900 divide-y-2 divide-slate-900 shadow-sm transition-all overflow-hidden">
              {filteredLoans.map((loan) => (
                <div
                  key={loan.id}
                  onClick={() => { setSelectedLoan(loan); setIsRejecting(false); setIsReturning(false); }}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-colors ${
                    selectedLoan?.id === loan.id ? 'bg-[#1E3A8A]/5' : 'hover:bg-slate-55'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-slate-950">{loan.kode}</span>
                      <span className="text-[10px] text-slate-450 font-medium">{loan.tgl_pengajuan}</span>
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-800 line-clamp-1">{loan.keperluan}</p>
                      <p className="text-[11px] font-medium text-slate-500">
                        Peminjam: <span className="font-bold text-slate-750">{loan.peminjam_nama}</span> ({loan.peminjam_kelas})
                      </p>
                    </div>

                    {/* Rent items display */}
                    <div className="flex flex-wrap gap-1.5">
                      {loan.items.map((it, idx) => {
                        const itemData = allBarang.find(b => b.id === it.barang_id);
                        return (
                          <span key={idx} className="bg-slate-50 border border-slate-150 text-[9px] font-bold px-1.5 py-0.5 text-slate-600 rounded">
                            {itemData ? itemData.nama : 'Barang'} (×{it.jumlah})
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Status tag / Actions indicator */}
                  <div className="flex items-center gap-2 sm:justify-end shrink-0" onClick={(e) => e.stopPropagation()}>
                    {loan.status === 'menunggu' ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setSelectedLoan(loan); setIsRejecting(false); setIsReturning(false); }}
                          className="bg-white hover:bg-slate-55 text-slate-800 border-2 border-slate-900 font-extrabold text-[10px] tracking-wider px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                        >
                          Lihat Detail
                        </button>
                        <button
                          onClick={() => handleApprove(loan.id)}
                          className="bg-[#0F766E] hover:bg-[#0d635c] text-white border-2 border-slate-950 font-extrabold text-[10px] tracking-wider px-3 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer"
                        >
                          Setujui
                        </button>
                      </div>
                    ) : (
                      <>
                        {loan.status === 'disetujui' && (
                          <span className="bg-[#CCFBF1] text-[#0F766E] text-[9.5px] font-extrabold px-2 py-1 rounded">BELUM DIAMBIL</span>
                        )}

                        {loan.status === 'dipinjam' && (
                          <span className="bg-blue-100 text-[#1E3A8A] text-[9.5px] font-extrabold px-2 py-1 rounded">DIPINJAM</span>
                        )}

                        {loan.status === 'terlambat' && (
                          <span className="bg-red-100 text-[#B91C1C] text-[9.5px] font-extrabold px-2 py-1 rounded">TERLAMBAT</span>
                        )}

                        {loan.status === 'selesai' && (
                          <span className="bg-slate-100 text-slate-600 text-[9.5px] font-extrabold px-2 py-1 rounded">KEMBALI</span>
                        )}

                        {loan.status === 'ditolak' && (
                          <span className="bg-red-50 text-red-650 text-[9.5px] font-extrabold px-2 py-1 rounded">DITOLAK</span>
                        )}
                      </>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Side Panel approval drawer actions (Requested in prompt: side panel) */}
        <div className="lg:col-span-1">
          {selectedLoan ? (
            <div className="bg-white rounded-xl border border-slate-205 shadow-md p-4 md:p-5 space-y-4 animate-fade-in sticky top-20">
              
              {/* Header drawer panel */}
              <div className="flex justify-between items-start pb-3.5 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Administrasi Pengajuan</span>
                  <span className="font-extrabold text-sm text-[#1E3A8A]">{selectedLoan.kode}</span>
                </div>
                <button
                  onClick={() => { setSelectedLoan(null); setIsRejecting(false); setIsReturning(false); }}
                  className="p-1 hover:bg-slate-100 rounded text-slate-450 hover:text-slate-800 transition"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Peminjam card */}
              <div className="space-y-3 text-xs">
                
                {/* User profiling details */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-150 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <UserIcon className="w-4 h-4 text-[#1E3A8A]" />
                    <span className="font-bold text-slate-800">{selectedLoan.peminjam_nama}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold">{selectedLoan.peminjam_kelas} • {selectedLoan.peminjam_role.toUpperCase()}</p>
                  <p className="text-[10.5px] text-slate-600 italic mt-1 leading-snug">"{selectedLoan.keperluan}"</p>
                </div>

                {/* Date ranges */}
                <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">Mulai Pinjam</span>
                    <span className="font-extrabold text-slate-700">{selectedLoan.tgl_mulai}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">Rencana Kembali</span>
                    <span className="font-extrabold text-slate-700">{selectedLoan.tgl_kembali_rencana}</span>
                  </div>
                </div>

                {/* Additional student comment */}
                {selectedLoan.catatan_peminjam && (
                  <div className="p-2 border border-slate-100 rounded text-[11px] text-slate-600 bg-amber-50/40">
                    <span className="font-bold block text-slate-500 text-[10px] uppercase">Catatan Pemohon:</span>
                    {selectedLoan.catatan_peminjam}
                  </div>
                )}

                {/* Items to borrow list */}
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider mb-1.5">Barang & Kuantitas:</span>
                  <div className="space-y-1.5">
                    {selectedLoan.items.map((it, idx) => {
                      const matchBarang = allBarang.find(b => b.id === it.barang_id);
                      return (
                        <div key={idx} className="flex justify-between items-center p-2 rounded bg-white border border-slate-150 text-[11px]">
                          <span className="font-bold text-slate-705">{matchBarang ? matchBarang.nama : 'Barang'}</span>
                          <span className="font-black text-[#1E3A8A]">×{it.jumlah} unit</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* CORE FLOW DECISIONS: PENDING APPROVAL VIEW */}
                {selectedLoan.status === 'menunggu' && (
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    
                    {isRejecting ? (
                      <div className="space-y-3">
                        <label className="block text-[11px] font-bold text-red-600 uppercase">Alasan Penolakan (Wajib):</label>
                        <textarea
                          rows={2}
                          placeholder="Masukkan alasan mengapa peminjaman ditolak..."
                          value={adminNote}
                          onChange={(e) => setAdminNote(e.target.value)}
                          className="w-full p-2 border border-red-200 focus:outline-[#B91C1C] rounded text-xs"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => setIsRejecting(false)}
                            className="flex-1 py-1.5 border border-slate-250 hover:bg-slate-50 text-slate-700 font-bold rounded text-xs cursor-pointer"
                          >
                            Batal
                          </button>
                          <button
                            onClick={() => handleReject(selectedLoan.id)}
                            className="flex-1 py-1.5 bg-[#B91C1C] hover:bg-[#B91C1C]/90 text-white font-bold rounded text-xs cursor-pointer"
                          >
                            Konfirmasi Tolak
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Note area for optionally passing pick-up timings etc. */}
                        <div className="space-y-1">
                          <label htmlFor="admin_note" className="block text-[10px] font-bold text-slate-400 uppercase">Catatan Disetujui/Tolak (Opsional):</label>
                          <input
                            id="admin_note"
                            type="text"
                            placeholder="Contoh: Ambil di gudang pukul 08:00 WIB"
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            className="w-full py-1.5 px-2 bg-slate-50 border border-slate-300 rounded text-xs font-semibold focus:outline-none"
                          />
                        </div>

                        {/* Fast actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => setIsRejecting(true)}
                            className="flex-1 py-2 bg-red-50 border border-red-200 text-[#B91C1C] font-bold rounded-lg hover:bg-red-100/50 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
                          >
                            <X className="w-4 h-4" />
                            Tolak
                          </button>
                          
                          <button
                            onClick={() => handleApprove(selectedLoan.id)}
                            className="flex-1 py-2 bg-[#1E3A8A] text-white font-bold rounded-lg hover:bg-slate-905 active:scale-95 transition-all shadow cursor-pointer flex items-center justify-center gap-1"
                          >
                            <Check className="w-4 h-4" />
                            Setujui
                          </button>
                        </div>
                      </>
                    )}

                  </div>
                )}

                {/* SECONDARY STATE: APPROVED -> AMBIL (Confirm deliver / handover) */}
                {selectedLoan.status === 'disetujui' && (
                  <div className="pt-3 border-t border-slate-100 bg-teal-50/40 p-3 rounded-lg border border-teal-100 space-y-2 text-center text-xs">
                    <p className="font-bold text-[#0F766E] flex items-center justify-center gap-1">
                      <Check className="w-4 h-4" />
                      Telah Disetujui TU
                    </p>
                    <p className="text-slate-500 text-[11px]">Siswa/Guru bersangkutan siap mengambil inventaris fisik dari lemari.</p>
                    <button
                      onClick={() => handleDeliverToPeminjam(selectedLoan.id)}
                      className="w-full py-2 bg-[#1E3A8A] text-white font-bold rounded hover:bg-slate-900 active:scale-95 transition-all shadow cursor-pointer mt-1"
                    >
                      Konfirmasi Barang Sudah Diambil
                    </button>
                  </div>
                )}

                {/* THIRD STATE: BORROWED -> RECORD RETURN (Catat Pengembalian) */}
                {(selectedLoan.status === 'dipinjam' || selectedLoan.status === 'terlambat') && (
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    
                    {isReturning ? (
                      <div className="space-y-3 bg-blue-50/40 p-3 rounded-lg border border-blue-150">
                        <span className="block text-[11px] font-bold text-[#1E3A8A] uppercase">Formulir Catat Pengembalian</span>
                        
                        {/* Select physical condition state */}
                        <div>
                          <label htmlFor="cond" className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Pilih Kondisi Fisik Barang:</label>
                          <select
                            id="cond"
                            value={returnCondition}
                            onChange={(e) => setReturnCondition(e.target.value as any)}
                            className="w-full bg-white border border-slate-300 py-1 px-2 rounded font-semibold text-xs text-slate-800"
                          >
                            <option value="baik">Kondisi Baik & Bersih</option>
                            <option value="rusak_ringan">Rusak Ringan (Bisa Diperbaiki)</option>
                            <option value="rusak_berat">Rusak Berat (Perlu Diganti)</option>
                            <option value="hilang">Hilang (Wajib Denda/Ganti)</option>
                          </select>
                        </div>

                        {/* Additional return text comments */}
                        <div>
                          <label htmlFor="ret_note" className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Catatan Tambahan & Denda:</label>
                          <textarea
                            id="ret_note"
                            rows={2}
                            placeholder="Tuliskan catatan detail kondisi..."
                            value={returnNote}
                            onChange={(e) => setReturnNote(e.target.value)}
                            className="w-full p-2 border border-slate-350 focus:outline-[#1E3A8A] rounded text-xs bg-white text-slate-800"
                          />
                        </div>

                        {/* Confirmation actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => setIsReturning(false)}
                            className="flex-1 py-1.5 border border-slate-200 bg-white text-slate-700 font-bold rounded text-xs cursor-pointer"
                          >
                            Kembali
                          </button>
                          <button
                            onClick={() => handleReturnConfirm(selectedLoan.id)}
                            className="flex-1 py-1.5 bg-[#0F766E] hover:bg-[#0F766E]/90 text-white font-bold rounded text-xs cursor-pointer"
                          >
                            Konfirmasi Kembali
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsReturning(true)}
                        className="w-full py-2.5 bg-[#0F766E] hover:bg-[#0F766E]/90 text-white font-bold rounded-lg shadow cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Catat Pengembalian Barang
                      </button>
                    )}

                  </div>
                )}

                {/* COMPLETED STATE VIEW */}
                {selectedLoan.status === 'selesai' && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                    <span className="font-bold text-slate-500 block text-[9px] uppercase">Rincian Pengembalian:</span>
                    <p className="font-bold text-slate-710">{selectedLoan.catatan_admin}</p>
                    <p className="text-[10px] text-slate-400 mt-1">Tanggal Dikembalikan: {selectedLoan.tgl_kembali_aktual}</p>
                  </div>
                )}

                {/* REJECTED STATE VIEW */}
                {selectedLoan.status === 'ditolak' && (
                  <div className="p-3 bg-red-50 border border-red-200 text-[#B91C1C] rounded-lg text-xs space-y-1">
                    <span className="font-bold text-[#B91C1C] block text-[9px] uppercase">Alasan Penolakan:</span>
                    <p className="font-bold italic text-slate-701">"{selectedLoan.catatan_admin}"</p>
                  </div>
                )}

              </div>

            </div>
          ) : (
            // Empty info
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center space-y-3">
              <div className="w-10 h-10 bg-slate-100 text-[#1E3A8A] rounded-full flex items-center justify-center mx-auto">
                <Info className="w-5 h-5" />
              </div>
              <p className="font-bold text-slate-800 text-xs">Pilih transaksi dari daftar di samping untuk meninjau secara rinci.</p>
              <p className="text-[10.5px] text-slate-400 leading-normal">Gunakan side panel untuk menyetujui, menolak, atau mencatat serah terima barang langsung tanpa pindah halaman.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
