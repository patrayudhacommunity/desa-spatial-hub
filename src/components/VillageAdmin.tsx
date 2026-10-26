import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VILLAGE_MENUS } from "@/lib/menus";

type Village = Database["public"]["Tables"]["villages"]["Row"];
type Profile = Pick<Village, "tagline" | "head_name" | "phone" | "contact_email" | "address">;

function usePages(villageId: string) {
  return useQuery({
    queryKey: ["village-pages", villageId],
    queryFn: async () => {
      const { data } = await supabase.from("village_pages").select("menu_key, content").eq("village_id", villageId);
      return Object.fromEntries((data ?? []).map((p) => [p.menu_key, p.content])) as Record<string, string>;
    },
  });
}

function ProfileFields({ value, onChange }: { value: Profile; onChange: (p: Profile) => void }) {
  const f = (k: keyof Profile, label: string, area = false) => (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {area ? (
        <Textarea value={value[k] ?? ""} onChange={(e) => onChange({ ...value, [k]: e.target.value })} />
      ) : (
        <Input value={value[k] ?? ""} onChange={(e) => onChange({ ...value, [k]: e.target.value })} />
      )}
    </div>
  );
  return (
    <div className="space-y-4">
      {f("tagline", "Deskripsi singkat desa", true)}
      {f("head_name", "Nama kepala desa")}
      {f("phone", "Telepon kantor desa")}
      {f("contact_email", "Email kontak desa")}
      {f("address", "Alamat kantor desa", true)}
    </div>
  );
}

function PageEditor({ villageId, menuKey, initial }: { villageId: string; menuKey: string; initial: string }) {
  const qc = useQueryClient();
  const [text, setText] = useState(initial);
  useEffect(() => setText(initial), [initial]);
  async function save() {
    const { error } = await supabase.from("village_pages").upsert(
      { village_id: villageId, menu_key: menuKey, content: text, updated_at: new Date().toISOString() },
      { onConflict: "village_id,menu_key" },
    );
    if (error) { toast.error(error.message); return; }
    toast.success("Konten disimpan");
    qc.invalidateQueries({ queryKey: ["village-pages", villageId] });
    qc.invalidateQueries({ queryKey: ["village-page", villageId, menuKey] });
  }
  return (
    <div className="space-y-2">
      <Textarea rows={8} value={text} onChange={(e) => setText(e.target.value)} placeholder="Tulis konten yang akan dibaca pengunjung. Pisahkan paragraf dengan baris kosong." />
      <Button size="sm" onClick={save}>Simpan konten</Button>
    </div>
  );
}

async function saveProfile(id: string, p: Profile, extra: Partial<Village> = {}) {
  const { error } = await supabase.from("villages").update({ ...p, ...extra }).eq("id", id);
  if (error) throw error;
}

export function VillageSetupWizard({ village }: { village: Village }) {
  const qc = useQueryClient();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<Profile>(village);
  const { data: pages = {} } = usePages(village.id);
  const steps = ["Profil desa", "Konten menu", "Selesai"];

  async function next() {
    try {
      if (step === 0) await saveProfile(village.id, profile);
      if (step === 2) {
        await saveProfile(village.id, profile, { setup_completed: true });
        toast.success("Setup desa selesai");
        qc.invalidateQueries({ queryKey: ["villages"] });
        return;
      }
      setStep(step + 1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan");
    }
  }

  return (
    <section className="max-w-3xl space-y-6 rounded-2xl border bg-card p-6">
      <div>
        <p className="text-sm text-muted-foreground">Setup awal Desa {village.name}</p>
        <div className="mt-3 flex gap-2">
          {steps.map((s, i) => (
            <div key={s} className={`flex-1 rounded-full px-3 py-1 text-center text-xs ${i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{i + 1}. {s}</div>
          ))}
        </div>
      </div>
      {step === 0 && <ProfileFields value={profile} onChange={setProfile} />}
      {step === 1 && (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">Isi konten menu yang ingin ditampilkan. Boleh dilewati dan diisi nanti.</p>
          {VILLAGE_MENUS.map((m) => (
            <div key={m.key}><h3 className="mb-2 font-semibold">{m.title}</h3><PageEditor villageId={village.id} menuKey={m.key} initial={pages[m.key] ?? ""} /></div>
          ))}
        </div>
      )}
      {step === 2 && (
        <div className="space-y-2 text-sm">
          <p>Laman desa siap ditampilkan di <a className="text-primary underline" href={`/${village.slug}`}>/{village.slug}</a>.</p>
          <p className="text-muted-foreground">Disarankan segera mengganti kata sandi bawaan di menu Pengaturan.</p>
        </div>
      )}
      <div className="flex justify-between">
        <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}>Kembali</Button>
        <Button onClick={next}>{step === 2 ? "Selesaikan setup" : "Lanjut"}</Button>
      </div>
    </section>
  );
}

export function VillageEditor({ village }: { village: Village }) {
  const qc = useQueryClient();
  const [profile, setProfile] = useState<Profile>(village);
  const { data: pages = {} } = usePages(village.id);
  return (
    <div className="max-w-3xl space-y-8">
      <section className="space-y-4 rounded-2xl border bg-card p-6">
        <h1 className="text-3xl">Desa {village.name}</h1>
        <a href={`/${village.slug}`} className="text-primary underline">Lihat laman desa →</a>
        <ProfileFields value={profile} onChange={setProfile} />
        <Button onClick={async () => {
          try { await saveProfile(village.id, profile); toast.success("Tersimpan"); qc.invalidateQueries({ queryKey: ["villages"] }); qc.invalidateQueries({ queryKey: ["village", village.slug] }); }
          catch (e) { toast.error(e instanceof Error ? e.message : "Gagal"); }
        }}>Simpan profil</Button>
      </section>
      <section className="space-y-6 rounded-2xl border bg-card p-6">
        <h2 className="text-2xl">Konten Informasi & Layanan</h2>
        {VILLAGE_MENUS.map((m) => (
          <div key={m.key}>
            <div className="mb-2 flex items-baseline justify-between"><h3 className="font-semibold">{m.title}</h3><a className="text-xs text-primary underline" href={`/${village.slug}/${m.key}`}>Lihat</a></div>
            <PageEditor villageId={village.id} menuKey={m.key} initial={pages[m.key] ?? ""} />
          </div>
        ))}
      </section>
    </div>
  );
}
