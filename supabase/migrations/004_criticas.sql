-- 004: pontuações e notas da crítica por vinho. Só acrescenta; não apaga nem altera dados.
alter table public.vinhos add column if not exists criticas jsonb;

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
      'guia', v.guia, 'guia_origem', v.guia_origem, 'criticas', v.criticas,
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
