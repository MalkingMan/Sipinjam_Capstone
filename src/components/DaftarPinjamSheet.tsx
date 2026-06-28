import React from 'react';
import { DetailPeminjaman } from '../types';
import { getBarang } from '../data/db';
import { X, Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';

interface DaftarPinjamSheetProps {
  isOpen: boolean;
  onClose: () => void;
  items: DetailPeminjaman[];
  onUpdateQty: (barangId: string, jumlah: number) => void;
  onProceed: () => void;
}

export default function DaftarPinjamSheet({ isOpen, onClose, items, onUpdateQty, onProceed }: DaftarPinjamSheetProps) {
  const allBarang = getBarang();

  if (!isOpen) return null;

  const totalUnit = items.reduce((acc, curr) => acc + curr.jumlah, 0);
  const totalJenis = items.length;

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/50 z-[60]" onClick={onClose}></div>
      <div className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-xl z-[70] flex flex-col">

        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 bg-white flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-sm text-gray-900">Daftar Pinjam</h2>
            <p className="text-xs text-gray-400 mt-0.5">SIPINJAM SMAN 1 Sentolo</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-400">Daftar masih kosong</p>
              <p className="text-xs text-gray-400">Tambahkan barang dari Katalog</p>
            </div>
          ) : (
            items.map((item) => {
              const b = allBarang.find(brx => brx.id === item.barang_id);
              if (!b) return null;

              return (
                <div key={item.barang_id} className="bg-white p-3 rounded-xl border border-gray-200 flex gap-3">
                  <div className="w-16 h-16 bg-gray-100 border border-gray-200 rounded-lg object-cover overflow-hidden shrink-0 flex items-center justify-center">
                    {b.foto ? (
                      <img
                        src={b.foto}
                        alt={b.nama}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.src = 'https://placehold.co/150x150/f9fafb/6b7280?text=Foto'; }}
                      />
                    ) : (
                      <span className="text-xs text-gray-400">Foto</span>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-medium text-sm text-gray-900 leading-tight">{b.nama}</h3>
                      <span className="text-xs text-gray-400 mt-0.5 inline-block">Stok tersedia: {b.stok_tersedia}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      {/* Stepper */}
                      <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg p-0.5">
                        <button
                          onClick={() => onUpdateQty(item.barang_id, item.jumlah - 1)}
                          className="w-6 h-6 flex items-center justify-center hover:bg-gray-200 rounded-md transition text-gray-600"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-medium w-4 text-center">{item.jumlah}</span>
                        <button
                          onClick={() => {
                            if (item.jumlah < b.stok_tersedia) onUpdateQty(item.barang_id, item.jumlah + 1);
                          }}
                          className="w-6 h-6 flex items-center justify-center hover:bg-gray-200 rounded-md transition text-[#1E3A8A]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => onUpdateQty(item.barang_id, 0)}
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Peminjaman:</span>
              <span className="text-sm font-semibold text-[#1E3A8A]">{totalJenis} jenis · {totalUnit} unit</span>
            </div>
            <button
              onClick={() => { onClose(); onProceed(); }}
              className="w-full bg-[#1E3A8A] hover:bg-[#1e40af] text-white font-medium text-sm py-3 rounded-lg flex items-center justify-center gap-2 active:scale-[0.98] transition cursor-pointer"
            >
              Lanjutkan ke Form Kegiatan
            </button>
          </div>
        )}
      </div>
    </>
  );
}
