/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, UserRole } from '../types';
import { ShieldCheck, LogOut, LayoutDashboard, Boxes, ClipboardList, Info, Database, ShoppingBag, History, UserCog } from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  daftarPinjamCount?: number;
  onOpenDaftarPinjam?: () => void;
}

interface NavItem {
  key: string;
  label: string;
  shortLabel: string;
  icon: typeof LayoutDashboard;
  isActive: (tab: string) => boolean;
}

export default function Navbar({ currentUser, activeTab, setActiveTab, onLogout, daftarPinjamCount = 0, onOpenDaftarPinjam }: NavbarProps) {
  const peminjamNav: NavItem[] = [
    { key: 'dashboard', label: 'Beranda', shortLabel: 'Beranda', icon: LayoutDashboard, isActive: (t) => t === 'dashboard' },
    { key: 'katalog', label: 'Katalog Barang', shortLabel: 'Katalog', icon: Boxes, isActive: (t) => t === 'katalog' || t.startsWith('barang_') },
    { key: 'peminjaman_saya', label: 'Peminjaman Saya', shortLabel: 'Pinjaman', icon: ClipboardList, isActive: (t) => t === 'peminjaman_saya' },
  ];

  const adminNav: NavItem[] = [
    { key: 'dashboard', label: 'Dashboard TU', shortLabel: 'Dashboard', icon: LayoutDashboard, isActive: (t) => t === 'dashboard' },
    { key: 'katalog', label: 'Pratinjau Katalog', shortLabel: 'Katalog', icon: Boxes, isActive: (t) => t === 'katalog' },
    { key: 'admin_inventaris', label: 'Kelola Inventaris', shortLabel: 'Inventaris', icon: Database, isActive: (t) => t === 'admin_inventaris' },
    { key: 'admin_riwayat', label: 'Riwayat Pinjam', shortLabel: 'Riwayat', icon: History, isActive: (t) => t === 'admin_riwayat' },
    { key: 'admin_pengaturan', label: 'Pengaturan Surat', shortLabel: 'Surat', icon: Info, isActive: (t) => t === 'admin_pengaturan' },
  ];

  const navItems = currentUser.role === 'admin' ? adminNav : peminjamNav;

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'Admin TU';
      case 'guru': return 'Guru';
      default: return 'Siswa';
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 font-sans">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">

          {/* Brand */}
          <button
            type="button"
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-9 h-9 bg-slate-700 flex items-center justify-center rounded-xl shadow-sm group-hover:bg-slate-800 transition-colors">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <span className="font-bold text-base text-gray-900 block leading-none tracking-tight">SIPINJAM</span>
              <span className="text-[11px] text-gray-400 leading-none block mt-1">SMAN 1 Sentolo</span>
            </div>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.isActive(activeTab);
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveTab(item.key)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    active ? 'bg-slate-100 text-slate-800' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right: actions + user */}
          <div className="flex items-center gap-2 sm:gap-3">
            {(currentUser.role === 'siswa' || currentUser.role === 'guru') && (
              <button
                onClick={onOpenDaftarPinjam}
                className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
                title="Lihat Daftar Pinjam"
              >
                <ShoppingBag className="w-5 h-5" />
                {daftarPinjamCount > 0 && (
                  <span className="absolute top-0.5 right-0 bg-slate-700 text-white text-[9px] font-semibold px-1 min-w-[16px] h-4 flex items-center justify-center rounded-full leading-none translate-x-1/4 -translate-y-1/4 ring-2 ring-white">
                    {daftarPinjamCount}
                  </span>
                )}
              </button>
            )}

            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900 leading-none">{currentUser.nama}</p>
              <span className="text-[11px] font-medium text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded inline-block mt-1 leading-none">
                {getRoleLabel(currentUser.role)}
              </span>
            </div>

            <button
              onClick={() => setActiveTab('profil_saya')}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${activeTab === 'profil_saya' ? 'bg-slate-100 text-slate-800' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'}`}
              title="Edit Profil"
            >
              <UserCog className="w-4 h-4" />
            </button>

            <div className="h-7 w-px bg-gray-200 hidden sm:block"></div>

            <button
              onClick={onLogout}
              className="flex items-center justify-center p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
              title="Keluar dari Akun"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-1 z-50">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive(activeTab);
          return (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`flex flex-col items-center flex-1 py-1.5 text-[10px] font-medium gap-1 transition-colors ${
                active ? 'text-slate-800' : 'text-gray-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.shortLabel}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
