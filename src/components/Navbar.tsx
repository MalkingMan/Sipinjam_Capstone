/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, UserRole } from '../types';
import { ShieldCheck, LogOut, LayoutDashboard, Boxes, ClipboardList, Info, Users, Database, ShoppingBag } from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  daftarPinjamCount?: number;
  onOpenDaftarPinjam?: () => void;
}

export default function Navbar({ currentUser, activeTab, setActiveTab, onLogout, daftarPinjamCount = 0, onOpenDaftarPinjam }: NavbarProps) {
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <span className="bg-purple-100 text-purple-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Admin TU</span>;
      case 'guru':
        return <span className="bg-[#CCFBF1] text-[#0F766E] text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Guru</span>;
      default:
        return <span className="bg-blue-100 text-[#1E3A8A] text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Siswa / OSIS</span>;
    }
  };

  return (
    <nav className="bg-[#1E3A8A] text-white shadow-md sticky top-0 z-50 font-sans">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          
          {/* Brand Logo and Title */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-9 h-9 bg-white text-[#1E3A8A] flex items-center justify-center rounded-lg shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-wider block leading-none">SIPINJAM</span>
              <span className="text-[9px] text-[#CCD9FF] font-medium leading-none block mt-0.5">SMAN 1 Sentolo</span>
            </div>
          </div>

          {/* Navigation Links - Desktop and Tablet */}
          <div className="hidden md:flex items-center gap-1">
            
            {/* Siswa & Guru General Sections */}
            {(currentUser.role === 'siswa' || currentUser.role === 'guru') && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                    activeTab === 'dashboard' ? 'bg-white/15 text-white' : 'text-slate-200 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Beranda</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('katalog')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                    activeTab === 'katalog' || activeTab.startsWith('barang_') ? 'bg-white/15 text-white' : 'text-slate-200 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Boxes className="w-4 h-4" />
                  <span>Katalog Barang</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('peminjaman_saya')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                    activeTab === 'peminjaman_saya' ? 'bg-white/15 text-white' : 'text-slate-200 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>Peminjaman Saya</span>
                </button>
              </>
            )}

            {/* Admin Specific Sections */}
            {currentUser.role === 'admin' && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                    activeTab === 'dashboard' ? 'bg-white/15 text-white' : 'text-slate-200 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard TU</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('katalog')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                    activeTab === 'katalog' ? 'bg-white/15 text-white' : 'text-slate-200 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Boxes className="w-4 h-4" />
                  <span>Pratinjau Katalog</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('admin_inventaris')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                    activeTab === 'admin_inventaris' ? 'bg-white/15 text-white' : 'text-slate-200 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Database className="w-4 h-4" />
                  <span>Kelola Inventaris</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('admin_pengaturan')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                    activeTab === 'admin_pengaturan' ? 'bg-white/15 text-white' : 'text-slate-200 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Info className="w-4 h-4" />
                  <span>Pengaturan Surat</span>
                </button>
              </>
            )}
          </div>

          {/* User Bio and Logout Action */}
          <div className="flex items-center gap-4">
            {(currentUser.role === 'siswa' || currentUser.role === 'guru') && (
              <button
                onClick={onOpenDaftarPinjam}
                className="relative p-2 rounded-lg text-white hover:bg-white/10 transition-colors flex items-center justify-center mr-1"
                title="Lihat Daftar Pinjam"
              >
                <ShoppingBag className="w-5 h-5" />
                {daftarPinjamCount > 0 && (
                  <span className="absolute top-1 right-0 bg-red-500 text-white text-[10px] items-center justify-center flex font-bold px-1.5 py-0.5 min-w-[18px] rounded-full leading-none transform translate-x-1/4 -translate-y-1/4">
                    {daftarPinjamCount}
                  </span>
                )}
              </button>
            )}
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold leading-none">{currentUser.nama}</p>
              <div className="flex items-center gap-1.5 justify-end mt-1">
                {getRoleBadge(currentUser.role)}
                <span className="text-[10px] text-[#CCD9FF]">{currentUser.kelas_jabatan}</span>
              </div>
            </div>

            <div className="h-8 w-px bg-white/20 hidden sm:block"></div>

            <button
              onClick={onLogout}
              className="flex items-center justify-center p-2 rounded-lg text-slate-100 hover:bg-red-700/30 hover:text-red-200 transition-colors cursor-pointer"
              title="Keluar dari Akun"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>

      {/* Navigation Links - Mobile Bottom Bar for native feel */}
      <div className="md:hidden bg-[#183073] border-t border-[#1E3A8A] flex justify-around py-1">
        
        {(currentUser.role === 'siswa' || currentUser.role === 'guru') && (
          <>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center flex-1 py-1 text-[10px] font-semibold tracking-wide ${
                activeTab === 'dashboard' ? 'text-white' : 'text-slate-300'
              }`}
            >
              <LayoutDashboard className="w-4.5 h-4.5 mb-1" />
              Beranda
            </button>

            <button
              onClick={() => setActiveTab('katalog')}
              className={`flex flex-col items-center flex-1 py-1 text-[10px] font-semibold tracking-wide ${
                activeTab === 'katalog' || activeTab.startsWith('barang_') ? 'text-white' : 'text-slate-300'
              }`}
            >
              <Boxes className="w-4.5 h-4.5 mb-1" />
              Katalog
            </button>

            <button
              onClick={() => setActiveTab('peminjaman_saya')}
              className={`flex flex-col items-center flex-1 py-1 text-[10px] font-semibold tracking-wide ${
                activeTab === 'peminjaman_saya' ? 'text-white' : 'text-slate-300'
              }`}
            >
              <ClipboardList className="w-4.5 h-4.5 mb-1" />
              Status Selesai
            </button>
          </>
        )}

        {currentUser.role === 'admin' && (
          <>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center flex-1 py-1 text-[10px] font-semibold tracking-wide ${
                activeTab === 'dashboard' ? 'text-white' : 'text-slate-300'
              }`}
            >
              <LayoutDashboard className="w-4.5 h-4.5 mb-1" />
              Dashboard TU
            </button>

            <button
              onClick={() => setActiveTab('katalog')}
              className={`flex flex-col items-center flex-1 py-1 text-[10px] font-semibold tracking-wide ${
                activeTab === 'katalog' ? 'text-white' : 'text-slate-300'
              }`}
            >
              <Boxes className="w-4.5 h-4.5 mb-1" />
              Pratinjau
            </button>

            <button
              onClick={() => setActiveTab('admin_inventaris')}
              className={`flex flex-col items-center flex-1 py-1 text-[10px] font-semibold tracking-wide ${
                activeTab === 'admin_inventaris' ? 'text-white' : 'text-slate-300'
              }`}
            >
              <Database className="w-4.5 h-4.5 mb-1" />
              Kelola Barang
            </button>

            <button
              onClick={() => setActiveTab('admin_pengaturan')}
              className={`flex flex-col items-center flex-1 py-1 text-[10px] font-semibold tracking-wide ${
                activeTab === 'admin_pengaturan' ? 'text-white' : 'text-slate-300'
              }`}
            >
              <Info className="w-4.5 h-4.5 mb-1" />
              Surat
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
