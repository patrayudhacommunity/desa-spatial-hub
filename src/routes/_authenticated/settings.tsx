import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Pengaturan Akun — Tanah Air" },
      { name: "description", content: "Ganti kata sandi dan perbarui informasi akun admin." },
      { property: "og:title", content: "Pengaturan Akun — Tanah Air" },
      { property: "og:description", content: "Pengaturan akun admin desa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Settings,
});

function Settings() {
  const { user } = Route.useRouteContext();
  const meta = (user.user_metadata ?? {}) as { full_name?: string; phone?: string };
  const [fullName, setFullName] = useState(meta.full_name ?? "");
  const [phone, setPhone] = useState(meta.phone ?? "");
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ data: { full_name: fullName.trim(), phone: phone.trim() } });
    if (error) toast.error(error.message); else toast.success("Informasi akun diperbarui");
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (next.length < 8) { toast.error("Kata sandi baru minimal 8 karakter"); return; }
    if (next !== confirm) { toast.error("Konfirmasi kata sandi tidak cocok"); return; }
    if (next === current) { toast.error("Kata sandi baru harus berbeda"); return; }
    setBusy(true);
    const { error: reauth } = await supabase.auth.signInWithPassword({ email: user.email!, password: current });
    if (reauth) { setBusy(false); toast.error("Kata sandi saat ini salah"); return; }
    const { error } = await supabase.auth.updateUser({ password: next });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setCurrent(""); setNext(""); setConfirm("");
    toast.success("Kata sandi berhasil diganti");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6 md:p-10">
      <Link to="/dashboard" className="text-sm text-primary underline">← Kembali ke dashboard</Link>
      <h1 className="text-4xl">Pengaturan Akun</h1>
      <form onSubmit={saveProfile} className="space-y-4 rounded-2xl border bg-card p-6">
        <h2 className="text-2xl">Informasi akun</h2>
        <div className="space-y-1.5"><Label>Username / email login</Label><Input value={user.email ?? ""} disabled /></div>
        <div className="space-y-1.5"><Label>Nama lengkap</Label><Input value={fullName} maxLength={80} onChange={(e) => setFullName(e.target.value)} /></div>
        <div className="space-y-1.5"><Label>No. telepon</Label><Input value={phone} maxLength={20} onChange={(e) => setPhone(e.target.value)} /></div>
        <Button type="submit">Simpan informasi</Button>
      </form>
      <form onSubmit={changePassword} className="space-y-4 rounded-2xl border bg-card p-6">
        <h2 className="text-2xl">Ganti kata sandi</h2>
        <div className="space-y-1.5"><Label>Kata sandi saat ini</Label><Input type="password" required value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" /></div>
        <div className="space-y-1.5"><Label>Kata sandi baru (min. 8 karakter)</Label><Input type="password" required value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" /></div>
        <div className="space-y-1.5"><Label>Ulangi kata sandi baru</Label><Input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" /></div>
        <Button type="submit" disabled={busy}>{busy ? "Memproses..." : "Ganti kata sandi"}</Button>
      </form>
    </div>
  );
}
