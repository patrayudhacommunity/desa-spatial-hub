import { describe, expect, it } from "vitest";
import { parseCoordinates, slugifyVillage, villageAdminPassword } from "./slug";

describe("village setup rules", () => {
  it("turns the village name into the address", () => {
    expect(slugifyVillage("Desa Remau Bako Tuo")).toBe("remau-bako-tuo");
  });
  it("admin password is the village name + 123", () => {
    expect(villageAdminPassword("sukamaju")).toBe("sukamaju123");
  });
  it("reads coordinates from a Google Maps link", () => {
    expect(parseCoordinates("https://www.google.com/maps/@-6.2088,106.8456,15z")).toEqual({ lat: -6.2088, lng: 106.8456 });
  });
});
