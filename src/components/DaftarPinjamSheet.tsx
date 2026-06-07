import React from 'react';
import { DetailPeminjaman } from '../types';
import { getBarang } from '../data/db';
import { X, Trash2, Minus, Plus } from 'lucide-react';

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
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]" onClick={onClose}></div>
      <div className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl z-[70] flex flex-col transform transition-transform duration-300">
        
        {/* Header */}
        <div className="px-5 py-4 border-b-2 border-slate-900 bg-slate-50 flex justify-between items-center text-[#1E3A8A]">
          <div>
            <h2 className="font-black text-sm tracking-widest uppercase">Daftar Pinjam</h2>
            <p className="text-[10px] font-bold text-slate-500 mt-0.5">SIPINJAM SMAN 1 Sentolo</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded transition text-slate-500 hover:text-slate-900">
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-100">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <span className="text-4xl mb-3 opacity-20">📦</span>
              <p className="text-xs font-bold tracking-wider">Daftar masih kosong</p>
            </div>
          ) : (
            items.map((item) => {
              const b = allBarang.find(brx => brx.id === item.barang_id);
              if (!b) return null;

              return (
                <div key={item.barang_id} className="bg-white p-3 rounded-lg border-2 border-slate-900 flex gap-3 shadow-sm">
                  <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded object-cover overflow-hidden shrink-0 flex items-center justify-center">
                    {b.foto_url ? (
                      <img src={b.foto_url} alt={b.nama} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs">Foto</span>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-black text-xs text-slate-800 leading-tight">{b.nama}</h3>
                      <p className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded w-max mt-1 border border-slate-200">Stok: {b.stok}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      {/* Stepper */}
                      <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded p-0.5">
                        <button 
                          onClick={() => onUpdateQty(item.barang_id, item.jumlah - 1)}
                          className="w-6 h-6 flex items-center justify-center hover:bg-white rounded transition text-slate-600"
                        >
                          <Minus className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                        <span className="text-[10px] font-black w-3 text-center">{item.jumlah}</span>
                        <button 
                          onClick={() => {
                            if (item.jumlah < b.stok) onUpdateQty(item.barang_id, item.jumlah + 1);
                          }}
                          className="w-6 h-6 flex items-center justify-center hover:bg-white rounded transition text-[#1E3A8A]"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                      </div>
                      <button 
                        onClick={() => onUpdateQty(item.barang_id, 0)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
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
          <div className="p-4 border-t-2 border-slate-900 bg-white">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Peminjaman:</span>
              <span className="text-xs font-black text-[#1E3A8A]">{totalJenis} jenis · {totalUnit} unit</span>
            </div>
            <button 
              onClick={() => {
                onClose();
                onProceed();
              }}
              className="w-full bg-[#1E3A8A] hover:bg-slate-900 border-2 border-slate-950 text-white font-black text-[10px] tracking-wider uppercase py-3 rounded-lg flex items-center justify-center gap-2 shadow active:scale-[0.98] transition cursor-pointer"
            >
              Lanjutkan ke Form Kegiatan
            </button>
          </div>
        )}

      </div>
    </>
  );
}
