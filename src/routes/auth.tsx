import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { villageAdminEmail } from "@/lib/slug";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Masuk — Tanah Air" },
      { name: "description", content: "Masuk ke dashboard admin SaaS atau admin desa." },
      { property: "og:title", content: "Masuk — Tanah Air" },
      { property: "og:description", content: "Portal admin sistem informasi desa." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const email = id.includes("@") ? id.trim() : villageAdminEmail(id.trim().toLowerCase());
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    setBusy(false);
    if (error) return toast.error("Username atau password salah");
    nav({ to: "/dashboard" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl bg-card p-8 shadow-xl">
        <h1 className="text-3xl">🔐 Portal Admin</h1>
        <p className="text-sm text-muted-foreground">Admin SaaS gunakan email. Admin desa gunakan nama desa.</p>
        <div className="space-y-1.5">
          <Label>Email / nama desa</Label>
          <Input required value={id} onChange={(e) => setId(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Password</Label>
          <Input required type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
        </div>
        <Button className="w-full" disabled={busy}>{busy ? "Memproses..." : "Masuk"}</Button>
      </form>
    </div>
  );
}
