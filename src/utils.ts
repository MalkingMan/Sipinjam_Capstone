/** Ubah 'YYYY-MM-DD' → 'DD-MM-YYYY'. Nilai kosong dikembalikan '—'. */
export function fmtTgl(iso?: string | null): string {
  if (!iso) return '—';
  const parts = iso.split('-');
  if (parts.length !== 3) return iso;
  const [y, m, d] = parts;
  return `${d}-${m}-${y}`;
}
