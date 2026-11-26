// Vercel Cron diário: faz uma query leve para o Supabase grátis não pausar ao fim de 7 dias.
// Usa só a anon key (a RLS devolve uma lista vazia, mas conta como atividade na base de dados).
export async function GET(req: Request): Promise<Response> {
  const segredo = process.env.CRON_SECRET;
  if (segredo && req.headers.get('authorization') !== `Bearer ${segredo}`) {
    return new Response('Não autorizado', { status: 401 });
  }
  const url = process.env.VITE_SUPABASE_URL;
  const chave = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !chave) return new Response('Falta configurar o Supabase', { status: 500 });

  const r = await fetch(`${url}/rest/v1/vinhos?select=id&limit=1`, {
    headers: { apikey: chave, Authorization: `Bearer ${chave}` },
  });
  return Response.json({ ok: r.ok, estado: r.status, em: new Date().toISOString() });
}
