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
import { fmtTgl } from "../utils";
import {
  ShoppingBag,
  Calendar,
  ArrowLeft,
  Send,
  CheckCircle,
  AlertTriangle,
  Info,
} from "lucide-react";

interface FormPeminjamanProps {
  currentUser: User;
  daftarPinjam: DetailPeminjaman[];
  clearDaftarPinjam: () => void;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function FormPeminjaman({
  currentUser,
  daftarPinjam,
  clearDaftarPinjam,
  onSuccess,
  onCancel,
}: FormPeminjamanProps) {
  const allBarang = getBarang().filter((b) => b.status === "aktif");

  const toDateStr = (d: Date) => d.toISOString().split("T")[0];
  const todayStr = toDateStr(new Date());
  const twoDaysLater = new Date();
  twoDaysLater.setDate(twoDaysLater.getDate() + 2);
  const defaultEndStr = toDateStr(twoDaysLater);

  const [step, setStep] = useState<1 | 2>(1);

  const [tglMulai, setTglMulai] = useState(todayStr);
  const [tglKembali, setTglKembali] = useState(defaultEndStr);
  const [keperluan, setKeperluan] = useState("");
  const [kategoriKegiatan, setKategoriKegiatan] = useState<KategoriKegiatan>("osis");
  const [catatan, setCatatan] = useState("");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");

  const [suratNamaKegiatan, setSuratNamaKegiatan] = useState("");
  const [suratTanggal, setSuratTanggal] = useState(todayStr);
  const HARI_ID = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const derivedHari = suratTanggal
    ? HARI_ID[new Date(suratTanggal + 'T12:00:00').getDay()]
    : 'Senin';
  const [suratWaktuMulai, setSuratWaktuMulai] = useState("07:00");
  const [suratWaktuSelesai, setSuratWaktuSelesai] = useState("15:30");
  const [suratTempat, setSuratTempat] = useState("SMAN 1 Sentolo");
  const [suratKetua, setSuratKetua] = useState("");
  const [suratNisKetua, setSuratNisKetua] = useState("");

  useEffect(() => {
    if (tglMulai && tglKembali) {
      const start = new Date(tglMulai);
      const end = new Date(tglKembali);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (end < start) {
        setErrorMsg("Tanggal pengembalian rencana tidak boleh sebelum tanggal mulai.");
        setWarningMsg(null);
      } else {
        setErrorMsg(null);
        if (diffDays > 7) {
          setWarningMsg("Durasi peminjaman melebihi batas standar (7 hari). Cantumkan persetujuan wali kelas/pembina pada kolom catatan.");
        } else {
          setWarningMsg(null);
        }
      }
    }
  }, [tglMulai, tglKembali]);

  const isGuruRole = currentUser.role === "guru";
  const identifierLabel = isGuruRole ? "NIP" : "NIS";
  const identifierPlaceholder = isGuruRole ? "Contoh: 198001011234567890" : "Contoh: 12345";
  const identifierValidationMessage = isGuruRole ? "NIP" : "NIS";

  const validateRequiredFields = () => {
    if (!tglMulai) return "Tanggal mulai wajib diisi.";
    if (!tglKembali) return "Tanggal pengembalian rencana wajib diisi.";
    if (!keperluan.trim()) return "Harap isi deskripsi keperluan kegiatan peminjaman.";
    if (!suratNamaKegiatan.trim()) return "Harap isi nama kegiatan untuk surat.";
    if (!suratTanggal) return "Harap pilih tanggal pelaksanaan.";
    if (!suratTanggal) return "Harap isi tanggal surat.";
    if (!suratWaktuMulai) return "Harap isi waktu mulai kegiatan.";
    if (!suratWaktuSelesai) return "Harap isi waktu selesai kegiatan.";
    if (!suratTempat.trim()) return "Harap isi tempat kegiatan untuk surat.";
    if (!suratKetua.trim()) return "Harap isi nama ketua panitia.";
    if (!suratNisKetua.trim()) return `Harap isi ${identifierValidationMessage.toLowerCase()}.`;
    if (!/^\d+$/.test(suratNisKetua)) return `${identifierValidationMessage} hanya boleh berisi angka.`;
    if (isGuruRole && suratNisKetua.length !== 18) return "NIP harus terdiri dari 18 digit angka.";
    return null;
  };

  const handleSuratNipKetuaChange = (value: string) => {
    if (/^\d*$/.test(value)) {
      setSuratNisKetua(value);
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setWarningMsg(null);

    if (!tglMulai || !tglKembali) {
      setErrorMsg("Tanggal mulai dan tanggal selesai wajib diisi.");
      return;
    }
    if (tglMulai < todayStr) {
      setErrorMsg("Tanggal mulai tidak boleh sebelum hari ini.");
      return;
    }
    if (new Date(tglKembali) < new Date(tglMulai)) {
      setErrorMsg("Tanggal pengembalian rencana tidak boleh sebelum tanggal mulai.");
      return;
    }
    if (daftarPinjam.length === 0) {
      setErrorMsg("Daftar pinjam kosong. Kembali ke katalog untuk memilih barang.");
      return;
    }

    const validationError = validateRequiredFields();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setStep(2);
  };

  const handleSubmit = () => {
    if (daftarPinjam.length === 0) return;
    // Ambil data stok TERBARU saat submit (bukan snapshot saat halaman dibuka),
    // agar validasi akurat jika stok sudah berubah sejak form dibuka.
    const currentBarang = getBarang();
    for (const item of daftarPinjam) {
      const match = currentBarang.find((b) => b.id === item.barang_id);
      if (!match || match.status !== "aktif") {
        setErrorMsg("Terdapat barang yang tidak valid atau sedang tidak tersedia. Muat ulang katalog.");
        return;
      }
      if (item.jumlah > match.stok_tersedia) {
        setErrorMsg(`Stok ${match.nama} tidak mencukupi. Tersedia: ${match.stok_tersedia} unit.`);
        return;
      }
    }

    const loans = getPeminjaman();
    const year = new Date().getFullYear();
    const prefix = `PJM-${year}-`;
    const maxSeq = loans.reduce((max, l) => {
      if (!l.kode.startsWith(prefix)) return max;
      const n = parseInt(l.kode.slice(prefix.length), 10);
      return isNaN(n) ? max : Math.max(max, n);
    }, 0);
    const code = prefix + String(maxSeq + 1).padStart(3, "0");
    setGeneratedCode(code);

    const newPeminjaman: Peminjaman = {
      id: "PJM-" + Date.now(),
      kode: code,
      peminjam_id: currentUser.id,
      peminjam_nama: currentUser.nama,
      peminjam_role: currentUser.role,
      peminjam_kelas: currentUser.kelas_jabatan,
      status: "menunggu_surat",
      tgl_pengajuan: new Date().toISOString().split("T")[0],
      tgl_mulai: tglMulai,
      tgl_kembali_rencana: tglKembali,
      keperluan: keperluan.trim(),
      kategori_kegiatan: kategoriKegiatan,
      catatan_peminjam: catatan.trim(),
      items: daftarPinjam,
      surat_nama_kegiatan: suratNamaKegiatan.trim(),
      surat_hari: derivedHari,
      surat_tanggal_kegiatan: suratTanggal,
      surat_waktu_mulai: suratWaktuMulai,
      surat_waktu_selesai: suratWaktuSelesai,
      surat_tempat: suratTempat.trim(),
      surat_ketua_panitia: suratKetua.trim(),
      surat_nis_ketua: suratNisKetua.trim(),
    };

    // Reservasi stok: kurangi stok_tersedia saat pengajuan dibuat agar
    // tidak terjadi over-booking oleh pengajuan lain yang masih menunggu.
    // Pakai snapshot stok yang sama dengan validasi di atas (currentBarang).
    const reservedBarang = currentBarang.map((b) => {
      const item = daftarPinjam.find((it) => it.barang_id === b.id);
      if (item) {
        return { ...b, stok_tersedia: Math.max(0, b.stok_tersedia - item.jumlah) };
      }
      return b;
    });
    saveBarang(reservedBarang);

    savePeminjaman([newPeminjaman, ...loans]);
    clearDaftarPinjam();
    setIsSubmitted(true);
  };

  // ── Input classes ──
  const inputClass = "w-full h-9 px-3 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all";
  const selectClass = "w-full h-9 px-3 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500";
  const labelClass = "block text-xs font-medium text-gray-600 mb-1";

  // ── Success page ──
  if (isSubmitted) {
    return (
      <div className="p-4 md:p-6 max-w-lg mx-auto font-sans">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 text-center space-y-5 animate-fade-in">
          <div className="w-14 h-14 bg-green-50 text-[#16A34A] border border-green-200 flex items-center justify-center rounded-xl mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-gray-900">Pengajuan Berhasil Dikirim!</h2>
            <p className="text-sm text-gray-500">Formulir Anda telah terdaftar di sistem TU Sarpras.</p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-left space-y-2">
            <div className="flex justify-between border-b border-gray-100 pb-2 text-xs">
              <span className="text-gray-400 font-medium">Kode Transaksi:</span>
              <span className="font-semibold text-[#334155]">{generatedCode}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-2 text-xs">
              <span className="text-gray-400 font-medium">Tanggal Mulai:</span>
              <span className="font-medium text-gray-700">{tglMulai}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400 font-medium">Estimasi Peninjauan:</span>
              <span className="font-medium text-gray-500">Maksimum 1×24 Jam Kerja</span>
            </div>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed bg-green-50 p-3 border border-green-100 rounded-lg text-left">
            Notifikasi status persetujuan akan diterbitkan di dashboard Anda. Sampaikan lembar pengajuan fisik apabila diperlukan verifikasi silang.
          </p>

          <button
            onClick={onSuccess}
            className="w-full bg-[#334155] hover:bg-[#1E293B] text-white font-medium h-10 rounded-lg text-sm transition-all cursor-pointer"
          >
            Kembali ke Dashboard Saya
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="form_peminjaman_view" className="p-4 md:p-6 max-w-2xl mx-auto space-y-5 font-sans">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onCancel}
          className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 rounded-lg shrink-0 cursor-pointer transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-gray-400" />
            Formulir Peminjaman
          </h2>
          <span className="text-xs text-gray-400 block mt-0.5">SMAN 1 Sentolo · DI Yogyakarta</span>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${step >= 1 ? 'bg-[#334155] text-white' : 'bg-gray-200 text-gray-400'}`}>1</div>
        <div className={`flex-1 h-0.5 ${step >= 2 ? 'bg-[#334155]' : 'bg-gray-200'}`}></div>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${step >= 2 ? 'bg-[#334155] text-white' : 'bg-gray-200 text-gray-400'}`}>2</div>
        <span className="text-xs text-gray-400">{step === 1 ? 'Data Kegiatan' : 'Review & Kirim'}</span>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
        className="bg-white rounded-2xl border border-gray-200 shadow-soft p-4 md:p-6 space-y-5"
      >
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            {/* Error & Warning */}
            {errorMsg && (
              <div className="p-3 bg-red-50 text-xs text-red-700 border border-red-200 rounded-lg flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
            {warningMsg && (
              <div className="p-3 bg-amber-50 text-xs text-amber-800 border-l-2 border-amber-400 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{warningMsg}</span>
              </div>
            )}

            {/* Barang Section */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100 pb-2">
                Barang yang Akan Dipinjam
              </p>
              <div className="space-y-2">
                {daftarPinjam.map((item, index) => {
                  const matchedProp = allBarang.find((b) => b.id === item.barang_id);
                  return (
                    <div key={index} className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-800">{matchedProp ? matchedProp.nama : "Unknown"}</p>
                        <p className="text-xs text-gray-400">{matchedProp?.kode}</p>
                      </div>
                      <div className="bg-[#334155] text-white px-2.5 py-1 rounded-lg text-xs font-medium min-w-[3.5rem] text-center">
                        {item.jumlah} unit
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="tgl_mulai" className={`${labelClass} flex items-center gap-1`}>
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  Rencana Tanggal Mulai
                </label>
                <input
                  id="tgl_mulai"
                  type="date"
                  min={todayStr}
                  value={tglMulai}
                  onChange={(e) => setTglMulai(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label htmlFor="tgl_kembali" className={`${labelClass} flex items-center gap-1`}>
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  Selesai Peminjaman
                </label>
                <input
                  id="tgl_kembali"
                  type="date"
                  min={tglMulai || todayStr}
                  value={tglKembali}
                  onChange={(e) => setTglKembali(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
            </div>

            {/* Category & Purpose */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="kategori_kegiatan" className={labelClass}>Organisasi / Sifat</label>
                <select
                  id="kategori_kegiatan"
                  value={kategoriKegiatan}
                  onChange={(e) => setKategoriKegiatan(e.target.value as KategoriKegiatan)}
                  className={selectClass}
                >
                  <option value="osis">OSIS (Siswa)</option>
                  <option value="ekskul">Ekstrakulikuler</option>
                  <option value="kelas">Kebutuhan Kelas</option>
                  <option value="pribadi">Keluarga / Pribadi</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="keperluan_field" className={labelClass}>Keperluan Rinci / Nama Kegiatan</label>
                <input
                  id="keperluan_field"
                  type="text"
                  placeholder="Contoh: Dokumentasi Upacara Bendera SMAN 1"
                  value={keperluan}
                  onChange={(e) => setKeperluan(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
            </div>

            {/* Surat Data Section */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-200 pb-2">
                Data Surat Cetak
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Nama Kegiatan (Untuk Surat)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Hari Kartini"
                    value={suratNamaKegiatan}
                    onChange={(e) => setSuratNamaKegiatan(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Tempat Kegiatan</label>
                  <input
                    type="text"
                    placeholder="Contoh: SMAN 1 Sentolo"
                    value={suratTempat}
                    onChange={(e) => setSuratTempat(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Hari & Tanggal Pelaksanaan</label>
                  <input
                    type="date"
                    value={suratTanggal}
                    onChange={(e) => setSuratTanggal(e.target.value)}
                    className={inputClass}
                  />
                  {suratTanggal && (
                    <p className="text-xs text-[#334155] font-medium mt-1">
                      {derivedHari}, {fmtTgl(suratTanggal)}
                    </p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Waktu Mulai</label>
                  <input type="time" value={suratWaktuMulai} onChange={(e) => setSuratWaktuMulai(e.target.value)} className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Waktu Selesai</label>
                  <input type="time" value={suratWaktuSelesai} onChange={(e) => setSuratWaktuSelesai(e.target.value)} className={inputClass} required />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                <div>
                  <label className={labelClass}>Nama Ketua Panitia</label>
                  <input type="text" placeholder="Masukkan nama ketua" value={suratKetua} onChange={(e) => setSuratKetua(e.target.value)} className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>{identifierLabel}</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={isGuruRole ? 18 : undefined}
                    placeholder={identifierPlaceholder}
                    value={suratNisKetua}
                    onChange={(e) => handleSuratNipKetuaChange(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Catatan */}
            <div>
              <label htmlFor="catatan_field" className={labelClass}>
                Alasan Khusus & Catatan Tambahan (Opsional)
              </label>
              <textarea
                id="catatan_field"
                rows={3}
                maxLength={200}
                placeholder="Tuliskan kelengkapan tambahan yang dibutuhkan (Maks 200 karakter)..."
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="pt-4 border-t border-gray-100 flex justify-between items-center gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg transition cursor-pointer"
              >
                Batalkan
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 bg-[#334155] hover:bg-[#1E293B] text-white text-sm font-medium rounded-lg flex items-center gap-1.5 active:scale-95 transition cursor-pointer"
              >
                Review Akhir →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">Review Akhir Peminjaman</h3>

            {/* Rincian Barang */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Rincian Barang yang Dipinjam
              </p>
              <div className="space-y-2">
                {daftarPinjam.map((item, index) => {
                  const matched = allBarang.find((b) => b.id === item.barang_id);
                  return (
                    <div key={index} className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-800">{matched ? matched.nama : "Barang tidak dikenal"}</p>
                        <p className="text-xs text-gray-400">{matched?.kode}</p>
                      </div>
                      <div className="bg-[#334155] text-white px-2.5 py-1 rounded-lg text-xs font-medium min-w-[3.5rem] text-center">
                        {item.jumlah} unit
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2.5">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-xs text-gray-500 font-medium">Total Jenis Barang</span>
                <span className="text-xs font-semibold text-gray-800">{daftarPinjam.length} Jenis</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-xs text-gray-500 font-medium">Total Unit Barang</span>
                <span className="text-xs font-semibold text-gray-800">{daftarPinjam.reduce((acc, curr) => acc + curr.jumlah, 0)} Unit</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-xs text-gray-500 font-medium">Waktu Pelaksanaan</span>
                <span className="text-xs font-semibold text-gray-800">{suratTanggal}</span>
              </div>
              <div className="flex justify-between text-xs pt-1">
                <span className="text-gray-500 font-medium">Penanggung Jawab:</span>
                <span className="text-[#334155] font-semibold">{suratKetua} ({suratNisKetua})</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border-l-2 border-amber-400 rounded-lg text-xs text-amber-800">
              Pastikan semua data benar. Setelah mengajukan, pengajuan tidak dapat direvisi sendiri. Jika ada kesalahan, hubungi TU untuk pembatalan.
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-between items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg transition cursor-pointer"
              >
                ← Kembali Edit
              </button>
              <button
                type="submit"
                className="flex-1 max-w-sm bg-[#334155] hover:bg-[#1E293B] text-white text-sm font-medium rounded-lg py-2.5 flex justify-center items-center gap-1.5 active:scale-95 transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Ajukan Peminjaman
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
