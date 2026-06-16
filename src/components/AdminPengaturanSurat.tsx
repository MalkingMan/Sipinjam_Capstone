import React, { useState, useEffect } from 'react';
import { getPengaturanSurat, savePengaturanSurat, PengaturanSurat } from '../data/db';
import { Save, UploadCloud, Info, CheckCircle } from 'lucide-react';

export default function AdminPengaturanSurat() {
  const [settings, setSettings] = useState<PengaturanSurat>(getPengaturanSurat());
  const [saveStatus, setSaveStatus] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({ ...prev, logo_sekolah: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    savePengaturanSurat(settings);
    setSaveStatus('Pengaturan berhasil disimpan!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6 font-sans">

      {/* Title */}
      <div className="pb-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Pengaturan Template Surat</h2>
        <p className="text-sm text-gray-400 mt-0.5">Konfigurasi standar output surat permohonan SIPINJAM.</p>
      </div>

      {/* Success Alert */}
      {saveStatus && (
        <div className="p-3 bg-teal-50 border border-teal-200 text-teal-700 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span className="font-medium">{saveStatus}</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">

        {/* Logo Sekolah */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 pb-2 border-b border-gray-100">
            Identitas Sekolah
          </h3>
          <div className="flex items-start gap-4">
            <div className="w-24 h-24 border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden">
              {settings.logo_sekolah ? (
                <img src={settings.logo_sekolah} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <span className="text-xs font-medium text-gray-400">Belum ada logo</span>
              )}
            </div>
            <div>
              <label className="bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 cursor-pointer flex items-center gap-2 w-max transition">
                <UploadCloud className="w-4 h-4" />
                Upload Logo Baru
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
              <p className="text-xs text-gray-400 mt-2 max-w-xs leading-relaxed">
                Rekomendasi rasio 1:1, transparan (PNG). Logo akan dicetak pada pojok kiri atas surat.
              </p>
            </div>
          </div>
        </div>

        {/* Tanda Tangan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Tanda Tangan Kesiswaan</h3>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Nama Pejabat</label>
              <input
                type="text"
                name="waka_kesiswaan_nama"
                value={settings.waka_kesiswaan_nama}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">NIP Pejabat</label>
              <input
                type="text"
                name="waka_kesiswaan_nip"
                value={settings.waka_kesiswaan_nip}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Tanda Tangan Sarpras</h3>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Nama Pejabat</label>
              <input
                type="text"
                name="waka_sarpras_nama"
                value={settings.waka_sarpras_nama}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">NIP Pejabat</label>
              <input
                type="text"
                name="waka_sarpras_nip"
                value={settings.waka_sarpras_nip}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Counter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Counter Urutan Surat</label>
            <input
              type="number"
              name="surat_counter"
              value={settings.surat_counter}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">Atur jika ingin memulai nomor surat dari angka tertentu.</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Tahun Anggaran Surat</label>
            <input
              type="number"
              name="surat_tahun"
              value={settings.surat_tahun}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">Contoh: 2026</p>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            className="bg-[#1E3A8A] hover:bg-[#1e40af] text-white font-medium text-sm px-6 py-2.5 rounded-lg flex items-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Simpan Pengaturan
          </button>
        </div>
      </div>
    </div>
  );
}
