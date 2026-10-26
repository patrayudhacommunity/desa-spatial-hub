import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { villageQuery } from "@/lib/villages-query";
import { findMenu, VILLAGE_MENUS } from "@/lib/menus";

const pageQuery = (villageId: string, key: string) =>
  queryOptions({
    queryKey: ["village-page", villageId, key],
    queryFn: async () =>
      (await supabase.from("village_pages").select("content, updated_at").eq("village_id", villageId).eq("menu_key", key).maybeSingle()).data,
  });

export const Route = createFileRoute("/$slug_/$menu")({
  loader: async ({ context, params }) => {
    const menu = findMenu(params.menu);
    const v = await context.queryClient.ensureQueryData(villageQuery(params.slug));
    if (!v || !menu) throw notFound();
    await context.queryClient.ensureQueryData(pageQuery(v.id, menu.key));
    return { name: v.name, title: menu.title, desc: menu.desc };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? "Informasi"} — Desa ${loaderData?.name ?? ""}` },
      { name: "description", content: `${loaderData?.desc ?? ""} di Desa ${loaderData?.name ?? ""}.` },
      { property: "og:title", content: `${loaderData?.title ?? "Informasi"} — Desa ${loaderData?.name ?? ""}` },
      { property: "og:description", content: loaderData?.desc ?? "Informasi desa" },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const { slug, menu: key } = Route.useParams();
  const { data: v } = useSuspenseQuery(villageQuery(slug));
  const menu = findMenu(key)!;
  const { data: page } = useSuspenseQuery(pageQuery(v!.id, key));
  const paragraphs = (page?.content ?? "").split(/\n\s*\n/).filter((p) => p.trim());

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary px-6 py-12 text-primary-foreground">
        <div className="mx-auto max-w-4xl">
          <Link to="/$slug" params={{ slug }} className="text-sm opacity-80 hover:underline">← Desa {v!.name}</Link>
          <h1 className="mt-4 text-4xl md:text-5xl">{menu.title}</h1>
          <p className="mt-2 opacity-80">{menu.desc}</p>
        </div>
      </header>
      <div className="mx-auto grid max-w-4xl gap-10 px-6 py-12 md:grid-cols-[1fr_220px]">
        <article className="space-y-4 leading-relaxed">
          {paragraphs.length ? (
            paragraphs.map((p, i) => <p key={i} className="whitespace-pre-line">{p}</p>)
          ) : (
            <p className="text-muted-foreground">Informasi {menu.title.toLowerCase()} Desa {v!.name} sedang disiapkan oleh pemerintah desa. Silakan kembali lagi nanti.</p>
          )}
          {page?.updated_at && <p className="pt-4 text-xs text-muted-foreground">Diperbarui {new Date(page.updated_at).toLocaleDateString("id-ID", { dateStyle: "long" })}</p>}
        </article>
        <nav className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Menu lainnya</p>
          {VILLAGE_MENUS.filter((m) => m.key !== key).map((m) => (
            <Link key={m.key} to="/$slug/$menu" params={{ slug, menu: m.key }} className="block rounded-lg border p-2 text-sm hover:bg-secondary">{m.title}</Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
