/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo, useState } from 'react';
import { History, Search, FileSpreadsheet, ClipboardList, X, User, CalendarDays, Boxes, ChevronRight } from 'lucide-react';
import { getBarang, getPeminjaman } from '../data/db';
import { Peminjaman } from '../types';
import { fmtTgl } from '../utils';

export default function AdminRiwayatPeminjaman() {
  const allLoans = getPeminjaman();
  const allBarang = getBarang();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLoan, setSelectedLoan] = useState<Peminjaman | null>(null);

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

  const getStatusBadgeClass = (status: Peminjaman['status']) => {
    switch (status) {
      case 'menunggu_surat':
      case 'menunggu':
        return 'bg-amber-50 text-amber-700 border border-amber-100';
      case 'disetujui':
        return 'bg-green-50 text-green-700 border border-green-100';
      case 'dipinjam':
        return 'bg-blue-50 text-blue-700 border border-blue-100';
      case 'terlambat':
      case 'ditolak':
        return 'bg-red-50 text-red-700 border border-red-100';
      case 'selesai':
      default:
        return 'bg-gray-100 text-gray-600 border border-gray-200';
    }
  };

  const getKategoriLabel = (kategori: Peminjaman['kategori_kegiatan']) => {
    switch (kategori) {
      case 'osis':
        return 'OSIS';
      case 'ekskul':
        return 'Ekstrakurikuler';
      case 'kelas':
        return 'Kebutuhan Kelas';
      case 'pribadi':
        return 'Keluarga / Pribadi';
      default:
        return kategori;
    }
  };

  const getKondisiLabel = (kondisi?: string) => {
    switch (kondisi) {
      case 'baik':
        return 'Baik';
      case 'rusak_ringan':
        return 'Rusak Ringan';
      case 'rusak_berat':
        return 'Rusak Berat';
      case 'hilang':
        return 'Hilang';
      default:
        return null;
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
    const rows: (string | number)[][] = [
      [
        'No',
        'Kode Peminjaman',
        'Tanggal Pengajuan',
        'Nama Peminjam',
        'Kelas / Jabatan',
        'Barang & Alat yang Dipinjam',
        'Tanggal Mulai Pinjam',
        'Tanggal Kembali (Rencana)',
        'Tanggal Kembali (Aktual)',
        'Status',
      ],
      ...historyLoans.map((loan, index) => [
        index + 1,
        loan.kode,
        fmtTgl(loan.tgl_pengajuan),
        loan.peminjam_nama,
        loan.peminjam_kelas,
        getItemSummary(loan),
        fmtTgl(loan.tgl_mulai),
        fmtTgl(loan.tgl_kembali_rencana),
        fmtTgl(loan.tgl_kembali_aktual),
        getStatusLabel(loan.status),
      ]),
    ];

    const escapeCsvValue = (value: string | number) => {
      const stringValue = String(value ?? '');
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const csvContent = rows.map((row) => row.map(escapeCsvValue).join(',')).join('\r\n');
    // BOM (﻿) agar Excel membaca UTF-8 dengan benar (teks Indonesia & simbol rapi)
    const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' });
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
          <div className="flex items-center gap-2 text-[#334155]">
            <History className="w-5 h-5" />
            <h2 className="text-xl font-semibold text-gray-900">Riwayat Peminjaman Barang</h2>
          </div>
          <p className="text-sm text-gray-500 mt-1">Laporan lengkap seluruh peminjaman yang pernah diajukan dan diproses oleh Tata Usaha.</p>
        </div>

        <button
          type="button"
          onClick={handleExportExcel}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#16A34A] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#15803D] cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Export ke Excel/CSV
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-soft">
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
                <th className="px-3 py-3 text-right font-semibold text-gray-700">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {historyLoans.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-sm text-gray-500">
                    Tidak ada riwayat peminjaman yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                historyLoans.map((loan) => (
                  <tr
                    key={loan.id}
                    onClick={() => setSelectedLoan(loan)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-3 py-3 whitespace-nowrap text-gray-700">{fmtTgl(loan.tgl_pengajuan)}</td>
                    <td className="px-3 py-3 text-gray-700">
                      <div className="font-medium">{loan.peminjam_nama}</div>
                      <div className="text-xs text-gray-500">{loan.peminjam_kelas}</div>
                    </td>
                    <td className="px-3 py-3 text-gray-700">{getItemSummary(loan)}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadgeClass(loan.status)}`}>
                        {getStatusLabel(loan.status)}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-[#334155]">
                        Lihat <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedLoan && (
        <div
          className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedLoan(null)}
        >
          <div
            className="bg-white rounded-2xl border border-gray-200 w-full max-w-lg overflow-hidden flex flex-col shadow-lg animate-scale-up max-h-[88vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-2 text-[#334155]">
                <History className="w-4 h-4" />
                <span className="font-semibold text-sm text-gray-900">Detail Riwayat Peminjaman</span>
              </div>
              <button
                onClick={() => setSelectedLoan(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 text-sm text-gray-700 space-y-4 overflow-y-auto">
              {/* Kode + Status */}
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div>
                  <span className="text-xs text-gray-400 font-medium block">Kode Transaksi</span>
                  <span className="font-semibold text-[#334155] text-base">{selectedLoan.kode}</span>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadgeClass(selectedLoan.status)}`}>
                  {getStatusLabel(selectedLoan.status)}
                </span>
              </div>

              {/* Peminjam */}
              <div className="border border-gray-100 rounded-xl p-3 space-y-1">
                <p className="font-medium text-gray-900 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-gray-400" />
                  {selectedLoan.peminjam_nama}
                </p>
                <p className="text-xs text-gray-400">
                  {selectedLoan.peminjam_kelas} · {selectedLoan.peminjam_role.toUpperCase()}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  <span className="bg-gray-100 text-gray-600 border border-gray-200 text-[11px] font-medium px-2 py-0.5 rounded">
                    {getKategoriLabel(selectedLoan.kategori_kegiatan)}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1.5 leading-snug">"{selectedLoan.keperluan}"</p>
              </div>

              {/* Items */}
              <div className="space-y-1.5">
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wide flex items-center gap-1.5">
                  <Boxes className="w-3.5 h-3.5" /> Barang yang Dipinjam
                </span>
                {selectedLoan.items.map((it, idx) => {
                  const match = allBarang.find((b) => b.id === it.barang_id);
                  const kondisi = getKondisiLabel(it.kondisi_kembali);
                  return (
                    <div key={idx} className="flex justify-between items-center p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                      <div>
                        <span className="font-medium text-gray-800 block">{match ? match.nama : 'Barang'}</span>
                        {kondisi && (
                          <span className="text-[11px] text-gray-400">Kondisi kembali: {kondisi}</span>
                        )}
                      </div>
                      <span className="font-semibold text-[#334155] shrink-0">×{it.jumlah} Unit</span>
                    </div>
                  );
                })}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 border border-gray-100 rounded-lg bg-gray-50">
                  <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wide flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" /> Pengajuan
                  </span>
                  <span className="font-semibold text-gray-800 block mt-0.5 text-sm">{fmtTgl(selectedLoan.tgl_pengajuan)}</span>
                </div>
                <div className="p-2.5 border border-gray-100 rounded-lg bg-gray-50">
                  <span className="text-[11px] text-gray-400 block font-medium uppercase tracking-wide">Mulai Pinjam</span>
                  <span className="font-semibold text-gray-800 block mt-0.5 text-sm">{fmtTgl(selectedLoan.tgl_mulai)}</span>
                </div>
                <div className="p-2.5 border border-gray-100 rounded-lg bg-gray-50">
                  <span className="text-[11px] text-gray-400 block font-medium uppercase tracking-wide">Rencana Kembali</span>
                  <span className="font-semibold text-gray-800 block mt-0.5 text-sm">{fmtTgl(selectedLoan.tgl_kembali_rencana)}</span>
                </div>
                <div className="p-2.5 border border-gray-100 rounded-lg bg-gray-50">
                  <span className="text-[11px] text-gray-400 block font-medium uppercase tracking-wide">Kembali Aktual</span>
                  <span className="font-semibold text-gray-800 block mt-0.5 text-sm">{fmtTgl(selectedLoan.tgl_kembali_aktual)}</span>
                </div>
              </div>

              {/* Notes */}
              {selectedLoan.catatan_peminjam && (
                <div className="p-3 bg-amber-50/40 rounded-lg border border-amber-100">
                  <span className="font-medium text-gray-500 block text-xs uppercase tracking-wide mb-1">Catatan Pemohon</span>
                  <p className="text-gray-600 text-sm leading-snug">{selectedLoan.catatan_peminjam}</p>
                </div>
              )}

              {selectedLoan.catatan_admin && (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="font-medium text-[#334155] block text-xs uppercase tracking-wide mb-1">Catatan Tata Usaha</span>
                  <p className="text-gray-600 text-sm leading-snug">"{selectedLoan.catatan_admin}"</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={() => setSelectedLoan(null)}
                className="px-4 py-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
