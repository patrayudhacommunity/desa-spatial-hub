import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const villagesQuery = queryOptions({
  queryKey: ["villages"],
  queryFn: async () => {
    const { data, error } = await supabase.from("villages").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const villageQuery = (slug: string) =>
  queryOptions({
    queryKey: ["village", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("villages").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
