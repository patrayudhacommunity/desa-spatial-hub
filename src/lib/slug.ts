export const RESERVED_SLUGS = ["auth", "dashboard", "api", "admin", "login"];

export function slugifyVillage(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^desa\s+/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function villageAdminEmail(slug: string) {
  return `${slug}@desa.local`;
}

export function villageAdminPassword(slug: string) {
  return `${slug}123`;
}

/** Parse coordinates from a Google Maps link or "lat, lng" text. */
export function parseCoordinates(input: string): { lat: number; lng: number } | null {
  const s = decodeURIComponent(input.trim());
  const patterns = [/@(-?\d+\.\d+),(-?\d+\.\d+)/, /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, /[?&](?:q|query|ll)=(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/, /^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/];
  for (const p of patterns) {
    const m = s.match(p);
    if (m) {
      const lat = Number(m[1]);
      const lng = Number(m[2]);
      if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return { lat, lng };
    }
  }
  return null;
}
