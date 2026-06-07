import React, { useState, useEffect } from 'react';
import { getPengaturanSurat, savePengaturanSurat, PengaturanSurat } from '../data/db';
import { Save, UploadCloud, Info } from 'lucide-react';

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
    <div className="max-w-4xl mx-auto space-y-6">
      
      <div className="bg-white p-4 rounded-xl shadow-sm border-2 border-slate-900 border-l-[6px] border-l-[#1E3A8A]">
        <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          Pengaturan Template Surat
        </h2>
        <p className="text-xs text-slate-500 font-bold mt-1 tracking-wider">
          Konfigurasi standar output surat permohonan SIPINJAM.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border-2 border-slate-900 p-6 space-y-6">
        
        {saveStatus && (
          <div className="p-3 bg-teal-50 border border-teal-200 text-teal-800 rounded font-bold text-xs flex items-center gap-2">
            <Info className="w-4 h-4" /> {saveStatus}
          </div>
        )}

        {/* Logo Sekolah */}
        <div>
          <h3 className="font-black text-slate-800 text-sm tracking-wider uppercase mb-3">Identitas Sekolah</h3>
          <div className="flex items-start gap-4">
            <div className="w-24 h-24 border-2 border-slate-900 rounded bg-slate-50 flex items-center justify-center shrink-0 object-cover overflow-hidden">
              {settings.logo_sekolah ? (
                <img src={settings.logo_sekolah} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <span className="text-[10px] font-bold text-slate-400">Belum ada logo</span>
              )}
            </div>
            <div>
              <label className="bg-white border-2 border-slate-900 px-4 py-2 rounded font-black text-[10px] uppercase tracking-wider hover:bg-slate-50 cursor-pointer flex items-center gap-2 w-max transition">
                <UploadCloud className="w-4 h-4" />
                Upload Logo Baru
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
              <p className="text-[10px] text-slate-500 mt-2 font-semibold max-w-xs leading-relaxed">
                Rekomendasi rasio 1:1, transparan (PNG). Logo akan dicetak pada pojok kiri atas surat.
              </p>
            </div>
          </div>
        </div>

        {/* Tanda Tangan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t-2 border-slate-100">
          <div className="space-y-3">
            <h3 className="font-black text-slate-800 text-sm tracking-wider uppercase mb-1">Tanda Tangan Kesiswaan</h3>
            
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Nama Pejabat</label>
              <input type="text" name="waka_kesiswaan_nama" value={settings.waka_kesiswaan_nama} onChange={handleChange} className="w-full bg-[#f8fafc] border-2 border-slate-900 rounded px-3 py-2 text-xs font-bold focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">NIP Pejabat</label>
              <input type="text" name="waka_kesiswaan_nip" value={settings.waka_kesiswaan_nip} onChange={handleChange} className="w-full bg-[#f8fafc] border-2 border-slate-900 rounded px-3 py-2 text-xs font-bold focus:outline-none" />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-black text-slate-800 text-sm tracking-wider uppercase mb-1">Tanda Tangan Sarpras</h3>
            
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Nama Pejabat</label>
              <input type="text" name="waka_sarpras_nama" value={settings.waka_sarpras_nama} onChange={handleChange} className="w-full bg-[#f8fafc] border-2 border-slate-900 rounded px-3 py-2 text-xs font-bold focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">NIP Pejabat</label>
              <input type="text" name="waka_sarpras_nip" value={settings.waka_sarpras_nip} onChange={handleChange} className="w-full bg-[#f8fafc] border-2 border-slate-900 rounded px-3 py-2 text-xs font-bold focus:outline-none" />
            </div>
          </div>
        </div>

        {/* Counter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t-2 border-slate-100">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Counter Urutan Surat</label>
            <input type="number" name="surat_counter" value={settings.surat_counter} onChange={handleChange} className="w-full bg-[#f8fafc] border-2 border-slate-900 rounded px-3 py-2 text-xs font-bold focus:outline-none" />
            <p className="text-[9px] text-slate-500 font-bold mt-1">Gunakan ini jika ingin memulai nomor surat dari angka tertentu.</p>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Tahun Anggaran Surat</label>
            <input type="number" name="surat_tahun" value={settings.surat_tahun} onChange={handleChange} className="w-full bg-[#f8fafc] border-2 border-slate-900 rounded px-3 py-2 text-xs font-bold focus:outline-none" />
            <p className="text-[9px] text-slate-500 font-bold mt-1">Misal: 2026</p>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button onClick={handleSave} className="bg-[#1E3A8A] hover:bg-slate-900 text-white font-black text-[10px] uppercase tracking-wider px-6 py-2.5 rounded shadow-sm border-2 border-slate-950 flex items-center gap-2 transition active:scale-95 cursor-pointer">
            <Save className="w-4 h-4 stroke-[3]" /> Simpan Pengaturan
          </button>
        </div>

      </div>
    </div>
  );
}
