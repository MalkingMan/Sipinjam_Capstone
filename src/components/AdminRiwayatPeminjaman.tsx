/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo, useState } from 'react';
import { Download, History, Search, FileSpreadsheet, ClipboardList } from 'lucide-react';
import { getBarang, getPeminjaman } from '../data/db';
import { Peminjaman } from '../types';

export default function AdminRiwayatPeminjaman() {
  const allLoans = getPeminjaman();
  const allBarang = getBarang();
  const [searchTerm, setSearchTerm] = useState('');

  const historyLoans = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return [...allLoans]
      .filter((loan) => {
        if (!normalizedSearch) return true;

        const itemSummary = loan.items
          .map((item) => {
            const barang = allBarang.find((b) => b.id === item.barang_id);
            return `${barang?.nama ?? 'Barang'} ${item.jumlah}`;
          })
          .join(' ')
          .toLowerCase();

        return [loan.kode, loan.peminjam_nama, loan.keperluan, itemSummary].some((value) => value.includes(normalizedSearch));
      })
      .sort((a, b) => new Date(b.tgl_pengajuan).getTime() - new Date(a.tgl_pengajuan).getTime());
  }, [allLoans, allBarang, searchTerm]);

  const getStatusLabel = (status: Peminjaman['status']) => {
    switch (status) {
      case 'menunggu_surat':
        return 'Menunggu Surat';
      case 'menunggu':
        return 'Menunggu Verifikasi';
      case 'disetujui':
        return 'Disetujui';
      case 'dipinjam':
        return 'Dipinjam';
      case 'selesai':
        return 'Selesai';
      case 'terlambat':
        return 'Terlambat';
      case 'ditolak':
        return 'Ditolak';
      default:
        return status;
    }
  };

  const getItemSummary = (loan: Peminjaman) =>
    loan.items
      .map((item) => {
        const barang = allBarang.find((b) => b.id === item.barang_id);
        return `${barang?.nama ?? 'Barang'} ×${item.jumlah}`;
      })
      .join(', ');

  const handleExportExcel = () => {
    const rows = [
      ['Tanggal', 'Nama Peminjam', 'Barang & Alat yang Dipinjam', 'Status'],
      ...historyLoans.map((loan) => [loan.tgl_pengajuan, loan.peminjam_nama, getItemSummary(loan), getStatusLabel(loan.status)]),
    ];

    const escapeCsvValue = (value: string | number) => {
      const stringValue = String(value ?? '');
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const csvContent = rows.map((row) => row.map(escapeCsvValue).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `riwayat-peminjaman-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 font-sans">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[#1E3A8A]">
            <History className="w-5 h-5" />
            <h2 className="text-xl font-semibold text-gray-900">Riwayat Peminjaman Barang</h2>
          </div>
          <p className="text-sm text-gray-500 mt-1">Laporan lengkap seluruh peminjaman yang pernah diajukan dan diproses oleh Tata Usaha.</p>
        </div>

        <button
          type="button"
          onClick={handleExportExcel}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0d635c] cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Export ke Excel/CSV
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <ClipboardList className="w-4 h-4" />
            <span>{historyLoans.length} riwayat peminjaman terdaftar</span>
          </div>

          <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama, barang, atau kode..."
              className="w-full bg-transparent outline-none placeholder:text-gray-400"
            />
          </label>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left font-semibold text-gray-700">Tanggal</th>
                <th className="px-3 py-3 text-left font-semibold text-gray-700">Nama Peminjam</th>
                <th className="px-3 py-3 text-left font-semibold text-gray-700">Barang & Alat Dipinjam</th>
                <th className="px-3 py-3 text-left font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {historyLoans.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center text-sm text-gray-500">
                    Tidak ada riwayat peminjaman yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                historyLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3 whitespace-nowrap text-gray-700">{loan.tgl_pengajuan}</td>
                    <td className="px-3 py-3 text-gray-700">
                      <div className="font-medium">{loan.peminjam_nama}</div>
                      <div className="text-xs text-gray-500">{loan.peminjam_kelas}</div>
                    </td>
                    <td className="px-3 py-3 text-gray-700">{getItemSummary(loan)}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                        {getStatusLabel(loan.status)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
