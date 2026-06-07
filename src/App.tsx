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
import CetakTemplateKosongView from "./components/CetakTemplateKosongView";
import CetakSuratView from "./components/CetakSuratView";
import DaftarPinjamSheet from "./components/DaftarPinjamSheet";
import { getBarang } from "./data/db";
import { X, Calendar, ClipboardList, Info, HelpCircle, Trash2 } from "lucide-react";

export default function App() {
  const [currentUser, setUser] = useState<User | null>(getCurrentUser());
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [preSelectedBarangId, setPreSelectedBarangId] = useState<string | null>(null);
  const [selectedPJMDetail, setSelectedPJMDetail] = useState<Peminjaman | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  
  // Daftar Pinjam State
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

  // Sync state if user role differs
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === "admin") {
        setActiveTab("dashboard");
      } else {
        setActiveTab("dashboard");
      }
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

  // Callback to start borrowing an item from the catalog
  const handleStartBorrow = (barangId: string) => {
    setPreSelectedBarangId(barangId);
    setActiveTab("form_peminjaman");
  };

  const triggerForceRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // If user is not logged in, render the login view directly
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-[#1E3A8A]/10 selection:text-[#1E3A8A]">
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        daftarPinjamCount={totalDaftarPinjamCount}
        onOpenDaftarPinjam={() => setIsDaftarPinjamOpen(true)}
      />

      <main className="flex-1 pb-16 md:pb-6">
        {/* Router switches */}
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

        {activeTab.startsWith("cetak_surat_") && (
          <CetakSuratView 
            loanId={activeTab.replace("cetak_surat_", "")}
            onBack={() => setActiveTab("peminjaman_saya")}
          />
        )}

        {activeTab === "admin_inventaris" && currentUser.role === "admin" && (
          <AdminInventaris
            key={refreshKey}
            currentUser={currentUser}
            onRefresh={triggerForceRefresh}
          />
        )}

        {activeTab === "admin_pengaturan" && currentUser.role === "admin" && (
          <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            <AdminPengaturanSurat />
          </div>
        )}
      </main>

      {/* GLOBAL DETAILS DIALOG WINDOW FOR TRANS_BOOKINGS INFOS */}
      <DaftarPinjamSheet 
        isOpen={isDaftarPinjamOpen}
        onClose={() => setIsDaftarPinjamOpen(false)}
        items={daftarPinjam}
        onUpdateQty={handleUpdateDaftarPinjam}
        onProceed={() => setActiveTab("form_peminjaman")}
      />

      {selectedPJMDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border-2 border-slate-900 w-full max-w-md overflow-hidden flex flex-col shadow-2xl animate-scale-up">
            {/* Header popup window */}
            <div className="px-5 py-3.5 border-b-2 border-slate-900 flex justify-between items-center text-[#1E3A8A] bg-slate-50">
              <div className="flex items-center gap-1.5">
                <ClipboardList className="w-5 h-5 stroke-[2.5]" />
                <span className="font-black text-xs uppercase tracking-wider italic">
                  Rincian Transaksi Peminjaman
                </span>
              </div>
              <button
                onClick={() => setSelectedPJMDetail(null)}
                className="text-slate-500 hover:text-slate-900 transition cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[3]" />
              </button>
            </div>

            {/* Content list popup */}
            <div className="p-5 text-xs text-slate-700 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Profile Block */}
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-slate-100/50 p-2.5 rounded border-2 border-slate-900">
                  <div>
                    <span className="text-[9px] text-slate-450 font-black block tracking-wider leading-none">
                      Nomor Kode Pinjam:
                    </span>
                    <span className="font-black text-sm text-[#1E3A8A] mt-1 block">
                      {selectedPJMDetail.kode}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-455 font-black block tracking-wider leading-none">
                      Status Pengajuan:
                    </span>
                    <span
                      className={`text-[10px] font-black block mt-1.5 ${
                        selectedPJMDetail.status === "menunggu"
                          ? "text-[#B45309]"
                          : selectedPJMDetail.status === "disetujui"
                            ? "text-[#0F766E]"
                            : selectedPJMDetail.status === "dipinjam"
                              ? "text-[#1E3A8A]"
                              : "text-slate-650"
                      }`}
                    >
                      {selectedPJMDetail.status === "menunggu"
                        ? "Menunggu Verifikasi"
                        : selectedPJMDetail.status === "disetujui"
                          ? "Disetujui"
                          : selectedPJMDetail.status === "dipinjam"
                            ? "Dipinjam"
                            : selectedPJMDetail.status === "selesai"
                              ? "Selesai"
                              : selectedPJMDetail.status === "terlambat"
                                ? "Terlambat"
                                : "Ditolak"}
                    </span>
                  </div>
                </div>

                <div className="border-2 border-slate-900 rounded p-2.5 space-y-1 bg-white">
                  <p className="font-bold text-slate-800">
                    Pemohon: {selectedPJMDetail.peminjam_nama}
                  </p>
                  <p className="text-slate-500 text-[10.5px] font-semibold">
                    {selectedPJMDetail.peminjam_kelas} •{" "}
                    {selectedPJMDetail.peminjam_role.toUpperCase()}
                  </p>
                  <p className="text-slate-600 mt-1.5 leading-snug font-bold italic">
                    "{selectedPJMDetail.keperluan}"
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 font-extrabold tracking-wide block">
                  Inventaris yang Dipinjam:
                </span>
                {selectedPJMDetail.items.map((it, idx) => {
                  const match = allBarang.find((b) => b.id === it.barang_id);
                  return (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-2 rounded bg-slate-50 border-2 border-slate-900"
                    >
                      <span className="font-bold text-slate-800">
                        {match ? match.nama : "Barang"}
                      </span>
                      <span className="font-black text-[#1E3A8A]">
                        ×{it.jumlah} Unit
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Borrow Timings */}
              <div className="grid grid-cols-2 gap-3 pb-1">
                <div className="p-2 border-2 border-slate-900 rounded bg-[#f8fafc]">
                  <span className="text-[9px] text-slate-400 block tracking-wider font-black">
                    Ambil Barang
                  </span>
                  <span className="font-black text-slate-800 block mt-0.5">
                    {selectedPJMDetail.tgl_mulai}
                  </span>
                </div>
                <div className="p-2 border-2 border-slate-900 rounded bg-[#f8fafc]">
                  <span className="text-[9px] text-slate-400 block tracking-wider font-black">
                    Harus Kembali
                  </span>
                  <span className="font-black text-slate-800 block mt-0.5">
                    {selectedPJMDetail.tgl_kembali_rencana}
                  </span>
                </div>
              </div>

              {/* Additional notes alerts */}
              {selectedPJMDetail.catatan_peminjam && (
                <div className="p-2.5 bg-white rounded border-2 border-slate-900">
                  <span className="font-extrabold text-slate-500 block text-[9.5px] tracking-wider">
                    Catatan Tambahan Siswa:
                  </span>
                  <p className="text-slate-600 mt-0.5 leading-snug font-medium">
                    {selectedPJMDetail.catatan_peminjam}
                  </p>
                </div>
              )}

              {selectedPJMDetail.catatan_admin && (
                <div className="p-2.5 bg-blue-50/40 text-slate-800 rounded border-2 border-slate-900 space-y-1">
                  <span className="font-black text-[#1E3A8A] block text-[9.5px] tracking-wider">
                    Review & Catatan Admin TU:
                  </span>
                  <p className="text-slate-700 leading-snug font-bold">
                    "{selectedPJMDetail.catatan_admin}"
                  </p>
                </div>
              )}
            </div>

            {/* Footer lock */}
            <div className="p-4 bg-slate-50 border-t-2 border-slate-900 flex justify-end">
              <button
                onClick={() => setSelectedPJMDetail(null)}
                className="px-4 py-2 bg-white hover:bg-slate-100 border-2 border-slate-900 text-slate-800 text-[10px] font-black tracking-wider rounded-lg transition-all cursor-pointer"
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
