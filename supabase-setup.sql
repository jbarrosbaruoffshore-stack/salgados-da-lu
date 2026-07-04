-- Execute este arquivo uma única vez no SQL Editor do Supabase.
-- A senha do painel NÃO fica neste arquivo nem no repositório.

create table if not exists public.products (
  id text primary key,
  name text not null,
  category text not null default 'Salgados',
  price text not null default '',
  image_url text not null default '',
  sort_order integer not null default 0,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.gallery_photos (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  alt text not null default 'Produção da Salgados da Lu',
  sort_order integer not null default 0,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.gallery_photos enable row level security;

drop policy if exists "Cardapio publico" on public.products;
create policy "Cardapio publico"
on public.products
for select
to anon
using (active = true);

drop policy if exists "Administrador le produtos" on public.products;
create policy "Administrador le produtos"
on public.products
for select
to authenticated
using ((select auth.jwt() ->> 'email') = 'lucianasalgado@admin.salgadosdalu.com');

drop policy if exists "Administrador cria produtos" on public.products;
create policy "Administrador cria produtos"
on public.products
for insert
to authenticated
with check ((select auth.jwt() ->> 'email') = 'lucianasalgado@admin.salgadosdalu.com');

drop policy if exists "Administrador atualiza produtos" on public.products;
create policy "Administrador atualiza produtos"
on public.products
for update
to authenticated
using ((select auth.jwt() ->> 'email') = 'lucianasalgado@admin.salgadosdalu.com')
with check ((select auth.jwt() ->> 'email') = 'lucianasalgado@admin.salgadosdalu.com');

drop policy if exists "Administrador remove produtos" on public.products;
create policy "Administrador remove produtos"
on public.products
for delete
to authenticated
using ((select auth.jwt() ->> 'email') = 'lucianasalgado@admin.salgadosdalu.com');

drop policy if exists "Galeria publica" on public.gallery_photos;
create policy "Galeria publica"
on public.gallery_photos
for select
to anon
using (active = true);

drop policy if exists "Administrador le galeria" on public.gallery_photos;
create policy "Administrador le galeria"
on public.gallery_photos
for select
to authenticated
using ((select auth.jwt() ->> 'email') = 'lucianasalgado@admin.salgadosdalu.com');

drop policy if exists "Administrador cria fotos" on public.gallery_photos;
create policy "Administrador cria fotos"
on public.gallery_photos
for insert
to authenticated
with check ((select auth.jwt() ->> 'email') = 'lucianasalgado@admin.salgadosdalu.com');

drop policy if exists "Administrador atualiza fotos" on public.gallery_photos;
create policy "Administrador atualiza fotos"
on public.gallery_photos
for update
to authenticated
using ((select auth.jwt() ->> 'email') = 'lucianasalgado@admin.salgadosdalu.com')
with check ((select auth.jwt() ->> 'email') = 'lucianasalgado@admin.salgadosdalu.com');

drop policy if exists "Administrador remove fotos" on public.gallery_photos;
create policy "Administrador remove fotos"
on public.gallery_photos
for delete
to authenticated
using ((select auth.jwt() ->> 'email') = 'lucianasalgado@admin.salgadosdalu.com');

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'site-images',
  'site-images',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Administrador envia imagens" on storage.objects;
create policy "Administrador envia imagens"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'site-images'
  and (select auth.jwt() ->> 'email') = 'lucianasalgado@admin.salgadosdalu.com'
);

drop policy if exists "Administrador atualiza imagens" on storage.objects;
create policy "Administrador atualiza imagens"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'site-images'
  and (select auth.jwt() ->> 'email') = 'lucianasalgado@admin.salgadosdalu.com'
)
with check (
  bucket_id = 'site-images'
  and (select auth.jwt() ->> 'email') = 'lucianasalgado@admin.salgadosdalu.com'
);

drop policy if exists "Administrador remove imagens" on storage.objects;
create policy "Administrador remove imagens"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'site-images'
  and (select auth.jwt() ->> 'email') = 'lucianasalgado@admin.salgadosdalu.com'
);

insert into public.products (id, name, category, price, image_url, sort_order, active)
values
  ('bolinho-queijo', 'Bolinho de Queijo', 'Salgados', '', 'assets/fotos/foto-10.jpg', 10, true),
  ('risole-frango', 'Risole de Frango', 'Salgados', '', 'assets/fotos/foto-07.jpg', 20, true),
  ('coxinha', 'Coxinha', 'Salgados', '', 'assets/fotos/foto-05.jpg', 30, true),
  ('kibe-frito', 'Kibe Frito', 'Salgados', '', 'assets/fotos/foto-11.jpg', 40, true),
  ('kibe-forno', 'Kibe de Forno', 'Salgados', '', 'assets/fotos/foto-16.jpg', 50, true),
  ('empadinha', 'Empadinha', 'Salgados', '', 'assets/fotos/foto-18.jpg', 60, true),
  ('croquete-frango', 'Croquete de Frango', 'Salgados', '', 'assets/fotos/foto-01.jpg', 70, true),
  ('espetinho-frango', 'Espetinho de Frango', 'Salgados', '', 'assets/fotos/foto-03.jpg', 80, true),
  ('escondidinho-camarao', 'Escondidinho de Camarão', 'Salgados', '', 'assets/fotos/foto-09.jpg', 90, true),
  ('doce-aipim', 'Doce de Aipim', 'Doces', '', 'assets/fotos/doce-de-aipim.jpg', 100, true),
  ('bolo-pote', 'Bolo de Pote', 'Doces', '', 'assets/fotos/bolo-de-pote.jpg', 110, true),
  ('combo-festa', 'Combo para Festa', 'Encomendas', '', 'assets/fotos/foto-15.jpg', 120, true)
on conflict (id) do update
set
  name = excluded.name,
  category = excluded.category,
  image_url = excluded.image_url,
  sort_order = excluded.sort_order;

insert into public.gallery_photos (image_url, alt, sort_order, active)
select seed.image_url, seed.alt, seed.sort_order, true
from (
  values
    ('assets/fotos/foto-02.jpg', 'Salgados preparados pela Lu', 10),
    ('assets/fotos/foto-05.jpg', 'Coxinhas da Salgados da Lu', 20),
    ('assets/fotos/foto-16.jpg', 'Kibe de forno preparado pela Lu', 30),
    ('assets/fotos/foto-19.jpg', 'Produção da Salgados da Lu', 40)
) as seed(image_url, alt, sort_order)
where not exists (
  select 1
  from public.gallery_photos current_photo
  where current_photo.image_url = seed.image_url
);
