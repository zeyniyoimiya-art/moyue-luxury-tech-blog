-- 墨玥 · MoYue — esquema inicial de Supabase (PostgreSQL)
-- Autora: Lin Yue 林玥

-- Pergaminos (artículos)
create table if not exists public.articles (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null check (slug ~ '^[a-z0-9-]+$'),
  title       text not null,
  zh          text not null,                -- título en chino (con traducción en zh_meaning)
  zh_meaning  text not null,
  subtitle    text not null,
  excerpt     text not null,
  hero_url    text not null,
  hero_credit text not null,
  blocks      jsonb not null default '[]',  -- bloques tipados (validados con Zod en el cliente/servidor)
  read_min    int  not null check (read_min > 0),
  published   boolean not null default false,
  published_at date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists articles_published_idx on public.articles (published, published_at desc);

-- Cartas al erudito (formulario de contacto)
create table if not exists public.letters (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 2 and 60),
  email      text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  topic      text not null check (topic in ('inventos','personajes','ruta','moderna','empresas','otro')),
  message    text not null check (char_length(message) between 20 and 2000),
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

-- Seguridad a nivel de fila
alter table public.articles enable row level security;
alter table public.letters  enable row level security;

-- Cualquiera puede leer pergaminos publicados
create policy "lectura publica de pergaminos" on public.articles
  for select using (published = true);

-- Sólo la administradora (rol autenticado con claim admin) edita
create policy "admin edita pergaminos" on public.articles
  for all using ((auth.jwt() ->> 'role') = 'admin') with check ((auth.jwt() ->> 'role') = 'admin');

-- Cualquiera puede enviar una carta, sólo la admin puede leerlas
create policy "enviar cartas" on public.letters for insert with check (true);
create policy "admin lee cartas" on public.letters for select using ((auth.jwt() ->> 'role') = 'admin');

-- Trigger de updated_at
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
create trigger articles_touch before update on public.articles
  for each row execute function public.touch_updated_at();

-- Bucket de imágenes
insert into storage.buckets (id, name, public) values ('pergaminos', 'pergaminos', true)
  on conflict (id) do nothing;
