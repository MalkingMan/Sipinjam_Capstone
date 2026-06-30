/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, User, Key, Info, ArrowLeft, UserPlus } from 'lucide-react';
import { apiRegister } from '../data/api';
import { getUsers, saveUsers } from '../data/db';
import { User as UserType } from '../types';

interface RegisterViewProps {
  onBack: () => void;
  onSuccess: () => void;
}

export default function RegisterView({ onBack, onSuccess }: RegisterViewProps) {
  const [nis, setNis] = useState('');
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [kelas, setKelas] = useState('');
  const [organisasi, setOrganisasi] = useState('');
  const [password, setPassword] = useState('');
  const [konfirmPassword, setKonfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showKonfirm, setShowKonfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const inputClass =
    'w-full h-11 pl-9 pr-3 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-500/30 focus:border-slate-500 focus:bg-white transition-all';
  const inputClassNoIcon =
    'w-full h-11 px-3 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-500/30 focus:border-slate-500 focus:bg-white transition-all';
  const labelClass = 'block text-xs font-medium text-gray-600 mb-1.5';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nis.trim()) { setError('NIS wajib diisi.'); return; }
    if (!/^\d+$/.test(nis.trim())) { setError('NIS hanya boleh berisi angka.'); return; }
    if (!nama.trim()) { setError('Nama lengkap wajib diisi.'); return; }
    if (!kelas.trim()) { setError('Kelas wajib diisi.'); return; }
    if (password.length < 6) { setError('Password minimal 6 karakter.'); return; }
    if (password !== konfirmPassword) { setError('Password dan konfirmasi password tidak cocok.'); return; }

    setIsLoading(true);
    try {
      const result = await apiRegister({ nis_nip: nis.trim(), nama: nama.trim(), email: email.trim() || undefined, kelas_jabatan: kelas.trim(), organisasi: organisasi.trim() || undefined, password });

      // Sync ke localStorage agar langsung bisa login tanpa reload
      const newUser: UserType = {
        id: nis.trim(),
        nis_nip: nis.trim(),
        nama: nama.trim(),
        email: email.trim() || '',
        role: 'siswa',
        kelas_jabatan: kelas.trim(),
        organisasi: organisasi.trim() || undefined,
        password,
        ...(result.user as object),
      };
      const existing = getUsers();
      if (!existing.find((u) => u.nis_nip === newUser.nis_nip)) {
        saveUsers([...existing, newUser]);
      }

      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal mendaftar. Coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-slate-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-24 w-96 h-96 bg-slate-100 rounded-full blur-3xl pointer-events-none" />

      <div className="flex-1 flex items-center justify-center p-4 relative">
        <div className="w-full max-w-md">

          {/* Brand header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 bg-slate-700 text-white flex items-center justify-center rounded-2xl shadow-lg shadow-slate-700/20 mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">SIPINJAM</h1>
            <p className="text-sm font-medium text-gray-500 mt-1">SMA Negeri 1 Sentolo</p>
            <p className="text-xs text-gray-400 mt-0.5">Daftar Akun Peminjam Baru</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-6 md:p-7">
            <h2 className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-slate-600" />
              Buat Akun Baru
            </h2>
            <p className="text-xs text-gray-400 mb-5">Akun untuk siswa yang ingin meminjam inventaris sekolah.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-xs text-red-700 border border-red-200 rounded-lg flex items-start gap-2">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* NIS */}
              <div>
                <label className={labelClass}>NIS (Nomor Induk Siswa) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="Contoh: 12345"
                    value={nis}
                    onChange={(e) => setNis(e.target.value)}
                    className={inputClass}
                    disabled={isLoading}
                    inputMode="numeric"
                    maxLength={20}
                    required
                  />
                </div>
              </div>

              {/* Nama */}
              <div>
                <label className={labelClass}>Nama Lengkap <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Contoh: Dimas Aditya"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className={inputClassNoIcon}
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Kelas & Organisasi side-by-side */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Kelas <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="Contoh: XI IPS 1"
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    className={inputClassNoIcon}
                    disabled={isLoading}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Organisasi <span className="text-xs text-gray-400 font-normal">(opsional)</span></label>
                  <input
                    type="text"
                    placeholder="Contoh: OSIS"
                    value={organisasi}
                    onChange={(e) => setOrganisasi(e.target.value)}
                    className={inputClassNoIcon}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className={labelClass}>Email <span className="text-xs text-gray-400 font-normal">(opsional)</span></label>
                <input
                  type="email"
                  placeholder="Contoh: dimas@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClassNoIcon}
                  disabled={isLoading}
                />
              </div>

              {/* Password */}
              <div>
                <label className={labelClass}>Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Minimal 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputClass} pr-10`}
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Konfirmasi Password */}
              <div>
                <label className={labelClass}>Konfirmasi Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type={showKonfirm ? 'text' : 'password'}
                    placeholder="Ulangi password"
                    value={konfirmPassword}
                    onChange={(e) => setKonfirmPassword(e.target.value)}
                    className={`${inputClass} pr-10 ${konfirmPassword && konfirmPassword !== password ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowKonfirm((v) => !v)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showKonfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {konfirmPassword && konfirmPassword !== password && (
                  <p className="text-xs text-red-500 mt-1">Password tidak cocok.</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-slate-700 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer mt-1"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                {isLoading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
              </button>

              {/* Back to login */}
              <button
                type="button"
                onClick={onBack}
                className="w-full h-10 flex items-center justify-center gap-1.5 text-xs font-medium text-gray-500 hover:text-slate-700 transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Sudah punya akun? Masuk di sini
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-gray-400 mt-5">
            Akun baru berstatus <span className="font-medium">Siswa</span>. Hubungi TU untuk akun Guru.
          </p>
        </div>
      </div>
    </div>
  );
}
