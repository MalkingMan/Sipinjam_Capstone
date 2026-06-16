/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { User, Peminjaman, Barang } from '../types';
import { getPeminjaman, getBarang, savePeminjaman, saveBarang } from '../data/db';
import { Clock, Boxes, AlertTriangle, Database, Check, X, Info, User as UserIcon, MessageSquare, RefreshCw, ClipboardList } from 'lucide-react';

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

  const pendingCount = allLoans.filter((l) => l.status === 'menunggu_surat' || l.status === 'menunggu').length;
  const activeCount = allLoans.filter((l) => l.status === 'dipinjam').length;
  const overdueCount = allLoans.filter((l) => l.status === 'terlambat').length;
  const totalItemCount = allBarang.length;

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

  const handleApprove = (loanId: string) => {
    const loans = getPeminjaman();
    const barangList = getBarang();
    const targetLoanIndex = loans.findIndex((l) => l.id === loanId);

    if (targetLoanIndex === -1) return;
    const targetLoan = loans[targetLoanIndex];

    for (const item of targetLoan.items) {
      const match = barangList.find((b) => b.id === item.barang_id);
      if (!match || match.stok_tersedia < item.jumlah) {
        alert(`Gagal menyetujui: Stok ${match ? match.nama : 'Barang'} tidak mencukupi.`);
        return;
      }
    }

    const updatedBarang = barangList.map((b) => {
      const neededItem = targetLoan.items.find((it) => it.barang_id === b.id);
      if (neededItem) {
        return { ...b, stok_tersedia: Math.max(0, b.stok_tersedia - neededItem.jumlah) };
      }
      return b;
    });

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

  const handleDeliverToPeminjam = (loanId: string) => {
    const loans = getPeminjaman();
    const index = loans.findIndex(l => l.id === loanId);
    if (index === -1) return;
    loans[index].status = 'dipinjam';
    savePeminjaman(loans);
    setSelectedLoan(null);
    onRefresh();
  };

  const handleReturnConfirm = (loanId: string) => {
    const loans = getPeminjaman();
    const barangList = getBarang();
    const targetLoanIndex = loans.findIndex((l) => l.id === loanId);
    if (targetLoanIndex === -1) return;

    const targetLoan = loans[targetLoanIndex];

    const updatedBarang = barangList.map((b) => {
      const returnedItem = targetLoan.items.find((it) => it.barang_id === b.id);
      if (returnedItem) {
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

    loans[targetLoanIndex].status = 'selesai';
    loans[targetLoanIndex].tgl_kembali_aktual = new Date().toISOString().split('T')[0];
    loans[targetLoanIndex].catatan_admin = `Kondisi: ${returnCondition.toUpperCase()}. Catatan: ${returnNote.trim() || 'Kondisi baik.'}`;
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

      {/* Title */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Aktivitas Tata Usaha Sarpras</h2>
        <p className="text-sm text-gray-500 mt-0.5">Panel kendali administrator · SMA Negeri 1 Sentolo</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4" style={{ borderTop: '2px solid #F59E0B' }}>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Menunggu Approval</p>
          <div className="flex items-center justify-between mt-3">
            <span className={`text-3xl font-bold leading-none ${pendingCount > 0 ? 'text-[#B45309]' : 'text-gray-400'}`}>{pendingCount}</span>
            <span className={`p-2 rounded-lg ${pendingCount > 0 ? 'bg-amber-50 text-[#B45309]' : 'bg-gray-50 text-gray-400'}`}>
              <Clock className="w-4 h-4" />
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4" style={{ borderTop: '2px solid #1E3A8A' }}>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Aktif Dipinjam</p>
          <div className="flex items-center justify-between mt-3">
            <span className={`text-3xl font-bold leading-none ${activeCount > 0 ? 'text-[#1E3A8A]' : 'text-gray-400'}`}>{activeCount}</span>
            <span className={`p-2 rounded-lg ${activeCount > 0 ? 'bg-blue-50 text-[#1E3A8A]' : 'bg-gray-50 text-gray-400'}`}>
              <Boxes className="w-4 h-4" />
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4" style={{ borderTop: `2px solid ${overdueCount > 0 ? '#B91C1C' : '#E5E7EB'}` }}>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Terlambat Kembali</p>
          <div className="flex items-center justify-between mt-3">
            <span className={`text-3xl font-bold leading-none ${overdueCount > 0 ? 'text-[#B91C1C]' : 'text-gray-400'}`}>{overdueCount}</span>
            <span className={`p-2 rounded-lg ${overdueCount > 0 ? 'bg-red-50 text-[#B91C1C]' : 'bg-gray-50 text-gray-400'}`}>
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4" style={{ borderTop: '2px solid #0F766E' }}>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Total Ragam Barang</p>
          <div className="flex items-center justify-between mt-3">
            <span className={`text-3xl font-bold leading-none ${totalItemCount > 0 ? 'text-[#0F766E]' : 'text-gray-400'}`}>{totalItemCount}</span>
            <span className={`p-2 rounded-lg ${totalItemCount > 0 ? 'bg-teal-50 text-[#0F766E]' : 'bg-gray-50 text-gray-400'}`}>
              <Database className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Left: Loans List */}
        <div className="lg:col-span-2 space-y-4">

          {/* Tab bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2 rounded-xl border border-gray-200">
            <span className="text-xs font-medium text-gray-500 px-2">Transaksi:</span>
            <div className="flex gap-1 overflow-x-auto">
              <button
                onClick={() => { setActiveListTab('menunggu'); setSelectedLoan(null); }}
                className={`text-xs font-medium py-1.5 px-3 rounded-lg cursor-pointer transition-colors ${
                  activeListTab === 'menunggu' ? 'bg-[#1E3A8A] text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Menunggu ({pendingCount})
              </button>
              <button
                onClick={() => { setActiveListTab('dipinjam'); setSelectedLoan(null); }}
                className={`text-xs font-medium py-1.5 px-3 rounded-lg cursor-pointer transition-colors ${
                  activeListTab === 'dipinjam' ? 'bg-[#1E3A8A] text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Dipinjam/Terlambat ({activeCount + overdueCount})
              </button>
              <button
                onClick={() => { setActiveListTab('selesai'); setSelectedLoan(null); }}
                className={`text-xs font-medium py-1.5 px-3 rounded-lg cursor-pointer transition-colors ${
                  activeListTab === 'selesai' ? 'bg-[#1E3A8A] text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Selesai/Ditolak
              </button>
            </div>
          </div>

          {/* List */}
          {filteredLoans.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                <ClipboardList className="w-5 h-5" />
              </div>
              <p className="font-semibold text-gray-900 text-sm">Tidak ada transaksi</p>
              <p className="text-xs text-gray-400 mt-1">Daftar kosong untuk filter saat ini.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {filteredLoans.map((loan) => (
                <div
                  key={loan.id}
                  onClick={() => { setSelectedLoan(loan); setIsRejecting(false); setIsReturning(false); }}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${
                    selectedLoan?.id === loan.id ? 'bg-blue-50/40' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-gray-900">{loan.kode}</span>
                      <span className="text-xs text-gray-400">{loan.tgl_pengajuan}</span>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700 line-clamp-1">{loan.keperluan}</p>
                      <p className="text-xs text-gray-400">
                        {loan.peminjam_nama} · {loan.peminjam_kelas}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {loan.items.map((it, idx) => {
                        const itemData = allBarang.find(b => b.id === it.barang_id);
                        return (
                          <span key={idx} className="bg-gray-100 text-gray-600 border border-gray-200 text-xs px-1.5 py-0.5 rounded">
                            {itemData ? itemData.nama : 'Barang'} (×{it.jumlah})
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:justify-end shrink-0" onClick={(e) => e.stopPropagation()}>
                    {loan.status === 'menunggu' ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setSelectedLoan(loan); setIsRejecting(false); setIsReturning(false); }}
                          className="bg-white border border-gray-200 text-gray-700 font-medium text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer hover:bg-gray-50"
                        >
                          Detail
                        </button>
                        <button
                          onClick={() => handleApprove(loan.id)}
                          className="bg-[#0F766E] hover:bg-[#0d635c] text-white font-medium text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                        >
                          Setujui
                        </button>
                      </div>
                    ) : (
                      <>
                        {loan.status === 'menunggu_surat' && (
                          <span className="bg-amber-50 text-amber-700 text-xs font-medium px-2.5 py-0.5 rounded-full">Menunggu Surat</span>
                        )}
                        {loan.status === 'disetujui' && (
                          <span className="bg-teal-50 text-teal-700 text-xs font-medium px-2.5 py-0.5 rounded-full">Belum Diambil</span>
                        )}
                        {loan.status === 'dipinjam' && (
                          <span className="bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full">Dipinjam</span>
                        )}
                        {loan.status === 'terlambat' && (
                          <span className="bg-red-50 text-red-700 text-xs font-medium px-2.5 py-0.5 rounded-full">Terlambat</span>
                        )}
                        {loan.status === 'selesai' && (
                          <span className="bg-gray-100 text-gray-500 text-xs font-medium px-2.5 py-0.5 rounded-full">Kembali</span>
                        )}
                        {loan.status === 'ditolak' && (
                          <span className="bg-red-50 text-red-600 text-xs font-medium px-2.5 py-0.5 rounded-full">Ditolak</span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Side Panel */}
        <div className="lg:col-span-1">
          {selectedLoan ? (
            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4 sticky top-20 animate-fade-in">

              {/* Panel Header */}
              <div className="flex justify-between items-start pb-3 border-b border-gray-100">
                <div>
                  <span className="text-xs font-medium text-gray-400 block">Administrasi Pengajuan</span>
                  <span className="font-semibold text-sm text-[#1E3A8A]">{selectedLoan.kode}</span>
                </div>
                <button
                  onClick={() => { setSelectedLoan(null); setIsRejecting(false); setIsReturning(false); }}
                  className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-3 text-xs">
                {/* User */}
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <UserIcon className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-800">{selectedLoan.peminjam_nama}</span>
                  </div>
                  <p className="text-xs text-gray-400">{selectedLoan.peminjam_kelas} · {selectedLoan.peminjam_role.toUpperCase()}</p>
                  <p className="text-xs text-gray-600 mt-1 leading-snug">"{selectedLoan.keperluan}"</p>
                </div>

                {/* Dates */}
                <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                  <div>
                    <span className="text-[10px] text-gray-400 block font-medium uppercase">Mulai Pinjam</span>
                    <span className="font-semibold text-gray-700">{selectedLoan.tgl_mulai}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block font-medium uppercase">Rencana Kembali</span>
                    <span className="font-semibold text-gray-700">{selectedLoan.tgl_kembali_rencana}</span>
                  </div>
                </div>

                {/* Note */}
                {selectedLoan.catatan_peminjam && (
                  <div className="p-2 border border-gray-100 rounded text-xs text-gray-600 bg-amber-50/40">
                    <span className="font-medium block text-gray-500 mb-0.5">Catatan Pemohon:</span>
                    {selectedLoan.catatan_peminjam}
                  </div>
                )}

                {/* Items */}
                <div>
                  <span className="text-xs text-gray-400 font-medium block uppercase tracking-wide mb-1.5">Barang & Kuantitas:</span>
                  <div className="space-y-1.5">
                    {selectedLoan.items.map((it, idx) => {
                      const matchBarang = allBarang.find(b => b.id === it.barang_id);
                      return (
                        <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-gray-50 border border-gray-100">
                          <span className="font-medium text-gray-700">{matchBarang ? matchBarang.nama : 'Barang'}</span>
                          <span className="font-semibold text-[#1E3A8A]">×{it.jumlah} unit</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* PENDING APPROVAL */}
                {selectedLoan.status === 'menunggu' && (
                  <div className="pt-3 border-t border-gray-100 space-y-3">
                    {isRejecting ? (
                      <div className="space-y-3">
                        <label className="block text-xs font-medium text-red-600">Alasan Penolakan (Wajib):</label>
                        <textarea
                          rows={2}
                          placeholder="Masukkan alasan mengapa peminjaman ditolak..."
                          value={adminNote}
                          onChange={(e) => setAdminNote(e.target.value)}
                          className="w-full p-2 border border-red-200 focus:outline-none focus:ring-1 focus:ring-red-400 rounded-lg text-xs text-gray-800"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => setIsRejecting(false)}
                            className="flex-1 py-1.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg text-xs cursor-pointer"
                          >
                            Batal
                          </button>
                          <button
                            onClick={() => handleReject(selectedLoan.id)}
                            className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-xs cursor-pointer"
                          >
                            Konfirmasi Tolak
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-1">
                          <label htmlFor="admin_note" className="block text-xs font-medium text-gray-400 uppercase tracking-wide">Catatan (Opsional):</label>
                          <input
                            id="admin_note"
                            type="text"
                            placeholder="Contoh: Ambil di gudang pukul 08:00 WIB"
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            className="w-full py-1.5 px-3 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setIsRejecting(true)}
                            className="flex-1 py-2 bg-white border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-all cursor-pointer flex items-center justify-center gap-1 text-xs"
                          >
                            <X className="w-3.5 h-3.5" />
                            Tolak
                          </button>
                          <button
                            onClick={() => handleApprove(selectedLoan.id)}
                            className="flex-1 py-2 bg-[#0F766E] text-white font-medium rounded-lg hover:bg-[#0d635c] transition-all cursor-pointer flex items-center justify-center gap-1 text-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Setujui
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* APPROVED → CONFIRM PICKUP */}
                {selectedLoan.status === 'disetujui' && (
                  <div className="pt-3 border-t border-gray-100 bg-teal-50 p-3 rounded-lg border border-teal-100 space-y-2 text-center text-xs">
                    <p className="font-medium text-teal-700 flex items-center justify-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Telah Disetujui TU
                    </p>
                    <p className="text-gray-500">Siswa/Guru bersangkutan siap mengambil inventaris fisik.</p>
                    <button
                      onClick={() => handleDeliverToPeminjam(selectedLoan.id)}
                      className="w-full py-2 bg-[#1E3A8A] text-white font-medium rounded-lg hover:bg-[#1e40af] transition cursor-pointer mt-1 text-xs"
                    >
                      Konfirmasi Barang Sudah Diambil
                    </button>
                  </div>
                )}

                {/* BORROWED → RETURN */}
                {(selectedLoan.status === 'dipinjam' || selectedLoan.status === 'terlambat') && (
                  <div className="pt-3 border-t border-gray-100 space-y-3">
                    {isReturning ? (
                      <div className="space-y-3 bg-blue-50/40 p-3 rounded-lg border border-blue-100">
                        <span className="block text-xs font-medium text-[#1E3A8A] uppercase tracking-wide">Formulir Catat Pengembalian</span>
                        <div>
                          <label htmlFor="cond" className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Kondisi Fisik Barang:</label>
                          <select
                            id="cond"
                            value={returnCondition}
                            onChange={(e) => setReturnCondition(e.target.value as any)}
                            className="w-full bg-white border border-gray-200 py-1.5 px-2 rounded-lg font-medium text-xs text-gray-800"
                          >
                            <option value="baik">Kondisi Baik & Bersih</option>
                            <option value="rusak_ringan">Rusak Ringan (Bisa Diperbaiki)</option>
                            <option value="rusak_berat">Rusak Berat (Perlu Diganti)</option>
                            <option value="hilang">Hilang (Wajib Denda/Ganti)</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="ret_note" className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Catatan Tambahan:</label>
                          <textarea
                            id="ret_note"
                            rows={2}
                            placeholder="Tuliskan catatan detail kondisi..."
                            value={returnNote}
                            onChange={(e) => setReturnNote(e.target.value)}
                            className="w-full p-2 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded-lg text-xs bg-white text-gray-800"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setIsReturning(false)}
                            className="flex-1 py-1.5 border border-gray-200 bg-white text-gray-700 font-medium rounded-lg text-xs cursor-pointer"
                          >
                            Kembali
                          </button>
                          <button
                            onClick={() => handleReturnConfirm(selectedLoan.id)}
                            className="flex-1 py-1.5 bg-[#0F766E] hover:bg-[#0d635c] text-white font-medium rounded-lg text-xs cursor-pointer"
                          >
                            Konfirmasi Kembali
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsReturning(true)}
                        className="w-full py-2.5 bg-[#0F766E] hover:bg-[#0d635c] text-white font-medium rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1.5 text-xs"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Catat Pengembalian Barang
                      </button>
                    )}
                  </div>
                )}

                {/* COMPLETED */}
                {selectedLoan.status === 'selesai' && (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs space-y-1">
                    <span className="font-medium text-gray-500 block uppercase tracking-wide text-[10px]">Rincian Pengembalian:</span>
                    <p className="font-medium text-gray-700">{selectedLoan.catatan_admin}</p>
                    <p className="text-xs text-gray-400 mt-1">Tanggal Dikembalikan: {selectedLoan.tgl_kembali_aktual}</p>
                  </div>
                )}

                {/* REJECTED */}
                {selectedLoan.status === 'ditolak' && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-lg text-xs space-y-1">
                    <span className="font-medium block text-[10px] uppercase tracking-wide">Alasan Penolakan:</span>
                    <p className="font-medium text-gray-700">"{selectedLoan.catatan_admin}"</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-dashed border-gray-200 p-8 text-center space-y-3">
              <div className="w-10 h-10 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto">
                <Info className="w-5 h-5" />
              </div>
              <p className="font-semibold text-gray-900 text-xs">Pilih transaksi dari daftar</p>
              <p className="text-xs text-gray-400 leading-normal">Gunakan side panel untuk menyetujui, menolak, atau mencatat serah terima barang.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
