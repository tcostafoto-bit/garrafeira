-- 003: aceitar outros tipos de bebida (whisky, destilado, licor, cerveja, sidra, sake).
-- Seguro: não apaga nem altera dados; pode correr-se mais de uma vez.
do $$
declare c record;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.vinhos'::regclass and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%tipo%'
  loop
    execute format('alter table public.vinhos drop constraint %I', c.conname);
  end loop;
end $$;

alter table public.vinhos add constraint vinhos_tipo_check check (tipo in
  ('tinto','branco','rose','espumante','porto','madeira','moscatel','sobremesa',
   'whisky','destilado','licor','cerveja','sidra','sake','outro'));
