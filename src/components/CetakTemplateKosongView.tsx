
import React from "react";
import { getPengaturanSurat } from "../data/db";
import { ArrowLeft, Printer } from "lucide-react";

export default function CetakTemplateKosongView({ onBack }: { onBack: () => void }) {
  const settings = getPengaturanSurat();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-[#E5E7EB] min-h-screen relative font-['Times_New_Roman',_Times,_serif] text-[#1a1a1a] pb-10">
      {/* Toolbar for Preview */}
      <div className="print:hidden fixed top-4 right-4 bg-[#334155] text-white px-4 py-2.5 rounded-lg shadow-xl flex gap-3 items-center z-50 font-sans text-xs">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 hover:bg-white/10 px-2 py-1.5 rounded transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        <span className="opacity-50">|</span>
        <span className="font-bold">Template Surat Blanko (Kosong)</span>
        <button
          onClick={handlePrint}
          className="bg-white text-[#334155] hover:bg-slate-100 flex items-center gap-1.5 px-3 py-1.5 rounded shadow-sm transition font-bold cursor-pointer"
        >
          <Printer className="w-4 h-4" /> Cetak / Simpan PDF
        </button>
      </div>

      <style>{`
        @media print {
          body { background: #FFFFFF; }
          .print-container { box-shadow: none !important; margin: 0 !important; width: 100% !important; padding: 1.5cm 2cm !important; }
        }
      `}</style>

      {/* A4 Page Container */}
      <div className="print-container bg-white mx-auto my-8 p-10 w-[21cm] min-h-[29.7cm] shadow-md relative text-[11.5pt] leading-[1.4]">
        {/* KOP SURAT */}
        <div className="flex items-center gap-4 border-b-2 border-[#1a1a1a] pb-1 mb-1">
          <div className="w-[78px] h-[78px] border-[1.5px] border-[#1a1a1a] rounded-full flex items-center justify-center shrink-0 object-cover overflow-hidden">
            {settings.logo_sekolah ? (
              <img
                src={settings.logo_sekolah}
                alt="Logo SMAN 1"
                className="w-[85%] h-[85%] object-contain"
              />
            ) : (
              <span className="text-[8px] font-bold text-center">SMAN 1</span>
            )}
          </div>
          <div className="flex-1 text-center">
            <h1 className="font-bold text-[14pt] leading-tight m-0">
              SMA NEGERI 1 SENTOLO
            </h1>
            <p className="text-[10pt] leading-tight m-0 mt-1">
              Alamat: Jl. Sentolo-Muntilan Km. 1, Sentolo, Kulon Progo, Kode Pos 55664
            </p>
            <p className="text-[10pt] leading-tight m-0">
              Telp: (0274) 7723565
            </p>
          </div>
        </div>
        <div className="border-b-[1.5px] border-[#1a1a1a] pb-1 mb-6"></div>

        {/* DETAILS */}
        <div className="flex justify-between mb-6">
          <div>
            <div className="grid grid-cols-[60px_10px_1fr] gap-1 mb-0.5">
              <span>Nomor</span>
              <span>:</span>
              <span>........................................</span>
            </div>
            <div className="grid grid-cols-[60px_10px_1fr] gap-1 mb-0.5">
              <span>Lamp</span>
              <span>:</span>
              <span>1 Lembar</span>
            </div>
            <div className="grid grid-cols-[60px_10px_1fr] gap-1 mb-0.5">
              <span>Hal</span>
              <span>:</span>
              <span className="font-bold underline underline-offset-2">
                Permohonan Peminjaman Inventaris
              </span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <p>Yth. Waka Urusan Sarana Prasarana (Sarpras)</p>
          <p>di tempat</p>
        </div>

        <div className="text-justify mb-3">
          <p>Dengan hormat,</p>
          <p className="mt-1">
            Sehubungan dengan akan diadakannya kegiatan{" "}
            <strong>....................................................................</strong>{" "}
            yang akan kami laksanakan pada:
          </p>
        </div>

        <div className="ml-7 mb-4">
          <div className="grid grid-cols-[75px_10px_1fr] gap-1 mb-1.5">
            <span>Hari</span>
            <span>:</span>
            <span>...................................................</span>
          </div>
          <div className="grid grid-cols-[75px_10px_1fr] gap-1 mb-1.5">
            <span>Tanggal</span>
            <span>:</span>
            <span>...................................................</span>
          </div>
          <div className="grid grid-cols-[75px_10px_1fr] gap-1 mb-1.5">
            <span>Waktu</span>
            <span>:</span>
            <span>............................ s.d. ............................</span>
          </div>
          <div className="grid grid-cols-[75px_10px_1fr] gap-1 mb-1.5">
            <span>Tempat</span>
            <span>:</span>
            <span>...................................................</span>
          </div>
        </div>

        <div className="text-justify mb-3">
          <p>Maka dengan ini, kami bermaksud meminjam inventaris:</p>
        </div>

        {/* TABLE */}
        <table className="w-full border-collapse mb-6 text-[11pt]">
          <thead>
            <tr>
              <th className="border border-[#1a1a1a] p-1.5 text-center font-bold w-[40px]">No</th>
              <th className="border border-[#1a1a1a] p-1.5 text-center font-bold">Nama Barang</th>
              <th className="border border-[#1a1a1a] p-1.5 text-center font-bold w-[110px]">Jumlah Barang</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, idx) => (
              <tr key={idx}>
                <td className="border border-[#1a1a1a] p-1.5 text-center h-8">
                  {idx + 1}
                </td>
                <td className="border border-[#1a1a1a] p-1.5 h-8"></td>
                <td className="border border-[#1a1a1a] p-1.5 text-center h-8"></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-justify mb-8">
          <p>
            Demikian surat permohonan ini kami sampaikan. Atas perhatian dan
            izin yang diberikan, kami ucapkan terima kasih.
          </p>
        </div>

        {/* SIGNOFF & SIGNATURES */}
        <div className="text-right mb-6 text-[11.5pt]">
          Sentolo, ................................
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-[90px] text-[11.5pt]">
          <div className="text-center">
            <div className="mb-[60px]">Waka Ur. Kesiswaan,</div>
            <div className="font-bold underline underline-offset-2">
              ....................................
            </div>
            <div className="text-[10.5pt] mt-0.5">NIP.</div>
          </div>

          <div className="text-center">
            <div className="mb-[60px]">Ketua Panitia,</div>
            <div className="font-bold underline underline-offset-2">
              ....................................
            </div>
            <div className="text-[10.5pt] mt-0.5">NIS.</div>
          </div>

          <div className="col-span-2 flex justify-center text-center mt-[-40px]">
            <div>
              <div className="mb-[60px]">Waka Ur. Sarpras,</div>
              <div className="font-bold underline underline-offset-2">
                ....................................
              </div>
              <div className="text-[10.5pt] mt-0.5">NIP.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
