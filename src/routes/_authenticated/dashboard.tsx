import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LazyMap } from "@/components/LazyMap";
import { RegisterVillageForm } from "@/components/RegisterVillageForm";
import { villagesQuery } from "@/lib/villages-query";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Tanah Air" },
      { name: "description", content: "Dashboard admin SaaS sistem informasi desa." },
      { property: "og:title", content: "Dashboard — Tanah Air" },
      { property: "og:description", content: "Kelola desa terdaftar." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = Route.useRouteContext();
  const nav = useNavigate();
  const { data: roles = [] } = useQuery({
    queryKey: ["roles", user.id],
    queryFn: async () => (await supabase.from("user_roles").select("role").eq("user_id", user.id)).data?.map((r) => r.role) ?? [],
  });
  const { data: villages = [] } = useQuery(villagesQuery);
  const isSuper = roles.includes("super_admin");
  const mine = villages.find((v) => v.admin_user_id === user.id);

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 flex-col bg-sidebar p-6 text-sidebar-foreground md:flex">
        <Link to="/" className="font-display text-2xl">Tanah Air</Link>
        <p className="mt-1 text-xs opacity-70">{isSuper ? "Admin SaaS" : "Admin Desa"}</p>
        <div className="mt-auto text-xs opacity-70 break-all">{user.email}</div>
        <Button variant="secondary" size="sm" className="mt-3" onClick={async () => { await supabase.auth.signOut(); nav({ to: "/auth" }); }}>Keluar</Button>
      </aside>
      <main className="flex-1 space-y-8 p-6 md:p-10">
        {isSuper ? (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <Stat label="Desa terdaftar" value={villages.length} />
              <Stat label="Provinsi" value={new Set(villages.map((v) => v.province).filter(Boolean)).size} />
              <Stat label="Admin desa" value={villages.filter((v) => v.admin_user_id).length} />
            </div>
            <div className="h-96 overflow-hidden rounded-2xl border"><LazyMap villages={villages} /></div>
            <section className="rounded-2xl border bg-card p-6">
              <h2 className="mb-4 text-2xl">Daftar Desa</h2>
              <Table>
                <TableHeader><TableRow><TableHead>Desa</TableHead><TableHead>Provinsi</TableHead><TableHead>Koordinat</TableHead><TableHead>Alamat</TableHead></TableRow></TableHeader>
                <TableBody>
                  {villages.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">{v.name}</TableCell>
                      <TableCell>{v.province}</TableCell>
                      <TableCell className="text-xs">{v.latitude.toFixed(4)}, {v.longitude.toFixed(4)}</TableCell>
                      <TableCell><a href={`/${v.slug}`} className="text-primary underline">/{v.slug}</a></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </section>
            <section className="rounded-2xl border bg-card p-6">
              <h2 className="mb-4 text-2xl">Setup Desa Baru</h2>
              <RegisterVillageForm />
            </section>
          </>
        ) : mine ? (
          <VillageEditor village={mine} />
        ) : (
          <p className="text-muted-foreground">Akun ini belum terhubung ke desa.</p>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-display text-4xl">{value}</p>
    </div>
  );
}

function VillageEditor({ village }: { village: { id: string; name: string; slug: string; tagline: string | null } }) {
  const qc = useQueryClient();
  const [tagline, setTagline] = useState(village.tagline ?? "");
  useEffect(() => setTagline(village.tagline ?? ""), [village.tagline]);
  async function save() {
    const { error } = await supabase.from("villages").update({ tagline }).eq("id", village.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Tersimpan");
    qc.invalidateQueries({ queryKey: ["villages"] });
  }
  return (
    <section className="max-w-xl space-y-4 rounded-2xl border bg-card p-6">
      <h1 className="text-3xl">Desa {village.name}</h1>
      <a href={`/${village.slug}`} className="text-primary underline">Lihat laman desa →</a>
      <div className="space-y-1.5">
        <Label>Deskripsi singkat desa</Label>
        <Input value={tagline} onChange={(e) => setTagline(e.target.value)} />
      </div>
      <Button onClick={save}>Simpan</Button>
    </section>
  );
}
