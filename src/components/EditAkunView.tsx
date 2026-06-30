/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User as UserType } from '../types';
import { getUsers, saveUsers } from '../data/db';
import { apiUpdateProfile } from '../data/api';
import { ArrowLeft, User, Key, CheckCircle2, Info, Eye, EyeOff, ShieldCheck } from 'lucide-react';

interface EditAkunViewProps {
  currentUser: UserType;
  onBack: () => void;
  onUserUpdate: (updated: UserType) => void;
}

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'admin': return 'Admin TU';
    case 'guru': return 'Guru';
    default: return 'Siswa';
  }
};

const roleBadge = (role: string) => {
  switch (role) {
    case 'admin': return 'bg-violet-50 text-violet-700 border-violet-200';
    case 'guru': return 'bg-sky-50 text-sky-700 border-sky-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export default function EditAkunView({ currentUser, onBack, onUserUpdate }: EditAkunViewProps) {
  // Info umum
  const [nama, setNama] = useState(currentUser.nama);
  const [email, setEmail] = useState(currentUser.email || '');
  const [kelas, setKelas] = useState(currentUser.kelas_jabatan || '');
  const [organisasi, setOrganisasi] = useState(currentUser.organisasi || '');
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoError, setInfoError] = useState<string | null>(null);
  const [infoSuccess, setInfoSuccess] = useState(false);

  // Ganti password
  const [passLama, setPassLama] = useState('');
  const [passBaru, setPassBaru] = useState('');
  const [passKonfirm, setPassKonfirm] = useState('');
  const [showLama, setShowLama] = useState(false);
  const [showBaru, setShowBaru] = useState(false);
  const [showKonfirm, setShowKonfirm] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState(false);

  const inputClass = 'w-full h-11 px-3 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-500/30 focus:border-slate-500 focus:bg-white transition-all';
  const inputIconClass = 'w-full h-11 pl-9 pr-10 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-500/30 focus:border-slate-500 focus:bg-white transition-all';
  const labelClass = 'block text-xs font-medium text-gray-600 mb-1.5';

  const applyUpdate = (updated: UserType) => {
    const users = getUsers();
    saveUsers(users.map((u) => (u.id === updated.id ? updated : u)));
    onUserUpdate(updated);
  };

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoError(null);
    setInfoSuccess(false);
    if (!nama.trim()) { setInfoError('Nama lengkap wajib diisi.'); return; }
    if (!kelas.trim()) { setInfoError('Kelas / Jabatan wajib diisi.'); return; }

    setInfoLoading(true);
    try {
      const res = await apiUpdateProfile(currentUser.id, { nama: nama.trim(), email: email.trim() || undefined, kelas_jabatan: kelas.trim(), organisasi: organisasi.trim() || undefined });
      const updatedUser: UserType = { ...currentUser, ...(res.user as Partial<UserType>) };
      applyUpdate(updatedUser);
      setInfoSuccess(true);
    } catch (err: unknown) {
      setInfoError(err instanceof Error ? err.message : 'Gagal menyimpan.');
    } finally {
      setInfoLoading(false);
    }
  };

  const handleGantiPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(false);
    if (!passLama) { setPassError('Password lama wajib diisi.'); return; }
    if (passBaru.length < 6) { setPassError('Password baru minimal 6 karakter.'); return; }
    if (passBaru !== passKonfirm) { setPassError('Konfirmasi password tidak cocok.'); return; }

    setPassLoading(true);
    try {
      const res = await apiUpdateProfile(currentUser.id, {
        nama: currentUser.nama, kelas_jabatan: currentUser.kelas_jabatan || '',
        password_lama: passLama, password_baru: passBaru,
      });
      const updatedUser: UserType = { ...currentUser, ...(res.user as Partial<UserType>), password: passBaru };
      applyUpdate(updatedUser);
      setPassBaru(''); setPassLama(''); setPassKonfirm('');
      setPassSuccess(true);
    } catch (err: unknown) {
      setPassError(err instanceof Error ? err.message : 'Gagal mengganti password.');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6 font-sans">

      {/* Page header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
        <button
          type="button"
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Edit Profil Akun</h2>
          <p className="text-xs text-gray-400 mt-0.5">Perbarui informasi dan keamanan akun Anda</p>
        </div>
      </div>

      {/* Profil ringkas — read only */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4 shadow-soft">
        <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center shrink-0">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{currentUser.nama}</p>
          <p className="text-xs text-gray-400 mt-0.5">{currentUser.role === 'guru' ? 'NIP' : 'NIS'}: {currentUser.nis_nip}</p>
        </div>
        <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border ${roleBadge(currentUser.role)}`}>
          {getRoleLabel(currentUser.role)}
        </span>
      </div>

      {/* ── Informasi Akun ── */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-soft overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-semibold text-gray-800">Informasi Akun</span>
        </div>

        <form onSubmit={handleSaveInfo} className="p-5 space-y-4">
          {infoSuccess && (
            <div className="p-3 bg-green-50 text-xs text-green-700 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Informasi akun berhasil diperbarui.
            </div>
          )}
          {infoError && (
            <div className="p-3 bg-red-50 text-xs text-red-700 border border-red-200 rounded-lg flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              {infoError}
            </div>
          )}

          {/* NIS/NIP read-only */}
          <div>
            <label className={labelClass}>{currentUser.role === 'guru' ? 'NIP' : 'NIS'} <span className="text-gray-400 font-normal">(tidak dapat diubah)</span></label>
            <input
              type="text"
              value={currentUser.nis_nip}
              disabled
              className="w-full h-11 px-3 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-400 cursor-not-allowed"
            />
          </div>

          {/* Nama */}
          <div>
            <label className={labelClass}>Nama Lengkap <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={nama}
              onChange={(e) => { setNama(e.target.value); setInfoSuccess(false); }}
              placeholder="Nama lengkap"
              className={inputClass}
              required
            />
          </div>

          {/* Kelas & Organisasi */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Kelas / Jabatan <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={kelas}
                onChange={(e) => { setKelas(e.target.value); setInfoSuccess(false); }}
                placeholder={currentUser.role === 'guru' ? 'Contoh: Guru Biologi' : 'Contoh: XI IPS 1'}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Organisasi <span className="text-xs text-gray-400 font-normal">(opsional)</span></label>
              <input
                type="text"
                value={organisasi}
                onChange={(e) => { setOrganisasi(e.target.value); setInfoSuccess(false); }}
                placeholder="Contoh: OSIS"
                className={inputClass}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className={labelClass}>Email <span className="text-xs text-gray-400 font-normal">(opsional)</span></label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setInfoSuccess(false); }}
              placeholder="Contoh: nama@gmail.com"
              className={inputClass}
            />
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={infoLoading}
              className="w-full h-11 bg-slate-700 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {infoLoading
                ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Menyimpan...</>
                : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Ganti Password ── */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-soft overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
          <Key className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-semibold text-gray-800">Ganti Password</span>
        </div>

        <form onSubmit={handleGantiPassword} className="p-5 space-y-4">
          {passSuccess && (
            <div className="p-3 bg-green-50 text-xs text-green-700 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Password berhasil diperbarui.
            </div>
          )}
          {passError && (
            <div className="p-3 bg-red-50 text-xs text-red-700 border border-red-200 rounded-lg flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              {passError}
            </div>
          )}

          {/* Password Lama */}
          <div>
            <label className={labelClass}>Password Lama <span className="text-red-500">*</span></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Key className="w-4 h-4" />
              </div>
              <input
                type={showLama ? 'text' : 'password'}
                value={passLama}
                onChange={(e) => { setPassLama(e.target.value); setPassSuccess(false); }}
                placeholder="Masukkan password saat ini"
                className={inputIconClass}
              />
              <button type="button" onClick={() => setShowLama((v) => !v)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                {showLama ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Password Baru */}
          <div>
            <label className={labelClass}>Password Baru <span className="text-red-500">*</span></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Key className="w-4 h-4" />
              </div>
              <input
                type={showBaru ? 'text' : 'password'}
                value={passBaru}
                onChange={(e) => { setPassBaru(e.target.value); setPassSuccess(false); }}
                placeholder="Minimal 6 karakter"
                className={inputIconClass}
              />
              <button type="button" onClick={() => setShowBaru((v) => !v)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                {showBaru ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Konfirmasi Password Baru */}
          <div>
            <label className={labelClass}>Konfirmasi Password Baru <span className="text-red-500">*</span></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Key className="w-4 h-4" />
              </div>
              <input
                type={showKonfirm ? 'text' : 'password'}
                value={passKonfirm}
                onChange={(e) => { setPassKonfirm(e.target.value); setPassSuccess(false); }}
                placeholder="Ulangi password baru"
                className={`${inputIconClass} ${passKonfirm && passKonfirm !== passBaru ? 'border-red-400 focus:border-red-500' : ''}`}
              />
              <button type="button" onClick={() => setShowKonfirm((v) => !v)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                {showKonfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passKonfirm && passKonfirm !== passBaru && (
              <p className="text-xs text-red-500 mt-1">Password tidak cocok.</p>
            )}
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={passLoading}
              className="w-full h-11 bg-slate-700 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {passLoading
                ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Memperbarui...</>
                : 'Ganti Password'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
