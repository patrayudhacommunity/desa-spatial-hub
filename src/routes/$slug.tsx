import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { villageQuery } from "@/lib/villages-query";
import { LazyMap } from "@/components/LazyMap";
import slide1 from "@/assets/desa-1.jpg";
import slide2 from "@/assets/desa-2.jpg";

const MENU = [
  ["Kelembagaan Desa", "Lembaga Kemasyarakatan & Adat"],
  ["Perlindungan Sosial", "Bantuan & Jaminan Sosial Warga"],
  ["Kalender Pangan", "Musim Tanam & Produksi Pangan"],
  ["Produk Olahan Desa", "UMKM & Produk Unggulan Desa"],
  ["Inovasi & Literasi Desa", "Program Unggulan & Capaian Desa"],
  ["Papan Elektronik", "Pengumuman & Agenda Desa"],
  ["Regulasi & Kebijakan", "Perdes, SK & Dokumen Hukum"],
];

export const Route = createFileRoute("/$slug")({
  loader: async ({ context, params }) => {
    const v = await context.queryClient.ensureQueryData(villageQuery(params.slug));
    if (!v) throw notFound();
    return { name: v.name };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `Desa ${loaderData?.name ?? ""} — Laman Informasi` },
      { name: "description", content: `Laman sistem informasi Desa ${loaderData?.name ?? ""}.` },
      { property: "og:title", content: `Desa ${loaderData?.name ?? ""}` },
      { property: "og:description", content: "Layanan publik dan informasi desa." },
    ],
  }),
  component: VillagePage,
});

function VillagePage() {
  const { slug } = Route.useParams();
  const { data: v } = useSuspenseQuery(villageQuery(slug));
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % 2), 6000);
    return () => clearInterval(t);
  }, []);
  if (!v) return null;
  const slides = [slide1, slide2];

  return (
    <div>
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden text-center">
        {slides.map((s, idx) => (
          <img key={idx} src={s} alt="" width={1600} height={912} className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${idx === i ? "animate-slow-zoom opacity-100" : "opacity-0"}`} />
        ))}
        <div className="absolute inset-0 bg-hero-overlay" />
        <button onClick={() => setOpen(true)} className="absolute right-6 top-6 z-10 rounded-full bg-card/90 px-4 py-2 text-sm font-semibold text-foreground">☰ Menu</button>
        <div className="relative max-w-3xl px-6 text-on-hero">
          <p className="text-sm uppercase tracking-[0.3em] opacity-80">Selamat datang di laman informasi</p>
          <h1 className="mt-4 text-5xl uppercase md:text-7xl">Desa {v.name}</h1>
          <p className="mx-auto mt-6 max-w-2xl opacity-90">
            {v.tagline || "Laman ini merupakan pengembangan Sistem Informasi Desa untuk menampilkan layanan publik dan meningkatkan peran masyarakat dalam mendukung program pembangunan desa yang lebih partisipatif dan berkelanjutan."}
          </p>
          <p className="mt-8 text-xs tracking-[0.3em] opacity-70">DESA {v.name.toUpperCase()} • {(v.province ?? "INDONESIA").toUpperCase()}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="mb-6 text-3xl">Lokasi Desa</h2>
        <div className="h-96 overflow-hidden rounded-2xl border"><LazyMap villages={[v]} /></div>
      </section>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-foreground/40" onClick={() => setOpen(false)}>
          <nav className="h-full w-full max-w-sm overflow-y-auto bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex justify-between"><span className="font-semibold">Menu Navigasi</span><button onClick={() => setOpen(false)}>✕</button></div>
            <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Informasi & Layanan</p>
            <ul className="space-y-2">
              {MENU.map(([t, d]) => (
                <li key={t} className="rounded-lg border p-3 hover:bg-secondary"><p className="font-semibold">{t}</p><p className="text-xs text-muted-foreground">{d}</p></li>
              ))}
            </ul>
            <a href="/auth" className="mt-6 block rounded-lg bg-primary p-3 text-center text-primary-foreground">🔐 Portal Admin Desa</a>
            <p className="mt-6 text-center text-xs text-muted-foreground">Desa {v.name} © 2026</p>
          </nav>
        </div>
      )}
    </div>
  );
}
