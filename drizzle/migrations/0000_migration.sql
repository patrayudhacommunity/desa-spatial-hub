create type public.app_role as enum ('super_admin', 'village_admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create table public.villages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  province text,
  latitude double precision not null,
  longitude double precision not null,
  tagline text,
  admin_user_id uuid,
  created_at timestamptz not null default now()
);
grant select on public.villages to anon, authenticated;
grant update on public.villages to authenticated;
grant all on public.villages to service_role;
alter table public.villages enable row level security;
create policy "public read villages" on public.villages for select to anon, authenticated using (true);
create policy "admins update villages" on public.villages for update to authenticated
  using (admin_user_id = auth.uid() or public.has_role(auth.uid(), 'super_admin'))
  with check (admin_user_id = auth.uid() or public.has_role(auth.uid(), 'super_admin'));

create or replace function public.assign_super_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if lower(new.email) = 'societyspatial@gmail.com' then
    insert into public.user_roles (user_id, role) values (new.id, 'super_admin') on conflict do nothing;
  end if;
  return new;
end $$;
create trigger on_auth_user_created_super_admin after insert on auth.users
  for each row execute function public.assign_super_admin();

insert into public.villages (name, slug, province, latitude, longitude, tagline) values
('Remau Bako Tuo', 'remau-bako-tuo', 'Jambi', -1.0921, 104.0167, 'Desa contoh dengan tema bawaan');