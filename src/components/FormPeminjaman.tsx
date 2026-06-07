/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  User,
  Barang,
  Peminjaman,
  DetailPeminjaman,
  KategoriKegiatan,
} from "../types";
import {
  getBarang,
  getPeminjaman,
  savePeminjaman,
  saveBarang,
} from "../data/db";
import {
  ShoppingBag,
  Calendar,
  ListPlus,
  Trash2,
  ShieldAlert,
  ArrowLeft,
  Send,
  CheckCircle,
} from "lucide-react";

interface FormPeminjamanProps {
  currentUser: User;
  preSelectedBarangId: string | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function FormPeminjaman({
  currentUser,
  preSelectedBarangId,
  onSuccess,
  onCancel,
}: FormPeminjamanProps) {
  const allBarang = getBarang().filter((b) => b.status === "aktif");

  // Basket state: [{ barang_id: string, jumlah: number }]
  const [basket, setBasket] = useState<DetailPeminjaman[]>([]);
  const [tglMulai, setTglMulai] = useState("2026-06-06");
  const [tglKembali, setTglKembali] = useState("2026-06-08");
  const [keperluan, setKeperluan] = useState("");
  const [kategoriKegiatan, setKategoriKegiatan] =
    useState<KategoriKegiatan>("osis");
  const [catatan, setCatatan] = useState("");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");

  // States for Surat
  const [suratNamaKegiatan, setSuratNamaKegiatan] = useState("");
  const [suratHari, setSuratHari] = useState("Senin");
  const [suratTanggal, setSuratTanggal] = useState("2026-06-06");
  const [suratWaktuMulai, setSuratWaktuMulai] = useState("07:00");
  const [suratWaktuSelesai, setSuratWaktuSelesai] = useState("15:30");
  const [suratTempat, setSuratTempat] = useState("SMAN 1 Sentolo");
  const [suratKetua, setSuratKetua] = useState("");
  const [suratNisKetua, setSuratNisKetua] = useState("");

  // Hydrate basket with pre-selected item from Catalog
  useEffect(() => {
    if (preSelectedBarangId) {
      const match = allBarang.find((b) => b.id === preSelectedBarangId);
      if (match) {
        setBasket([{ barang_id: preSelectedBarangId, jumlah: 1 }]);
      }
    } else if (allBarang.length > 0) {
      // Default to first available item if none selected
      setBasket([{ barang_id: allBarang[0].id, jumlah: 1 }]);
    }
  }, [preSelectedBarangId]);

  // Reactive duration warnings
  useEffect(() => {
    if (tglMulai && tglKembali) {
      const start = new Date(tglMulai);
      const end = new Date(tglKembali);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (end < start) {
        setErrorMsg(
          "Tanggal pengembalian rencana tidak boleh sebelum tanggal mulai.",
        );
        setWarningMsg(null);
      } else {
        setErrorMsg(null);
        if (diffDays > 7) {
          setWarningMsg(
            "Perhatian: Durasi peminjaman melebihi batas standar (7 hari). Silakan cantumkan persetujuan wali kelas / panitia pembina pada kolom catatan.",
          );
        } else {
          setWarningMsg(null);
        }
      }
    }
  }, [tglMulai, tglKembali]);

  // Handling multi-item addition
  const handleAddItemToBasket = () => {
    // Find first item that is NOT in the basket yet
    const nextItem = allBarang.find(
      (b) => b.stok_tersedia > 0 && !basket.some((it) => it.barang_id === b.id),
    );
    if (nextItem) {
      setBasket([...basket, { barang_id: nextItem.id, jumlah: 1 }]);
    } else {
      alert(
        "Semua inventaris yang tersedia sudah dimasukkan ke daftar pinjaman Anda.",
      );
    }
  };

  const handleRemoveItem = (index: number) => {
    const updated = [...basket];
    updated.splice(index, 1);
    setBasket(updated);
  };

  const handleItemSelect = (index: number, newId: string) => {
    // Check duplication
    if (basket.some((it, idx) => idx !== index && it.barang_id === newId)) {
      alert("Barang ini sudah ada dalam daftar keranjang Anda.");
      return;
    }
    const updated = [...basket];
    updated[index].barang_id = newId;
    updated[index].jumlah = 1; // reset quantity check
    setBasket(updated);
  };

  const handleQtyChange = (index: number, val: number) => {
    const updated = [...basket];
    const selectedItem = allBarang.find(
      (b) => b.id === updated[index].barang_id,
    );
    if (!selectedItem) return;

    if (val > selectedItem.stok_tersedia) {
      alert(
        `Stok tersedia untuk ${selectedItem.nama} hanya ${selectedItem.stok_tersedia} unit.`,
      );
      updated[index].jumlah = selectedItem.stok_tersedia;
    } else if (val < 1) {
      updated[index].jumlah = 1;
    } else {
      updated[index].jumlah = val;
    }
    setBasket(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (errorMsg) return;

    if (basket.length === 0) {
      setErrorMsg(
        "Harap masukkan minimal 1 barang inventaris untuk mengajukan.",
      );
      return;
    }

    if (!keperluan.trim()) {
      setErrorMsg("Harap isi deskripsi keperluan kegiatan peminjaman.");
      return;
    }

    // Verify stock allocations once more before writing
    for (const item of basket) {
      const match = allBarang.find((b) => b.id === item.barang_id);
      if (!match) {
        setErrorMsg("Terdapat barang yang tidak valid.");
        return;
      }
      if (item.jumlah > match.stok_tersedia) {
        setErrorMsg(
          `Stok ${match.nama} tidak mencukupi. Tersedia: ${match.stok_tersedia} unit.`,
        );
        return;
      }
    }

    // Generate unique code PJM-2026-XXX
    const prefix = "PJM-2026-";
    const randCode = String(Math.floor(Math.random() * 900) + 100);
    const code = prefix + randCode;
    setGeneratedCode(code);

    const newPeminjaman: Peminjaman = {
      id: "PJM-" + Date.now(),
      kode: code,
      peminjam_id: currentUser.id,
      peminjam_nama: currentUser.nama,
      peminjam_role: currentUser.role,
      peminjam_kelas: currentUser.kelas_jabatan,
      status: "menunggu_surat", // Change default status to 'menunggu_surat'
      tgl_pengajuan: new Date().toISOString().split("T")[0],
      tgl_mulai: tglMulai,
      tgl_kembali_rencana: tglKembali,
      keperluan: keperluan.trim(),
      kategori_kegiatan: kategoriKegiatan,
      catatan_peminjam: catatan.trim(),
      items: basket,
      surat_nama_kegiatan: suratNamaKegiatan.trim(),
      surat_hari: suratHari,
      surat_tanggal_kegiatan: suratTanggal,
      surat_waktu_mulai: suratWaktuMulai,
      surat_waktu_selesai: suratWaktuSelesai,
      surat_tempat: suratTempat.trim(),
      surat_ketua_panitia: suratKetua.trim(),
      surat_nis_ketua: suratNisKetua.trim(),
    };

    // Save Peminjaman
    const loans = getPeminjaman();
    savePeminjaman([newPeminjaman, ...loans]);

    // We DO NOT deduct available stock immediately, because the status is 'menunggu' (waiting).
    // The stock deduction occurs when the staff approvals the request!
    // This perfectly models real-world inventory locking.

    setIsSubmitted(true);
  };

  // Render Confirmation Page after submission
  if (isSubmitted) {
    return (
      <div className="p-4 md:p-6 max-w-lg mx-auto font-sans">
        <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-6 text-center space-y-5 animate-fade-in">
          <div className="w-16 h-16 bg-teal-50 text-[#0F766E] border border-teal-100 flex items-center justify-center rounded-2xl mx-auto shadow-sm">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-800">
              Pengajuan Berhasil Dikirim!
            </h2>
            <p className="text-xs text-slate-500">
              Formulir Anda telah terdaftar di sistem TU Sarpras.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-left space-y-2">
            <div className="flex justify-between border-b border-slate-100 pb-2 text-xs">
              <span className="text-slate-400 font-semibold">
                Kode Transaksi:
              </span>
              <span className="font-bold text-[#1E3A8A]">{generatedCode}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2 text-xs">
              <span className="text-slate-400 font-semibold">
                Tanggal Mulai:
              </span>
              <span className="font-bold text-slate-700">{tglMulai}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-semibold">
                Estimasi Peninjauan:
              </span>
              <span className="font-semibold text-slate-500">
                Maksimum 1x24 Jam Kerja
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed bg-[#CCFBF1]/20 p-2.5 border border-teal-100/50 rounded-lg">
            Notifikasi status persetujuan akan langsung diterbitkan di dashboard
            Anda. Silakan sampaikan lembar pengajuan fisik apabila diperlukan
            verifikasi silang.
          </p>

          <button
            onClick={onSuccess}
            className="w-full bg-[#1E3A8A] hover:bg-slate-900 text-white font-bold h-11 rounded-lg text-sm active:scale-95 duration-70 transition-all cursor-pointer"
          >
            Kembali ke Dashboard Saya
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      id="form_peminjaman_view"
      className="p-4 md:p-6 max-w-2xl mx-auto space-y-6 font-sans"
    >
      {/* Header bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={onCancel}
          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border-2 border-slate-900 rounded-lg shrink-0 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
        </button>
        <div>
          <h2 className="text-xl font-black text-[#1E3A8A] flex items-center gap-2 leading-none">
            <ShoppingBag className="w-5 h-5 text-[#1E3A8A] stroke-[2.5]" />
            Formulir Peminjaman
          </h2>
          <span className="text-[10px] text-slate-500 font-bold block mt-1 tracking-wider">
            SMAN 1 Sentolo • DI YOGYAKARTA
          </span>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border-2 border-slate-900 shadow-sm p-4 md:p-6 space-y-6"
      >
        {/* Step Alert messages */}
        {errorMsg && (
          <div className="p-3 bg-red-50 text-xs text-[#B91C1C] border-2 border-red-900 rounded-lg flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-[10px] tracking-wider">
                Kesalahan Input:
              </p>
              <p className="mt-0.5 font-semibold">{errorMsg}</p>
            </div>
          </div>
        )}

        {warningMsg && (
          <div className="p-3 bg-amber-50 text-xs text-[#B45309] border-2 border-amber-900 rounded-lg flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-[10px] tracking-wider">
                Pemberitahuan:
              </p>
              <p className="mt-0.5 text-slate-700 font-semibold">
                {warningMsg}
              </p>
            </div>
          </div>
        )}

        {/* Section 1: Item Basket Selection */}
        <div className="space-y-3">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <label className="text-[10px] font-black text-slate-800 tracking-widest block">
              Daftar Barang Inventaris (Multi-pilihan)
            </label>
            <button
              type="button"
              onClick={handleAddItemToBasket}
              className="text-[10px] font-black tracking-wider text-[#1E3A8A] flex items-center gap-1 hover:underline cursor-pointer bg-slate-55 border-2 border-slate-900 px-2.5 py-1 rounded"
            >
              <ListPlus className="w-3.5 h-3.5 stroke-[3]" />+ Tambah Barang
            </button>
          </div>

          <div className="space-y-3">
            {basket.map((basketItem, index) => {
              const matchedProp = allBarang.find(
                (b) => b.id === basketItem.barang_id,
              );
              return (
                <div
                  key={index}
                  className="flex gap-2.5 items-center bg-slate-50 p-3 rounded-lg border-2 border-slate-900"
                >
                  {/* Select Dropdown */}
                  <div className="flex-1 min-w-[140px]">
                    <select
                      value={basketItem.barang_id}
                      onChange={(e) => handleItemSelect(index, e.target.value)}
                      className="w-full py-1.5 px-2 bg-white text-xs border border-slate-400 font-bold focus:ring-1 focus:ring-[#1E3A8A] text-slate-800"
                    >
                      {allBarang.map((b) => (
                        <option
                          key={b.id}
                          value={b.id}
                          disabled={b.stok_tersedia <= 0}
                        >
                          {b.nama} (TERSEDIA: {b.stok_tersedia})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity Control Selector */}
                  <div className="flex items-center gap-1 shrink-0 bg-white border border-slate-400 rounded px-1">
                    <span className="text-[9px] text-slate-400 font-black px-1 select-none">
                      QTY:
                    </span>
                    <input
                      type="number"
                      value={basketItem.jumlah}
                      onChange={(e) =>
                        handleQtyChange(index, parseInt(e.target.value) || 1)
                      }
                      className="w-9 text-center py-1 bg-transparent text-xs font-black focus:outline-none text-slate-800"
                      min={1}
                      max={matchedProp ? matchedProp.stok_tersedia : 10}
                    />
                  </div>

                  {/* Trash delete item */}
                  {basket.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-1 px-1.5 text-red-600 hover:bg-red-50 rounded border border-transparent hover:border-red-100 transition-colors cursor-pointer"
                      title="Hapus barang dari daftar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Date Picker */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="tgl_mulai"
              className="block text-[10px] font-black text-slate-805 tracking-widest mb-1 flex items-center gap-1"
            >
              <Calendar className="w-3.5 h-3.5 text-[#1E3A8A] stroke-[2.5]" />
              Rencana Tanggal Mulai
            </label>
            <input
              id="tgl_mulai"
              type="date"
              value={tglMulai}
              onChange={(e) => setTglMulai(e.target.value)}
              className="w-full py-2 px-3 bg-[#f8fafc] border-2 border-slate-900 rounded-lg text-xs font-black text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] focus:bg-white transition-all"
            />
          </div>

          <div>
            <label
              htmlFor="tgl_kembali"
              className="block text-[10px] font-black text-slate-805 tracking-widest mb-1 flex items-center gap-1"
            >
              <Calendar className="w-3.5 h-3.5 text-[#1E3A8A] stroke-[2.5]" />
              Selesai Peminjaman
            </label>
            <input
              id="tgl_kembali"
              type="date"
              value={tglKembali}
              onChange={(e) => setTglKembali(e.target.value)}
              className="w-full py-2 px-3 bg-[#f8fafc] border-2 border-slate-900 rounded-lg text-xs font-black text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Section 3: Keperluan & Kategori Kegiatan */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <label
              htmlFor="kategori_kegiatan"
              className="block text-[10px] font-black text-slate-805 tracking-widest mb-1"
            >
              Organisasi / Sifat
            </label>
            <select
              id="kategori_kegiatan"
              value={kategoriKegiatan}
              onChange={(e) =>
                setKategoriKegiatan(e.target.value as KategoriKegiatan)
              }
              className="w-full py-2 px-3 bg-[#f8fafc] border-2 border-slate-900 rounded-lg text-xs font-black text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] focus:bg-white transition-all"
            >
              <option value="osis">OSIS (Siswa)</option>
              <option value="ekskul">Ekstrakulikuler</option>
              <option value="kelas">Kebutuhan Kelas</option>
              <option value="pribadi">Keluarga / Pribadi</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="keperluan_field"
              className="block text-[10px] font-black text-slate-805 tracking-widest mb-1"
            >
              Keperluan Rinci / Nama Kegiatan
            </label>
            <input
              id="keperluan_field"
              type="text"
              placeholder="Contoh: Dokumentasi Upacara Bendera SMAN 1"
              value={keperluan}
              onChange={(e) => setKeperluan(e.target.value)}
              className="w-full py-2.5 px-3 bg-[#f8fafc] border-2 border-slate-900 rounded-lg text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Section 4: Data Surat Pengajuan */}
        <div className="bg-white border-2 border-slate-900 rounded-lg p-4 space-y-4 shadow-sm">
          <p className="text-xs font-black text-[#1E3A8A] uppercase tracking-wider mb-2 border-b-2 border-slate-900 pb-2">
            Form Data Surat Cetak
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-805 tracking-widest mb-1">
                Nama Kegiatan (Untuk Surat)
              </label>
              <input
                type="text"
                placeholder="Contoh: HARI KARTINI"
                value={suratNamaKegiatan}
                onChange={(e) => setSuratNamaKegiatan(e.target.value)}
                className="w-full py-2 px-3 bg-[#f8fafc] border-2 border-slate-900 rounded text-xs font-bold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-805 tracking-widest mb-1">
                Tempat Kegiatan
              </label>
              <input
                type="text"
                placeholder="Contoh: SMAN 1 Sentolo"
                value={suratTempat}
                onChange={(e) => setSuratTempat(e.target.value)}
                className="w-full py-2 px-3 bg-[#f8fafc] border-2 border-slate-900 rounded text-xs font-bold focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-805 tracking-widest mb-1">
                Hari Pelaksanaan
              </label>
              <select
                value={suratHari}
                onChange={(e) => setSuratHari(e.target.value)}
                className="w-full py-2 px-3 bg-[#f8fafc] border-2 border-slate-900 rounded text-xs font-bold focus:outline-none"
              >
                <option>Senin</option>
                <option>Selasa</option>
                <option>Rabu</option>
                <option>Kamis</option>
                <option>Jumat</option>
                <option>Sabtu</option>
                <option>Minggu</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-805 tracking-widest mb-1">
                Tanggal Surat
              </label>
              <input
                type="date"
                value={suratTanggal}
                onChange={(e) => setSuratTanggal(e.target.value)}
                className="w-full py-2 px-3 bg-[#f8fafc] border-2 border-slate-900 rounded text-xs font-bold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-805 tracking-widest mb-1">
                Waktu Mulai
              </label>
              <input
                type="time"
                value={suratWaktuMulai}
                onChange={(e) => setSuratWaktuMulai(e.target.value)}
                className="w-full py-2 px-3 bg-[#f8fafc] border-2 border-slate-900 rounded text-xs font-bold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-805 tracking-widest mb-1">
                Waktu Selesai
              </label>
              <input
                type="time"
                value={suratWaktuSelesai}
                onChange={(e) => setSuratWaktuSelesai(e.target.value)}
                className="w-full py-2 px-3 bg-[#f8fafc] border-2 border-slate-900 rounded text-xs font-bold focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t-2 border-slate-100 pt-3">
            <div>
              <label className="block text-[10px] font-black text-slate-805 tracking-widest mb-1">
                Nama Ketua Panitia
              </label>
              <input
                type="text"
                placeholder="Masukkan nama ketua"
                value={suratKetua}
                onChange={(e) => setSuratKetua(e.target.value)}
                className="w-full py-2 px-3 bg-[#f8fafc] border-2 border-slate-900 rounded text-xs font-bold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-805 tracking-widest mb-1">
                NIS Ketua Panitia
              </label>
              <input
                type="text"
                placeholder="Contoh: 12345"
                value={suratNisKetua}
                onChange={(e) => setSuratNisKetua(e.target.value)}
                className="w-full py-2 px-3 bg-[#f8fafc] border-2 border-slate-900 rounded text-xs font-bold focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Catatan Tambahan */}
        <div>
          <label
            htmlFor="catatan_field"
            className="block text-[10px] font-black text-slate-805 tracking-widest mb-1"
          >
            Alasan Khusus & Catatan Tambahan (Opsional)
          </label>
          <textarea
            id="catatan_field"
            rows={3}
            maxLength={200}
            placeholder="Tuliskan kelengkapan tambahan yang dibutuhkan (Maks 200 karakter)..."
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            className="w-full py-2 px-3 bg-[#f8fafc] border-2 border-slate-900 rounded-lg text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none resize-none"
          ></textarea>
        </div>

        {/* Submit & Cancel Buttons */}
        <div className="pt-4 border-t-2 border-slate-900 flex justify-between items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 bg-white hover:bg-slate-100 border-2 border-slate-900 text-slate-800 text-[10px] font-black tracking-wider rounded-lg transition-all cursor-pointer"
          >
            Batalkan
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 bg-[#1E3A8A] hover:bg-slate-900 border-2 border-slate-950 text-white text-[10px] font-black tracking-wider rounded-lg flex items-center gap-1.5 shadow active:scale-95 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 stroke-[2.5]" />
            Kirim Pengajuan
          </button>
        </div>
      </form>
    </div>
  );
}
