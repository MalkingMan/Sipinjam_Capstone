/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, UserRole } from '../types';
import { ShieldCheck, LogOut, LayoutDashboard, Boxes, ClipboardList, Info, Database, ShoppingBag, History } from 'lucide-react';

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
        return <span className="bg-gray-700 text-gray-300 text-[10px] font-medium px-2 py-0.5 rounded-full">Admin TU</span>;
      case 'guru':
        return <span className="bg-gray-700 text-gray-300 text-[10px] font-medium px-2 py-0.5 rounded-full">Guru</span>;
      default:
        return <span className="bg-gray-700 text-gray-300 text-[10px] font-medium px-2 py-0.5 rounded-full">Siswa</span>;
    }
  };

  return (
    <nav className="bg-[#1F2937] text-white shadow-md sticky top-0 z-50 font-sans">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-14">

          {/* Brand */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-8 h-8 bg-white/10 flex items-center justify-center rounded-lg">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-semibold text-base text-white block leading-none">SIPINJAM</span>
              <span className="text-[10px] text-gray-400 leading-none block mt-0.5">SMAN 1 Sentolo</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {(currentUser.role === 'siswa' || currentUser.role === 'guru') && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors cursor-pointer ${
                    activeTab === 'dashboard' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Beranda</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('katalog')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors cursor-pointer ${
                    activeTab === 'katalog' || activeTab.startsWith('barang_') ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                  }`}
                >
                  <Boxes className="w-4 h-4" />
                  <span>Katalog Barang</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('peminjaman_saya')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors cursor-pointer ${
                    activeTab === 'peminjaman_saya' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                  }`}
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>Peminjaman Saya</span>
                </button>
              </>
            )}

            {currentUser.role === 'admin' && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors cursor-pointer ${
                    activeTab === 'dashboard' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard TU</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('katalog')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors cursor-pointer ${
                    activeTab === 'katalog' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                  }`}
                >
                  <Boxes className="w-4 h-4" />
                  <span>Pratinjau Katalog</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('admin_inventaris')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors cursor-pointer ${
                    activeTab === 'admin_inventaris' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                  }`}
                >
                  <Database className="w-4 h-4" />
                  <span>Kelola Inventaris</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('admin_riwayat')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors cursor-pointer ${
                    activeTab === 'admin_riwayat' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span>Riwayat Pinjam</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('admin_pengaturan')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors cursor-pointer ${
                    activeTab === 'admin_pengaturan' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                  }`}
                >
                  <Info className="w-4 h-4" />
                  <span>Pengaturan Surat</span>
                </button>
              </>
            )}
          </div>

          {/* Right: User info + actions */}
          <div className="flex items-center gap-3">
            {(currentUser.role === 'siswa' || currentUser.role === 'guru') && (
              <button
                onClick={onOpenDaftarPinjam}
                className="relative p-2 rounded-md text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors"
                title="Lihat Daftar Pinjam"
              >
                <ShoppingBag className="w-5 h-5" />
                {daftarPinjamCount > 0 && (
                  <span className="absolute top-0.5 right-0 bg-red-500 text-white text-[9px] font-medium px-1 min-w-[16px] h-4 flex items-center justify-center rounded-full leading-none translate-x-1/4 -translate-y-1/4">
                    {daftarPinjamCount}
                  </span>
                )}
              </button>
            )}

            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white leading-none">{currentUser.nama}</p>
              <div className="flex items-center gap-1.5 justify-end mt-1">
                {getRoleBadge(currentUser.role)}
              </div>
            </div>

            <div className="h-6 w-px bg-gray-600 hidden sm:block"></div>

            <button
              onClick={onLogout}
              className="flex items-center justify-center p-1.5 rounded-md text-gray-400 hover:bg-red-900/30 hover:text-red-400 transition-colors cursor-pointer"
              title="Keluar dari Akun"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="md:hidden bg-[#1a2535] border-t border-gray-700 flex justify-around py-1">
        {(currentUser.role === 'siswa' || currentUser.role === 'guru') && (
          <>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center flex-1 py-1.5 text-[10px] font-medium gap-0.5 ${
                activeTab === 'dashboard' ? 'text-white' : 'text-gray-500'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Beranda
            </button>
            <button
              onClick={() => setActiveTab('katalog')}
              className={`flex flex-col items-center flex-1 py-1.5 text-[10px] font-medium gap-0.5 ${
                activeTab === 'katalog' || activeTab.startsWith('barang_') ? 'text-white' : 'text-gray-500'
              }`}
            >
              <Boxes className="w-4 h-4" />
              Katalog
            </button>
            <button
              onClick={() => setActiveTab('peminjaman_saya')}
              className={`flex flex-col items-center flex-1 py-1.5 text-[10px] font-medium gap-0.5 ${
                activeTab === 'peminjaman_saya' ? 'text-white' : 'text-gray-500'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              Peminjaman
            </button>
          </>
        )}

        {currentUser.role === 'admin' && (
          <>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center flex-1 py-1.5 text-[10px] font-medium gap-0.5 ${
                activeTab === 'dashboard' ? 'text-white' : 'text-gray-500'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('katalog')}
              className={`flex flex-col items-center flex-1 py-1.5 text-[10px] font-medium gap-0.5 ${
                activeTab === 'katalog' ? 'text-white' : 'text-gray-500'
              }`}
            >
              <Boxes className="w-4 h-4" />
              Katalog
            </button>
            <button
              onClick={() => setActiveTab('admin_inventaris')}
              className={`flex flex-col items-center flex-1 py-1.5 text-[10px] font-medium gap-0.5 ${
                activeTab === 'admin_inventaris' ? 'text-white' : 'text-gray-500'
              }`}
            >
              <Database className="w-4 h-4" />
              Inventaris
            </button>
            <button
              onClick={() => setActiveTab('admin_riwayat')}
              className={`flex flex-col items-center flex-1 py-1.5 text-[10px] font-medium gap-0.5 ${
                activeTab === 'admin_riwayat' ? 'text-white' : 'text-gray-500'
              }`}
            >
              <History className="w-4 h-4" />
              Riwayat
            </button>
            <button
              onClick={() => setActiveTab('admin_pengaturan')}
              className={`flex flex-col items-center flex-1 py-1.5 text-[10px] font-medium gap-0.5 ${
                activeTab === 'admin_pengaturan' ? 'text-white' : 'text-gray-500'
              }`}
            >
              <Info className="w-4 h-4" />
              Surat
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
