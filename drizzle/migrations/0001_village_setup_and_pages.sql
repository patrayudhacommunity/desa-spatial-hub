ALTER TABLE public.villages
  ADD COLUMN IF NOT EXISTS head_name text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS setup_completed boolean NOT NULL DEFAULT false;

CREATE TABLE public.village_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  village_id uuid NOT NULL REFERENCES public.villages(id) ON DELETE CASCADE,
  menu_key text NOT NULL,
  content text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (village_id, menu_key)
);
GRANT SELECT ON public.village_pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.village_pages TO authenticated;
GRANT ALL ON public.village_pages TO service_role;
ALTER TABLE public.village_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read pages" ON public.village_pages FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Village admin writes pages" ON public.village_pages FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.villages v WHERE v.id = village_id AND v.admin_user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.villages v WHERE v.id = village_id AND v.admin_user_id = auth.uid()));