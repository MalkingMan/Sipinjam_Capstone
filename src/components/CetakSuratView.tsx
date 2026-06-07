import React, { useEffect, useState } from "react";
import { getBarang, getPeminjaman, getPengaturanSurat } from "../data/db";
import { Peminjaman } from "../types";
import { ArrowLeft, Printer } from "lucide-react";

export default function CetakSuratView({
  loanId,
  onBack,
}: {
  loanId: string;
  onBack: () => void;
}) {
  const [loan, setLoan] = useState<Peminjaman | null>(null);
  const allBarang = getBarang();
  const settings = getPengaturanSurat();

  useEffect(() => {
    const data = getPeminjaman().find((l) => l.id === loanId);
    if (data) setLoan(data);
  }, [loanId]);

  if (!loan)
    return (
      <div className="p-8 text-center text-slate-500">
        Loading atau data tidak ditemukan.
      </div>
    );

  const getFormatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      const dates = dateString.split("-");
      if (dates.length !== 3) return dateString;
      const months = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
      ];
      return `${dates[2]} ${months[parseInt(dates[1]) - 1]} ${dates[0]}`;
    } catch {
      return dateString;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-[#E5E7EB] min-h-screen relative font-['Times_New_Roman',_Times,_serif] text-[#1a1a1a] pb-10">
      {/* Toolbar for Preview */}
      <div className="print:hidden fixed top-4 right-4 bg-[#1E3A8A] text-white px-4 py-2.5 rounded-lg shadow-xl flex gap-3 items-center z-50 font-sans text-xs">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 hover:bg-white/10 px-2 py-1.5 rounded transition"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        <span className="opacity-50">|</span>
        <span className="font-bold">Pratinjau Surat SMAN 1 Sentolo</span>
        <button
          onClick={handlePrint}
          className="bg-white text-[#1E3A8A] hover:bg-slate-100 flex items-center gap-1.5 px-3 py-1.5 rounded shadow-sm transition font-bold"
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
            <div className="font-bold text-[14pt] tracking-wider">
              ORGANISASI SISWA INTRA SEKOLAH
            </div>
            <div className="font-bold text-[17pt] tracking-wider leading-tight">
              SMA NEGERI 1 SENTOLO
            </div>
            <div className="text-[9.5pt] italic mt-0.5">
              Jl. Sentolo-Muntilan Km. 1, Sentolo, Kulon Progo, Kode Pos 55664
              Telp. (0274) 7723565
            </div>
          </div>
        </div>
        <div className="border-b-[0.75px] border-[#1a1a1a] mb-6"></div>

        {/* META */}
        <div className="mb-5">
          <div className="grid grid-cols-[75px_10px_1fr] gap-1 mb-0.5">
            <span>Nomor</span>
            <span>:</span>
            <span>
              {settings.surat_counter}/XI/OSIS/SMAN 1 SENTOLO/
              {settings.surat_tahun}
            </span>
          </div>
          <div className="grid grid-cols-[75px_10px_1fr] gap-1 mb-0.5">
            <span>Lampiran</span>
            <span>:</span>
            <span>—</span>
          </div>
          <div className="grid grid-cols-[75px_10px_1fr] gap-1 mb-0.5">
            <span>Hal</span>
            <span>:</span>
            <span>Permohonan Izin Peminjaman Barang</span>
          </div>
        </div>

        {/* ADDRESSEE */}
        <div className="mb-6">
          <div>Kepada Yth.</div>
          <div>Kepala Sekolah SMAN 1 Sentolo</div>
          <div>Di tempat</div>
        </div>

        {/* BODY */}
        <div className="text-justify mb-4">
          <p className="indent-7 mb-2">Dengan hormat,</p>
          <p>
            Sehubungan dengan kegiatan{" "}
            <strong>
              {loan.surat_nama_kegiatan?.toUpperCase() || loan.keperluan}
            </strong>{" "}
            yang akan kami laksanakan pada:
          </p>
        </div>

        <div className="ml-7 mb-4">
          <div className="grid grid-cols-[75px_10px_1fr] gap-1 mb-0.5">
            <span>Hari</span>
            <span>:</span>
            <span>{loan.surat_hari || "-"}</span>
          </div>
          <div className="grid grid-cols-[75px_10px_1fr] gap-1 mb-0.5">
            <span>Tanggal</span>
            <span>:</span>
            <span>
              {getFormatDate(loan.surat_tanggal_kegiatan || loan.tgl_mulai)}
            </span>
          </div>
          <div className="grid grid-cols-[75px_10px_1fr] gap-1 mb-0.5">
            <span>Waktu</span>
            <span>:</span>
            <span>
              {loan.surat_waktu_mulai || "-"} WIB s.d.{" "}
              {loan.surat_waktu_selesai || "-"} WIB
            </span>
          </div>
          <div className="grid grid-cols-[75px_10px_1fr] gap-1 mb-0.5">
            <span>Tempat</span>
            <span>:</span>
            <span>{loan.surat_tempat || "SMAN 1 Sentolo"}</span>
          </div>
        </div>

        <div className="text-justify mb-3">
          <p>Maka dengan ini, OSIS SMAN 1 Sentolo bermaksud meminjam:</p>
        </div>

        {/* TABLE */}
        <table className="w-full border-collapse mb-6 text-[11pt]">
          <thead>
            <tr>
              <th className="border border-[#1a1a1a] p-1.5 text-center font-bold">
                No
              </th>
              <th className="border border-[#1a1a1a] p-1.5 text-center font-bold">
                Nama Barang
              </th>
              <th className="border border-[#1a1a1a] p-1.5 text-center font-bold w-[110px]">
                Jumlah Barang
              </th>
            </tr>
          </thead>
          <tbody>
            {loan.items && loan.items.map((item, idx) => {
              const matchedProp = allBarang.find((b) => b.id === item.barang_id);
              return (
                <tr key={`item-${idx}`}>
                  <td className="border border-[#1a1a1a] p-1.5 text-center h-8">
                    {idx + 1}
                  </td>
                  <td className="border border-[#1a1a1a] p-1.5 h-8">
                    {matchedProp ? matchedProp.nama : "Unknown"}
                  </td>
                  <td className="border border-[#1a1a1a] p-1.5 text-center h-8">
                    {item.jumlah} unit
                  </td>
                </tr>
              );
            })}
            
            {/* Blank rows up to min 5 rows if items are fewer */}
            {Array.from({ length: Math.max(0, 5 - (loan.items?.length || 0)) }).map((_, idx) => (
              <tr key={`empty-${idx}`}>
                <td className="border border-[#1a1a1a] p-1.5 text-center h-8">
                  {(loan.items?.length || 0) + idx + 1}
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
          Sentolo, {getFormatDate(new Date().toISOString().split("T")[0])}
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-[90px] text-[11.5pt]">
          <div className="text-center">
            <div className="mb-[60px]">Waka Ur. Kesiswaan,</div>
            <div className="font-bold underline underline-offset-2">
              {settings.waka_kesiswaan_nama}
            </div>
            <div className="text-[10.5pt] mt-0.5">
              NIP {settings.waka_kesiswaan_nip}
            </div>
          </div>

          <div className="text-center">
            <div className="mb-[60px]">Ketua Panitia,</div>
            <div className="font-bold underline underline-offset-2">
              {loan.surat_ketua_panitia || loan.peminjam_nama}
            </div>
            <div className="text-[10.5pt] mt-0.5">
              NIS {loan.surat_nis_ketua || "-"}
            </div>
          </div>

          <div className="col-span-2 flex justify-center text-center mt-[-40px]">
            <div>
              <div className="mb-[60px]">Waka Ur. Sarpras,</div>
              <div className="font-bold underline underline-offset-2">
                {settings.waka_sarpras_nama}
              </div>
              <div className="text-[10.5pt] mt-0.5">
                NIP {settings.waka_sarpras_nip}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
