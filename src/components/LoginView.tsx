/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, User, Key, Info } from 'lucide-react';
import { User as UserType } from '../types';
import { getUsers } from '../data/db';

interface LoginViewProps {
  onLoginSuccess: (user: UserType) => void;
}

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

  return (
    <div id="login_screen" className="min-h-screen bg-gray-50 flex flex-col justify-between p-4 font-sans">
      <div></div>

      {/* Main card */}
      <div className="w-full max-w-md mx-auto my-auto">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8 relative overflow-hidden">
          {/* Accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#1E3A8A]"></div>

          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 bg-[#1E3A8A] text-white flex items-center justify-center rounded-xl mb-3">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-semibold text-[#1E3A8A]">
              Sipinjam
            </h1>
            <p className="text-xs font-medium text-gray-500 mt-1">SMA Negeri 1 Sentolo</p>
            <p className="text-xs text-gray-400 mt-0.5">Sistem Peminjaman Barang Inventaris</p>
          </div>

          {/* Form */}
          <form id="login-form" onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-xs text-red-700 border border-red-200 rounded-lg flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="nis_nip_field"
                className="block text-xs font-medium text-gray-600 mb-1"
              >
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
                  className="w-full h-9 pl-9 pr-3 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label
                  htmlFor="password_field"
                  className="text-xs font-medium text-gray-600"
                >
                  Kata Sandi
                </label>
                <button
                  type="button"
                  onClick={() => setIsValidPassHelp()}
                  className="text-xs text-[#1E3A8A] hover:underline focus:outline-none"
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
                  className="w-full h-9 pl-9 pr-10 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
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
              className="w-full h-10 bg-[#1E3A8A] hover:bg-[#1e40af] text-white rounded-lg text-sm font-medium active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Memverifikasi...</span>
                </div>
              ) : (
                'Masuk ke Sistem →'
              )}
            </button>
          </form>

          {/* Quick Login Section */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <h3 className="text-xs font-medium text-gray-400 mb-3 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              Akses simulasi cepat (Demo):
            </h3>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('12345678')}
                className="w-full text-left p-2.5 rounded-lg border border-gray-100 hover:border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors text-xs flex justify-between items-center group cursor-pointer"
              >
                <div>
                  <p className="font-medium text-gray-800">Dimas Aditya <span className="bg-blue-50 text-blue-700 text-[10px] px-1.5 py-0.5 rounded font-medium ml-1">Siswa</span></p>
                  <p className="text-[10px] text-gray-400 mt-0.5">NIS: 12345678 — Pengurus OSIS</p>
                </div>
                <span className="text-[10px] font-medium text-[#1E3A8A] group-hover:underline">Gunakan →</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('1980110301')}
                className="w-full text-left p-2.5 rounded-lg border border-gray-100 hover:border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors text-xs flex justify-between items-center group cursor-pointer"
              >
                <div>
                  <p className="font-medium text-gray-800">Bu Sri Ratri, S.Pd. <span className="bg-teal-50 text-teal-700 text-[10px] px-1.5 py-0.5 rounded font-medium ml-1">Guru</span></p>
                  <p className="text-[10px] text-gray-400 mt-0.5">NIP: 1980110301 — Pembina Pramuka</p>
                </div>
                <span className="text-[10px] font-medium text-[#1E3A8A] group-hover:underline">Gunakan →</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('1978052402')}
                className="w-full text-left p-2.5 rounded-lg border border-gray-100 hover:border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors text-xs flex justify-between items-center group cursor-pointer"
              >
                <div>
                  <p className="font-medium text-gray-800">Pak Bagas Setyawan <span className="bg-purple-50 text-purple-700 text-[10px] px-1.5 py-0.5 rounded font-medium ml-1">Admin TU</span></p>
                  <p className="text-[10px] text-gray-400 mt-0.5">NIP: 1978052402 — Tata Usaha Sarpras</p>
                </div>
                <span className="text-[10px] font-medium text-[#1E3A8A] group-hover:underline">Gunakan →</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4">
        <p className="text-xs text-gray-400">
          © 2026 SIPINJAM · SMAN 1 Sentolo, Kulon Progo, DIY
        </p>
        <p className="text-[10px] text-gray-400 mt-1">
          Hubungi Sub-Seksi Sarpras Tata Usaha jika NIP/NIS Anda belum terdaftar.
        </p>
      </div>
    </div>
  );

  function setIsValidPassHelp() {
    alert('Bantuan Lupa Kata Sandi: Silakan hubungi Pak Bagas di Ruang Tata Usaha (Sarpras) untuk mencocokkan identitas dan melakukan reset password.');
  }
}
