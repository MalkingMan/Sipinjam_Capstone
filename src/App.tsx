/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { User, Peminjaman, DetailPeminjaman } from "./types";
import { getCurrentUser, setCurrentUser, getPeminjaman, getDaftarPinjam, saveDaftarPinjam, clearDaftarPinjam } from "./data/db";
import LoginView from "./components/LoginView";
import Navbar from "./components/Navbar";
import PeminjamDashboard from "./components/PeminjamDashboard";
import KatalogBarang from "./components/KatalogBarang";
import FormPeminjaman from "./components/FormPeminjaman";
import PeminjamanSaya from "./components/PeminjamanSaya";
import AdminDashboard from "./components/AdminDashboard";
import AdminInventaris from "./components/AdminInventaris";
import AdminPengaturanSurat from "./components/AdminPengaturanSurat";
import AdminRiwayatPeminjaman from "./components/AdminRiwayatPeminjaman";
import CetakTemplateKosongView from "./components/CetakTemplateKosongView";
import CetakSuratView from "./components/CetakSuratView";
import DaftarPinjamSheet from "./components/DaftarPinjamSheet";
import { getBarang } from "./data/db";
import { X, ClipboardList } from "lucide-react";

export default function App() {
  const [currentUser, setUser] = useState<User | null>(getCurrentUser());
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [preSelectedBarangId, setPreSelectedBarangId] = useState<string | null>(null);
  const [selectedPJMDetail, setSelectedPJMDetail] = useState<Peminjaman | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const [daftarPinjam, setDaftarPinjam] = useState<DetailPeminjaman[]>(getDaftarPinjam());
  const [isDaftarPinjamOpen, setIsDaftarPinjamOpen] = useState(false);

  useEffect(() => {
    saveDaftarPinjam(daftarPinjam);
  }, [daftarPinjam]);

  const handleUpdateDaftarPinjam = (barangId: string, jumlah: number) => {
    setDaftarPinjam((prev) => {
      const exist = prev.find((p) => p.barang_id === barangId);
      if (exist) {
        if (jumlah <= 0) return prev.filter((p) => p.barang_id !== barangId);
        return prev.map((p) => p.barang_id === barangId ? { ...p, jumlah } : p);
      }
      if (jumlah <= 0) return prev;
      return [...prev, { barang_id: barangId, jumlah }];
    });
  };

  const handleRemoveFromDaftar = (barangId: string) => {
    setDaftarPinjam((prev) => prev.filter((p) => p.barang_id !== barangId));
  };

  useEffect(() => {
    if (currentUser) {
      setActiveTab("dashboard");
    }
  }, [currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUser(null);
    setSelectedPJMDetail(null);
    setPreSelectedBarangId(null);
    setActiveTab("dashboard");
  };

  const handleStartBorrow = (barangId: string) => {
    setPreSelectedBarangId(barangId);
    setActiveTab("form_peminjaman");
  };

  const triggerForceRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLogin} />;
  }

  const allBarang = getBarang();

  if (activeTab.startsWith("cetak_surat_")) {
    const loanId = activeTab.replace("cetak_surat_", "");
    return (
      <CetakSuratView
        loanId={loanId}
        onBack={() => setActiveTab("peminjaman_saya")}
      />
    );
  }

  const totalDaftarPinjamCount = daftarPinjam.reduce((acc, curr) => acc + curr.jumlah, 0);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'menunggu': return 'Menunggu Verifikasi';
      case 'menunggu_surat': return 'Menunggu Surat Fisik';
      case 'disetujui': return 'Disetujui';
      case 'dipinjam': return 'Dipinjam';
      case 'selesai': return 'Selesai';
      case 'terlambat': return 'Terlambat';
      case 'ditolak': return 'Ditolak';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'menunggu':
      case 'menunggu_surat':
        return 'text-amber-700';
      case 'disetujui':
        return 'text-teal-700';
      case 'dipinjam':
        return 'text-blue-700';
      case 'terlambat':
      case 'ditolak':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-[#1E3A8A]/10 selection:text-[#1E3A8A]">
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        daftarPinjamCount={totalDaftarPinjamCount}
        onOpenDaftarPinjam={() => setIsDaftarPinjamOpen(true)}
      />

      <main className="flex-1 pb-16 md:pb-6">
        {activeTab === "dashboard" && currentUser.role !== "admin" && (
          <PeminjamDashboard
            key={refreshKey}
            currentUser={currentUser}
            onNavigate={setActiveTab}
            onSelectPeminjaman={setSelectedPJMDetail}
          />
        )}

        {activeTab === "dashboard" && currentUser.role === "admin" && (
          <AdminDashboard
            key={refreshKey}
            currentUser={currentUser}
            onRefresh={triggerForceRefresh}
          />
        )}

        {(activeTab === "katalog" || activeTab.startsWith("barang_")) && (
          <KatalogBarang
            daftarPinjam={daftarPinjam}
            onStartBorrow={handleStartBorrow}
            onAddDaftarPinjam={handleUpdateDaftarPinjam}
            isAdminPreview={currentUser.role === "admin"}
          />
        )}

        {activeTab === "form_peminjaman" && (
          <FormPeminjaman
            currentUser={currentUser}
            daftarPinjam={daftarPinjam}
            clearDaftarPinjam={() => setDaftarPinjam([])}
            onSuccess={() => {
              setActiveTab("peminjaman_saya");
              triggerForceRefresh();
            }}
            onCancel={() => {
              setActiveTab("katalog");
            }}
          />
        )}

        {activeTab === "peminjaman_saya" && (
          <PeminjamanSaya
            key={refreshKey}
            currentUser={currentUser}
            onSelectPeminjaman={setSelectedPJMDetail}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === "cetak_template" && (
          <CetakTemplateKosongView onBack={() => setActiveTab("peminjaman_saya")} />
        )}

        {activeTab === "admin_inventaris" && currentUser.role === "admin" && (
          <AdminInventaris
            key={refreshKey}
            currentUser={currentUser}
            onRefresh={triggerForceRefresh}
          />
        )}

        {activeTab === "admin_pengaturan" && currentUser.role === "admin" && (
          <AdminPengaturanSurat />
        )}

        {activeTab === "admin_riwayat" && currentUser.role === "admin" && (
          <AdminRiwayatPeminjaman />
        )}
      </main>

      {/* Daftar Pinjam Sheet */}
      <DaftarPinjamSheet
        isOpen={isDaftarPinjamOpen}
        onClose={() => setIsDaftarPinjamOpen(false)}
        items={daftarPinjam}
        onUpdateQty={handleUpdateDaftarPinjam}
        onProceed={() => setActiveTab("form_peminjaman")}
      />

      {/* Loan Detail Modal */}
      {selectedPJMDetail && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-gray-200 w-full max-w-md overflow-hidden flex flex-col shadow-lg animate-scale-up">

            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-2 text-[#1E3A8A]">
                <ClipboardList className="w-4 h-4" />
                <span className="font-semibold text-sm text-gray-900">Rincian Transaksi Peminjaman</span>
              </div>
              <button
                onClick={() => setSelectedPJMDetail(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 text-sm text-gray-700 space-y-4 max-h-[70vh] overflow-y-auto">

              {/* Code + Status */}
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div>
                  <span className="text-xs text-gray-400 font-medium block">Kode Transaksi</span>
                  <span className="font-semibold text-[#1E3A8A] text-base">{selectedPJMDetail.kode}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400 font-medium block">Status</span>
                  <span className={`text-xs font-semibold block mt-0.5 ${getStatusColor(selectedPJMDetail.status)}`}>
                    {getStatusLabel(selectedPJMDetail.status)}
                  </span>
                </div>
              </div>

              {/* Peminjam */}
              <div className="border border-gray-100 rounded-lg p-3 space-y-1 bg-white">
                <p className="font-medium text-gray-900">
                  Pemohon: {selectedPJMDetail.peminjam_nama}
                </p>
                <p className="text-xs text-gray-400">
                  {selectedPJMDetail.peminjam_kelas} · {selectedPJMDetail.peminjam_role.toUpperCase()}
                </p>
                <p className="text-xs text-gray-600 mt-1.5 leading-snug">
                  "{selectedPJMDetail.keperluan}"
                </p>
              </div>

              {/* Items */}
              <div className="space-y-1.5">
                <span className="text-xs text-gray-400 font-medium block uppercase tracking-wide">Inventaris yang Dipinjam:</span>
                {selectedPJMDetail.items.map((it, idx) => {
                  const match = allBarang.find((b) => b.id === it.barang_id);
                  return (
                    <div key={idx} className="flex justify-between items-center p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                      <span className="font-medium text-gray-800">{match ? match.nama : "Barang"}</span>
                      <span className="font-semibold text-[#1E3A8A]">×{it.jumlah} Unit</span>
                    </div>
                  );
                })}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 border border-gray-100 rounded-lg bg-gray-50">
                  <span className="text-xs text-gray-400 block font-medium uppercase tracking-wide">Ambil Barang</span>
                  <span className="font-semibold text-gray-800 block mt-0.5 text-sm">{selectedPJMDetail.tgl_mulai}</span>
                </div>
                <div className="p-2.5 border border-gray-100 rounded-lg bg-gray-50">
                  <span className="text-xs text-gray-400 block font-medium uppercase tracking-wide">Harus Kembali</span>
                  <span className="font-semibold text-gray-800 block mt-0.5 text-sm">{selectedPJMDetail.tgl_kembali_rencana}</span>
                </div>
              </div>

              {/* Notes */}
              {selectedPJMDetail.catatan_peminjam && (
                <div className="p-3 bg-white rounded-lg border border-gray-100">
                  <span className="font-medium text-gray-400 block text-xs uppercase tracking-wide mb-1">Catatan Tambahan Siswa:</span>
                  <p className="text-gray-600 text-sm leading-snug">{selectedPJMDetail.catatan_peminjam}</p>
                </div>
              )}

              {selectedPJMDetail.catatan_admin && (
                <div className="p-3 bg-blue-50/40 text-gray-800 rounded-lg border border-blue-100 space-y-1">
                  <span className="font-medium text-[#1E3A8A] block text-xs uppercase tracking-wide">Review & Catatan Admin TU:</span>
                  <p className="text-gray-600 text-sm leading-snug">"{selectedPJMDetail.catatan_admin}"</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedPJMDetail(null)}
                className="px-4 py-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
