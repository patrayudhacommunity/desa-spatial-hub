import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { isValidVillageSlug, slugifyVillage, villageAdminEmail, villageAdminPassword } from "./slug";

const schema = z.object({
  name: z.string().trim().min(3).max(80),
  province: z.string().trim().max(60).optional(),
  latitude: z.number().min(-11.5).max(6.5),
  longitude: z.number().min(94).max(141.5),
});

export const registerVillage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data }) => {
    const slug = slugifyVillage(data.name);
    if (!isValidVillageSlug(slug)) throw new Error("Nama desa tidak valid sebagai alamat laman/subdomain");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existing } = await supabaseAdmin.from("villages").select("id").eq("slug", slug).maybeSingle();
    if (existing) throw new Error("Desa dengan nama ini sudah terdaftar");

    const email = villageAdminEmail(slug);
    const { data: created, error: userErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: villageAdminPassword(slug),
      email_confirm: true,
      user_metadata: { village: slug },
    });
    if (userErr || !created.user) throw new Error(userErr?.message ?? "Gagal membuat admin desa");

    await supabaseAdmin.from("user_roles").insert({ user_id: created.user.id, role: "village_admin" });
    const { error } = await supabaseAdmin.from("villages").insert({
      name: data.name.replace(/^desa\s+/i, ""),
      slug,
      province: data.province || null,
      latitude: data.latitude,
      longitude: data.longitude,
      admin_user_id: created.user.id,
    });
    if (error) throw new Error(error.message);
    return { slug, username: slug, password: villageAdminPassword(slug) };
  });
