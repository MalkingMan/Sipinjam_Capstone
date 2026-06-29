/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, User, Key, Info, ArrowRight } from 'lucide-react';
import { User as UserType } from '../types';
import { getUsers } from '../data/db';

interface LoginViewProps {
  onLoginSuccess: (user: UserType) => void;
}

const DEMO_ACCOUNTS = [
  { nis: '12345678', nama: 'Dimas Aditya', role: 'Siswa', detail: 'NIS 12345678 · Pengurus OSIS', badge: 'bg-slate-100 text-slate-700' },
  { nis: '1980110301', nama: 'Bu Sri Ratri, S.Pd.', role: 'Guru', detail: 'NIP 1980110301 · Pembina Pramuka', badge: 'bg-sky-50 text-sky-700' },
  { nis: '1978052402', nama: 'Pak Bagas Setyawan', role: 'Admin TU', detail: 'NIP 1978052402 · Tata Usaha Sarpras', badge: 'bg-violet-50 text-violet-700' },
];

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [nisNip, setNisNip] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nisNip || !password) {
      setError('NIS / NIP dan password wajib diisi.');
      return;
    }

    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      const users = getUsers();
      const matchedUser = users.find(
        (u) => u.nis_nip === nisNip.trim() && u.password === password
      );

      setIsLoading(false);
      if (matchedUser) {
        onLoginSuccess(matchedUser);
      } else {
        setError('NIS/NIP atau Password salah. Silakan coba lagi.');
      }
    }, 600);
  };

  const handleQuickLogin = (userNis: string) => {
    setIsLoading(true);
    setError(null);
    setNisNip(userNis);
    setPassword('password123');

    setTimeout(() => {
      const users = getUsers();
      const matchedUser = users.find((u) => u.nis_nip === userNis);
      setIsLoading(false);
      if (matchedUser) {
        onLoginSuccess(matchedUser);
      }
    }, 400);
  };

  const handleForgotPassword = () => {
    alert('Bantuan Lupa Kata Sandi: Silakan hubungi Pak Bagas di Ruang Tata Usaha (Sarpras) untuk mencocokkan identitas dan melakukan reset password.');
  };

  return (
    <div id="login_screen" className="min-h-screen bg-slate-50 flex flex-col font-sans relative overflow-hidden">
      {/* Soft decorative gradient blobs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-slate-200/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -left-24 w-96 h-96 bg-slate-100 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex-1 flex items-center justify-center p-4 relative">
        <div className="w-full max-w-md">
          {/* Brand header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 bg-slate-700 text-white flex items-center justify-center rounded-2xl shadow-lg shadow-slate-700/20 mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">SIPINJAM</h1>
            <p className="text-sm font-medium text-gray-500 mt-1">SMA Negeri 1 Sentolo</p>
            <p className="text-xs text-gray-400 mt-0.5">Sistem Peminjaman Barang Inventaris</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-6 md:p-7">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Masuk ke akun Anda</h2>
            <p className="text-xs text-gray-400 mb-5">Gunakan Nomor Induk dan kata sandi sekolah.</p>

            <form id="login-form" onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-xs text-red-700 border border-red-200 rounded-lg flex items-start gap-2 animate-fade-in">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="nis_nip_field" className="block text-xs font-medium text-gray-600 mb-1.5">
                  Nomor Induk (NIS / NIP)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="nis_nip_field"
                    type="text"
                    placeholder="Contoh: 12345678"
                    value={nisNip}
                    onChange={(e) => setNisNip(e.target.value)}
                    className="w-full h-11 pl-9 pr-3 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-500/30 focus:border-slate-500 focus:bg-white transition-all"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="password_field" className="text-xs font-medium text-gray-600">
                    Kata Sandi
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs font-medium text-slate-700 hover:text-slate-900 hover:underline focus:outline-none"
                    tabIndex={-1}
                  >
                    Lupa password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    id="password_field"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Masukkan kata sandi..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 pl-9 pr-10 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-500/30 focus:border-slate-500 focus:bg-white transition-all"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="submit_login_btn"
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-slate-700/20"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <>
                    Masuk ke Sistem
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Login Section */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <h3 className="text-xs font-medium text-gray-400 mb-3 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                Akses simulasi cepat (Demo)
              </h3>
              <div className="space-y-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.nis}
                    type="button"
                    onClick={() => handleQuickLogin(acc.nis)}
                    disabled={isLoading}
                    className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-slate-300 bg-white hover:bg-slate-100/40 transition-all text-xs flex justify-between items-center group cursor-pointer disabled:opacity-50"
                  >
                    <div>
                      <p className="font-semibold text-gray-800 flex items-center gap-1.5">
                        {acc.nama}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${acc.badge}`}>{acc.role}</span>
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{acc.detail}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-slate-700 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-xs text-gray-400">© 2026 SIPINJAM · SMAN 1 Sentolo, Kulon Progo, DIY</p>
            <p className="text-[10px] text-gray-400 mt-1">
              Hubungi Sub-Seksi Sarpras Tata Usaha jika NIP/NIS Anda belum terdaftar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
