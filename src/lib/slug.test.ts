import { describe, expect, it } from "vitest";
import { isValidVillageSlug, parseCoordinates, slugifyVillage, villageAdminPassword } from "./slug";

describe("village setup rules", () => {
  it("turns the village name into the address", () => {
    expect(slugifyVillage("Desa Remau Bako Tuo")).toBe("remau-bako-tuo");
  });
  it("keeps only DNS-safe characters for domain and subdomain", () => {
    expect(slugifyVillage("Sukamaju! @ 2026")).toBe("sukamaju-2026");
    expect(slugifyVillage("  ".repeat(1) + "Desa Cibeber")).toBe("cibeber");
  });
  it("rejects reserved or too-short slugs", () => {
    expect(isValidVillageSlug("admin")).toBe(false);
    expect(isValidVillageSlug("ab")).toBe(false);
    expect(isValidVillageSlug("sukamaju")).toBe(true);
  });
  it("admin password is the village name + 123", () => {
    expect(villageAdminPassword("sukamaju")).toBe("sukamaju123");
  });
  it("reads coordinates from a Google Maps link", () => {
    expect(parseCoordinates("https://www.google.com/maps/@-6.2088,106.8456,15z")).toEqual({ lat: -6.2088, lng: 106.8456 });
  });
});
