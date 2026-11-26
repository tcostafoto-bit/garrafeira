import { supabase } from './supabase';
import type { Vinho } from '../types';

/** Dados que o formulário envia (o resto é gerido pela base de dados). */
export type DadosVinho = Omit<Vinho, 'criadoEm' | 'atualizadoEm'>;

// ───────────── Conversão entre a base de dados (snake_case) e a app (camelCase) ─────────────

type Linha = Record<string, unknown>;

const n = <T,>(v: unknown): T | undefined => (v === null || v === undefined ? undefined : (v as T));
const num = (v: unknown): number | undefined => (v === null || v === undefined || v === '' ? undefined : Number(v));

export function deLinha(r: Linha): Vinho {
  return {
    id: r.id as string,
    nome: r.nome as string,
    produtor: n(r.produtor),
    ano: num(r.ano),
    tipo: r.tipo as Vinho['tipo'],
    pais: (r.pais as string) ?? 'Portugal',
    regiao: n(r.regiao),
    denominacao: n(r.denominacao),
    castas: (r.castas as string[]) ?? [],
    teorAlcool: num(r.teor_alcool),
    volumeMl: num(r.volume_ml) ?? 750,
    quantidade: num(r.quantidade) ?? 0,
    localizacao: n(r.localizacao),
    dataCompra: n(r.data_compra),
    precoCompra: num(r.preco_compra),
    localCompra: n(r.local_compra),
    codigoBarras: n(r.codigo_barras),
    valorEstimado: num(r.valor_estimado),
    valorMin: num(r.valor_min),
    valorMax: num(r.valor_max),
    valorFontes: (r.valor_fontes as Vinho['valorFontes']) ?? [],
    valorAtualizadoEm: n(r.valor_atualizado_em),
    guia: n(r.guia),
    guiaOrigem: n(r.guia_origem),
    fotoPath: n(r.foto_path),
    favorito: Boolean(r.favorito),
    notas: n(r.notas),
    tags: (r.tags as string[]) ?? [],
    criadoEm: r.criado_em as string,
    atualizadoEm: r.atualizado_em as string,
  };
}

export function paraLinha(v: DadosVinho): Linha {
  const z = <T,>(x: T | undefined) => (x === undefined || (x as unknown) === '' ? null : x);
  return {
    id: v.id,
    nome: v.nome,
    produtor: z(v.produtor),
    ano: z(v.ano),
    tipo: v.tipo,
    pais: v.pais || 'Portugal',
    regiao: z(v.regiao),
    denominacao: z(v.denominacao),
    castas: v.castas,
    teor_alcool: z(v.teorAlcool),
    volume_ml: v.volumeMl,
    quantidade: v.quantidade,
    localizacao: z(v.localizacao),
    data_compra: z(v.dataCompra),
    preco_compra: z(v.precoCompra),
    local_compra: z(v.localCompra),
    codigo_barras: z(v.codigoBarras),
    valor_estimado: z(v.valorEstimado),
    valor_min: z(v.valorMin),
    valor_max: z(v.valorMax),
    valor_fontes: v.valorFontes ?? [],
    valor_atualizado_em: z(v.valorAtualizadoEm),
    guia: z(v.guia),
    guia_origem: z(v.guiaOrigem),
    foto_path: z(v.fotoPath),
    favorito: v.favorito,
    notas: z(v.notas),
    tags: v.tags ?? [],
  };
}

/** Caminho da miniatura a partir do caminho da foto grande. */
export const caminhoMini = (fotoPath: string) => fotoPath.replace(/\.jpg$/, '-mini.jpg');

// ───────────── Repositório ─────────────
// Na nuvem usa o Supabase. Sem Supabase configurado (pré-visualização), guarda no próprio browser.

export interface Repositorio {
  listar(): Promise<Vinho[]>;
  guardar(v: DadosVinho): Promise<Vinho>;
  guardarVarios(vs: DadosVinho[]): Promise<void>;
  quantidade(id: string, q: number): Promise<void>;
  apagar(id: string): Promise<void>;
  enviarFoto(id: string, grande: Blob, mini: Blob): Promise<string>;
  apagarFoto(fotoPath: string): Promise<void>;
  urls(caminhos: string[]): Promise<Record<string, string>>;
}

const repoNuvem = (sb: NonNullable<typeof supabase>): Repositorio => ({
  async listar() {
    const { data, error } = await sb.from('vinhos').select('*').order('nome');
    if (error) throw error;
    return (data ?? []).map(deLinha);
  },
  async guardar(v) {
    const { data, error } = await sb.from('vinhos').upsert(paraLinha(v)).select().single();
    if (error) throw error;
    return deLinha(data);
  },
  async guardarVarios(vs) {
    if (!vs.length) return;
    const { error } = await sb.from('vinhos').upsert(vs.map(paraLinha));
    if (error) throw error;
  },
  async quantidade(id, q) {
    const { error } = await sb.from('vinhos').update({ quantidade: q }).eq('id', id);
    if (error) throw error;
  },
  async apagar(id) {
    const { error } = await sb.from('vinhos').delete().eq('id', id);
    if (error) throw error;
  },
  async enviarFoto(id, grande, mini) {
    const { data } = await sb.auth.getUser();
    const uid = data.user?.id;
    if (!uid) throw new Error('Sem sessão');
    const caminho = `${uid}/${id}/${Date.now()}.jpg`;
    const op = { contentType: 'image/jpeg', cacheControl: '31536000', upsert: true };
    const [a, b] = await Promise.all([
      sb.storage.from('rotulos').upload(caminho, grande, op),
      sb.storage.from('rotulos').upload(caminhoMini(caminho), mini, op),
    ]);
    if (a.error) throw a.error;
    if (b.error) throw b.error;
    return caminho;
  },
  async apagarFoto(fotoPath) {
    await sb.storage.from('rotulos').remove([fotoPath, caminhoMini(fotoPath)]);
  },
  async urls(caminhos) {
    if (!caminhos.length) return {};
    const { data, error } = await sb.storage.from('rotulos').createSignedUrls(caminhos, 60 * 60 * 6);
    if (error) throw error;
    const r: Record<string, string> = {};
    data?.forEach((d) => { if (d.signedUrl && d.path) r[d.path] = d.signedUrl; });
    return r;
  },
});

const CHAVE_LOCAL = 'garrafeira-local-v1';

function lerLocal(): { vinhos: Vinho[]; fotos: Record<string, string> } {
  try {
    const t = localStorage.getItem(CHAVE_LOCAL);
    if (t) return JSON.parse(t);
  } catch { /* sem armazenamento */ }
  return { vinhos: [], fotos: {} };
}
function escreverLocal(d: { vinhos: Vinho[]; fotos: Record<string, string> }) {
  try { localStorage.setItem(CHAVE_LOCAL, JSON.stringify(d)); } catch { /* cheio ou bloqueado */ }
}
const paraDataUrl = (b: Blob) => new Promise<string>((ok, falha) => {
  const r = new FileReader();
  r.onload = () => ok(r.result as string);
  r.onerror = falha;
  r.readAsDataURL(b);
});

const repoLocal: Repositorio = {
  async listar() {
    return lerLocal().vinhos.sort((a, b) => a.nome.localeCompare(b.nome, 'pt'));
  },
  async guardar(v) {
    const d = lerLocal();
    const agora = new Date().toISOString();
    const antigo = d.vinhos.find((x) => x.id === v.id);
    const novo: Vinho = { ...v, criadoEm: antigo?.criadoEm ?? agora, atualizadoEm: agora };
    d.vinhos = antigo ? d.vinhos.map((x) => (x.id === v.id ? novo : x)) : [...d.vinhos, novo];
    escreverLocal(d);
    return novo;
  },
  async guardarVarios(vs) { for (const v of vs) await repoLocal.guardar(v); },
  async quantidade(id, q) {
    const d = lerLocal();
    d.vinhos = d.vinhos.map((x) => (x.id === id ? { ...x, quantidade: q } : x));
    escreverLocal(d);
  },
  async apagar(id) {
    const d = lerLocal();
    d.vinhos = d.vinhos.filter((x) => x.id !== id);
    escreverLocal(d);
  },
  async enviarFoto(id, grande, mini) {
    const d = lerLocal();
    const caminho = `local/${id}/${Date.now()}.jpg`;
    d.fotos[caminho] = await paraDataUrl(grande);
    d.fotos[caminhoMini(caminho)] = await paraDataUrl(mini);
    escreverLocal(d);
    return caminho;
  },
  async apagarFoto(fotoPath) {
    const d = lerLocal();
    delete d.fotos[fotoPath];
    delete d.fotos[caminhoMini(fotoPath)];
    escreverLocal(d);
  },
  async urls(caminhos) {
    const f = lerLocal().fotos;
    return Object.fromEntries(caminhos.filter((c) => f[c]).map((c) => [c, f[c]]));
  },
};

export const repo: Repositorio = supabase ? repoNuvem(supabase) : repoLocal;
export const modoLocal = !supabase;
