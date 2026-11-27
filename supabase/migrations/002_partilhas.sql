-- Garrafeira · migração 002 · partilhar com amigos (só para ver)
-- Colar tudo no Supabase → SQL Editor → Run. Pode correr-se mais do que uma vez sem estragar nada.
--
-- Como funciona:
--  • Cada partilha é uma linha em `partilhas` com uma ligação secreta (64 letras e números aleatórios).
--  • Quem tem a ligação chama `ver_partilha(ligação)`, que devolve SÓ os campos permitidos e NUNCA escreve nada.
--  • As tabelas dos vinhos continuam fechadas: ninguém sem sessão consegue lê-las diretamente.
--  • Para parar de partilhar basta apagar a linha (a app faz isso).

create table if not exists public.partilhas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  token text not null unique default replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  tipo text not null check (tipo in ('garrafeira', 'vinho')),
  vinho_id uuid references public.vinhos on delete cascade,
  mostrar_precos boolean not null default true,
  criado_em timestamptz not null default now(),
  constraint partilhas_vinho_certo check ((tipo = 'vinho') = (vinho_id is not null))
);

alter table public.partilhas alter column mostrar_precos set default true;

create index if not exists partilhas_user_idx on public.partilhas (user_id);
-- Uma ligação para a garrafeira toda e uma por vinho.
create unique index if not exists partilhas_uma_garrafeira on public.partilhas (user_id) where tipo = 'garrafeira';
create unique index if not exists partilhas_um_vinho on public.partilhas (vinho_id) where tipo = 'vinho';

alter table public.partilhas enable row level security;

drop policy if exists "dono le" on public.partilhas;
drop policy if exists "dono cria" on public.partilhas;
drop policy if exists "dono altera" on public.partilhas;
drop policy if exists "dono apaga" on public.partilhas;
create policy "dono le" on public.partilhas for select using (user_id = auth.uid());
create policy "dono cria" on public.partilhas for insert with check (
  user_id = auth.uid()
  and (vinho_id is null or exists (select 1 from public.vinhos v where v.id = vinho_id and v.user_id = auth.uid()))
);
create policy "dono altera" on public.partilhas for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "dono apaga" on public.partilhas for delete using (user_id = auth.uid());

-- Leitura pública por ligação. Só campos de "ficha de vinho"; nunca preço de compra, locais, notas, fotos privadas,
-- favoritos, etiquetas, quantidades, fontes de preço nem o Diário.
create or replace function public.ver_partilha(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  p public.partilhas;
  lista jsonb;
begin
  if p_token is null or length(p_token) < 32 then return null; end if;
  select * into p from public.partilhas where token = p_token;
  if not found then return null; end if;

  select coalesce(jsonb_agg(s.x order by s.x ->> 'nome'), '[]'::jsonb) into lista
  from (
    select jsonb_build_object(
      'id', v.id, 'nome', v.nome, 'produtor', v.produtor, 'ano', v.ano, 'tipo', v.tipo,
      'pais', v.pais, 'regiao', v.regiao, 'denominacao', v.denominacao, 'castas', v.castas,
      'teor_alcool', v.teor_alcool, 'volume_ml', v.volume_ml,
      'guia', v.guia, 'guia_origem', v.guia_origem,
      'valor_estimado', case when p.mostrar_precos then v.valor_estimado end,
      'valor_min', case when p.mostrar_precos then v.valor_min end,
      'valor_max', case when p.mostrar_precos then v.valor_max end
    ) as x
    from public.vinhos v
    where v.user_id = p.user_id
      and ((p.tipo = 'garrafeira' and v.quantidade > 0) or (p.tipo = 'vinho' and v.id = p.vinho_id))
  ) s;

  return jsonb_build_object('tipo', p.tipo, 'mostrar_precos', p.mostrar_precos, 'vinhos', lista);
end $$;

revoke all on function public.ver_partilha(text) from public;
grant execute on function public.ver_partilha(text) to anon, authenticated;
