-- Garrafeira · migração inicial
-- Colar tudo no Supabase → SQL Editor → Run. Pode correr-se mais do que uma vez sem estragar nada.

-- ───────────── Tabelas ─────────────
create table if not exists public.vinhos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,

  nome text not null,
  produtor text,
  ano int,                                   -- null = NV
  tipo text not null default 'tinto'
    check (tipo in ('tinto','branco','rose','espumante','porto','madeira','moscatel','sobremesa','outro')),
  pais text default 'Portugal',
  regiao text,
  denominacao text,
  castas text[] not null default '{}',
  teor_alcool numeric(4,1),
  volume_ml int not null default 750,

  quantidade int not null default 1 check (quantidade >= 0),
  localizacao text,
  data_compra date,
  preco_compra numeric(10,2),
  local_compra text,
  codigo_barras text,

  valor_estimado numeric(10,2),
  valor_min numeric(10,2),
  valor_max numeric(10,2),
  valor_fontes jsonb not null default '[]',
  valor_atualizado_em date,

  guia jsonb,
  guia_origem text check (guia_origem in ('regras','claude')),

  foto_path text,
  favorito boolean not null default false,
  notas text,
  tags text[] not null default '{}',

  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists public.consumos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  vinho_id uuid not null references public.vinhos on delete cascade,
  data date not null default current_date,
  ocasiao text,
  prato text,
  nota numeric(2,1) check (nota between 0.5 and 5),
  comentario text,
  criado_em timestamptz not null default now()
);

create table if not exists public.localizacoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  nome text not null,
  ordem int not null default 0
);

create index if not exists vinhos_user_idx on public.vinhos (user_id);
create index if not exists consumos_vinho_idx on public.consumos (vinho_id);

-- atualizado_em automático
create or replace function public.tocar_atualizado_em() returns trigger
language plpgsql as $$ begin new.atualizado_em = now(); return new; end $$;
drop trigger if exists vinhos_atualizado_em on public.vinhos;
create trigger vinhos_atualizado_em before update on public.vinhos
  for each row execute function public.tocar_atualizado_em();

-- ───────────── Row Level Security ─────────────
alter table public.vinhos enable row level security;
alter table public.consumos enable row level security;
alter table public.localizacoes enable row level security;

do $$
declare t text;
begin
  foreach t in array array['vinhos','consumos','localizacoes'] loop
    execute format('drop policy if exists "dono le" on public.%I', t);
    execute format('drop policy if exists "dono cria" on public.%I', t);
    execute format('drop policy if exists "dono altera" on public.%I', t);
    execute format('drop policy if exists "dono apaga" on public.%I', t);
    execute format('create policy "dono le" on public.%I for select using (user_id = auth.uid())', t);
    execute format('create policy "dono cria" on public.%I for insert with check (user_id = auth.uid())', t);
    execute format('create policy "dono altera" on public.%I for update using (user_id = auth.uid()) with check (user_id = auth.uid())', t);
    execute format('create policy "dono apaga" on public.%I for delete using (user_id = auth.uid())', t);
  end loop;
end $$;

-- ───────────── Storage: fotos dos rótulos ─────────────
-- Bucket privado; cada utilizador só mexe na pasta {user_id}/
insert into storage.buckets (id, name, public)
values ('rotulos', 'rotulos', false)
on conflict (id) do nothing;

drop policy if exists "rotulos dono le" on storage.objects;
drop policy if exists "rotulos dono cria" on storage.objects;
drop policy if exists "rotulos dono altera" on storage.objects;
drop policy if exists "rotulos dono apaga" on storage.objects;

create policy "rotulos dono le" on storage.objects for select
  using (bucket_id = 'rotulos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "rotulos dono cria" on storage.objects for insert
  with check (bucket_id = 'rotulos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "rotulos dono altera" on storage.objects for update
  using (bucket_id = 'rotulos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "rotulos dono apaga" on storage.objects for delete
  using (bucket_id = 'rotulos' and (storage.foldername(name))[1] = auth.uid()::text);
