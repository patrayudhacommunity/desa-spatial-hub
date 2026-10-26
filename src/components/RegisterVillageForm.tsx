import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerVillage } from "@/lib/villages.functions";
import { parseCoordinates, slugifyVillage, villageAdminPassword } from "@/lib/slug";
import { LazyMap } from "./LazyMap";

export function RegisterVillageForm() {
  const register = useServerFn(registerVillage);
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [province, setProvince] = useState("");
  const [gmaps, setGmaps] = useState("");
  const [coord, setCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ slug: string; username: string; password: string } | null>(null);
  const slug = slugifyVillage(name);
  const [host, setHost] = useState("domain.id");
  useEffect(() => setHost(window.location.host), []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!coord) { toast.error("Pilih koordinat desa di peta atau tempel tautan Google Maps"); return; }
    setBusy(true);
    try {
      const res = await register({ data: { name, province, latitude: coord.lat, longitude: coord.lng } });
      setDone(res);
      qc.invalidateQueries({ queryKey: ["villages"] });
      toast.success("Desa berhasil didaftarkan");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mendaftar");
    } finally {
      setBusy(false);
    }
  }

  if (done)
    return (
      <div className="space-y-3 rounded-xl border bg-secondary p-6">
        <h3 className="text-2xl">Desa siap digunakan 🎉</h3>
        <p>Alamat laman: <a className="font-semibold text-primary underline" href={`/${done.slug}`}>{host}/{done.slug}</a></p>
        <p className="text-sm text-muted-foreground">Subdomain: {done.slug}.{host}</p>
        <p>Login admin desa — username: <b>{done.username}</b>, password: <b>{done.password}</b></p>
        <Button variant="outline" onClick={() => { setDone(null); setName(""); setCoord(null); setGmaps(""); }}>Daftarkan desa lain</Button>
      </div>
    );

  return (
    <form onSubmit={submit} className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>1. Nama desa</Label>
          <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="cth. Sukamaju" />
          {slug && <p className="text-xs text-muted-foreground">Alamat: {host}/{slug} · subdomain {slug}.{host}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Provinsi</Label>
          <Input value={province} onChange={(e) => setProvince(e.target.value)} placeholder="cth. Jawa Barat" />
        </div>
        <div className="space-y-1.5">
          <Label>2. Koordinat (tempel tautan Google Maps atau klik peta)</Label>
          <Input
            value={gmaps}
            onChange={(e) => {
              setGmaps(e.target.value);
              const c = parseCoordinates(e.target.value);
              if (c) setCoord(c);
            }}
            placeholder="https://www.google.com/maps/@-6.2,106.8,15z atau -6.2, 106.8"
          />
          <p className="text-xs text-muted-foreground">{coord ? `Lat ${coord.lat}, Lng ${coord.lng}` : "Belum dipilih"}</p>
        </div>
        <div className="rounded-lg bg-muted p-3 text-sm">
          3. Admin desa otomatis dibuat — username <b>{slug || "namadesa"}</b>, password <b>{villageAdminPassword(slug || "namadesa")}</b>
        </div>
        <Button type="submit" disabled={busy} className="w-full">{busy ? "Mendaftarkan..." : "Daftarkan Desa"}</Button>
      </div>
      <div className="h-80 overflow-hidden rounded-xl border md:h-full md:min-h-80">
        <LazyMap villages={[]} picked={coord} onPick={(lat, lng) => setCoord({ lat, lng })} />
      </div>
    </form>
  );
}
