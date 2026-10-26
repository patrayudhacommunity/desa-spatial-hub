import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { LazyMap } from "@/components/LazyMap";
import { RegisterVillageForm } from "@/components/RegisterVillageForm";
import { villagesQuery } from "@/lib/villages-query";
import hero from "@/assets/desa-1.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tanah Air — Peta Desa Digital Indonesia" },
      { name: "description", content: "Daftarkan desa Anda dan dapatkan laman sistem informasi desa dalam hitungan menit." },
      { property: "og:title", content: "Tanah Air — Peta Desa Digital Indonesia" },
      { property: "og:description", content: "Platform SaaS sistem informasi desa se-Indonesia." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(villagesQuery),
  component: Index,
});

function Index() {
  const { data: villages } = useSuspenseQuery(villagesQuery);
  return (
    <div>
      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-5 text-on-hero">
        <span className="font-display text-2xl">Tanah Air</span>
        <Link to="/auth"><Button variant="secondary" size="sm">Masuk</Button></Link>
      </header>
      <section className="relative flex min-h-[80vh] items-end overflow-hidden">
        <img src={hero} alt="Desa di tepi sungai" width={1600} height={912} className="absolute inset-0 h-full w-full animate-slow-zoom object-cover" />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="relative mx-auto w-full max-w-6xl px-6 pb-16 text-on-hero">
          <p className="text-sm uppercase tracking-[0.3em] opacity-80">Sistem Informasi Desa</p>
          <h1 className="mt-3 max-w-3xl text-5xl leading-tight md:text-7xl">Setiap desa di Nusantara, satu peta.</h1>
          <p className="mt-4 max-w-xl text-lg opacity-90">Daftarkan desa, dapatkan laman layanan publik sendiri lengkap dengan portal admin.</p>
          <div className="mt-8 flex gap-3">
            <a href="#daftar"><Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">Daftarkan Desa</Button></a>
            <a href="#peta"><Button size="lg" variant="secondary">Lihat Peta</Button></a>
          </div>
        </div>
      </section>

      <section id="peta" className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-4xl">Peta Desa Indonesia</h2>
          <span className="text-muted-foreground">{villages.length} desa terdaftar</span>
        </div>
        <div className="h-[520px] overflow-hidden rounded-2xl border shadow-lg">
          <LazyMap villages={villages} />
        </div>
      </section>

      <section id="daftar" className="bg-card py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-2 text-4xl">Daftarkan Desa Anda</h2>
          <p className="mb-8 text-muted-foreground">Tiga langkah: nama, koordinat, dan akun admin dibuat otomatis.</p>
          <RegisterVillageForm />
        </div>
      </section>
      <footer className="py-8 text-center text-sm text-muted-foreground">Tanah Air © 2026</footer>
    </div>
  );
}
