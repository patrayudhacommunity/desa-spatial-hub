export const VILLAGE_MENUS = [
  { key: "kelembagaan", title: "Kelembagaan Desa", desc: "Lembaga Kemasyarakatan & Adat" },
  { key: "perlindungan-sosial", title: "Perlindungan Sosial", desc: "Bantuan & Jaminan Sosial Warga" },
  { key: "kalender-pangan", title: "Kalender Pangan", desc: "Musim Tanam & Produksi Pangan" },
  { key: "produk-olahan", title: "Produk Olahan Desa", desc: "UMKM & Produk Unggulan Desa" },
  { key: "inovasi-literasi", title: "Inovasi & Literasi Desa", desc: "Program Unggulan & Capaian Desa" },
  { key: "papan-elektronik", title: "Papan Elektronik", desc: "Pengumuman & Agenda Desa" },
  { key: "regulasi", title: "Regulasi & Kebijakan", desc: "Perdes, SK & Dokumen Hukum" },
] as const;

export function findMenu(key: string) {
  return VILLAGE_MENUS.find((m) => m.key === key);
}
