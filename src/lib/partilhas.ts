/** Partilhar com amigos, só para ver: uma garrafa ou a garrafeira toda, por uma ligação secreta que se pode desligar. */
import { supabase } from './supabase';
import { deLinha } from './vinhos';
import type { Vinho } from '../types';

export interface Partilha { id: string; tipo: 'garrafeira' | 'vinho'; vinhoId?: string; token: string; mostrarPrecos: boolean }
export interface VistaPartilha { tipo: 'garrafeira' | 'vinho'; mostrarPrecos: boolean; vinhos: Vinho[] }

/** A migração 002 ainda não foi corrida no Supabase. */
export class FaltaMigracao extends Error {}

export const ligacao = (token: string) => `${location.origin}/#/v/${token}`;
export const tokenDoEndereco = () => location.hash.match(/^#\/v\/([a-z0-9]{32,})$/i)?.[1];

const erroDe = (e: { code?: string; message?: string }) =>
  e.code === '42P01' || e.code === 'PGRST205' || e.code === 'PGRST202' || /does not exist|schema cache|Could not find/i.test(e.message ?? '')
    ? new FaltaMigracao() : new Error(e.message);

type Linha = Record<string, unknown>;
const deLinhaPartilha = (r: Linha): Partilha => ({
  id: r.id as string, tipo: r.tipo as Partilha['tipo'], vinhoId: (r.vinho_id as string | null) ?? undefined,
  token: r.token as string, mostrarPrecos: Boolean(r.mostrar_precos),
});

// ───────────── Pré-visualização (sem Supabase): guarda no browser, a ligação só abre neste browser ─────────────
const CHAVE = 'garrafeira-partilhas-v1';
const lerLocal = (): Partilha[] => { try { return JSON.parse(localStorage.getItem(CHAVE) ?? '[]'); } catch { return []; } };
const gravarLocal = (l: Partilha[]) => { try { localStorage.setItem(CHAVE, JSON.stringify(l)); } catch { /* sem armazenamento */ } };
const novoToken = () => Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) => b.toString(16).padStart(2, '0')).join('');

/** O que um amigo pode ver de um vinho (o mesmo recorte que a função da base de dados faz). */
function recortar(v: Vinho, precos: boolean): Vinho {
  return {
    id: v.id, nome: v.nome, produtor: v.produtor, ano: v.ano, tipo: v.tipo, pais: v.pais, regiao: v.regiao,
    denominacao: v.denominacao, castas: v.castas, teorAlcool: v.teorAlcool, volumeMl: v.volumeMl,
    guia: v.guia, guiaOrigem: v.guiaOrigem, criticas: v.criticas, fotoUrl: v.fotoUrl,
    valorEstimado: precos ? v.valorEstimado : undefined, valorMin: precos ? v.valorMin : undefined, valorMax: precos ? v.valorMax : undefined,
    quantidade: 0, valorFontes: [], favorito: false, tags: [], criadoEm: '', atualizadoEm: '',
  };
}

// ───────────── API ─────────────

export async function listarPartilhas(): Promise<Partilha[]> {
  if (!supabase) return lerLocal();
  const { data, error } = await supabase.from('partilhas').select('*');
  if (error) throw erroDe(error);
  return (data ?? []).map(deLinhaPartilha);
}

export async function criarPartilha(tipo: Partilha['tipo'], vinhoId: string | undefined, mostrarPrecos: boolean): Promise<Partilha> {
  if (!supabase) {
    const p: Partilha = { id: crypto.randomUUID(), tipo, vinhoId, token: novoToken(), mostrarPrecos };
    gravarLocal([...lerLocal(), p]);
    return p;
  }
  const { data, error } = await supabase.from('partilhas')
    .insert({ tipo, vinho_id: vinhoId ?? null, mostrar_precos: mostrarPrecos }).select('*').single();
  if (error) throw erroDe(error);
  return deLinhaPartilha(data);
}

export async function alterarPrecos(id: string, mostrarPrecos: boolean): Promise<void> {
  if (!supabase) return gravarLocal(lerLocal().map((p) => (p.id === id ? { ...p, mostrarPrecos } : p)));
  const { error } = await supabase.from('partilhas').update({ mostrar_precos: mostrarPrecos }).eq('id', id);
  if (error) throw erroDe(error);
}

export async function apagarPartilha(id: string): Promise<void> {
  if (!supabase) return gravarLocal(lerLocal().filter((p) => p.id !== id));
  const { error } = await supabase.from('partilhas').delete().eq('id', id);
  if (error) throw erroDe(error);
}

/** Leitura pública pela ligação. Devolve null se a ligação não existe ou foi desligada. */
export async function verPartilha(token: string): Promise<VistaPartilha | null> {
  if (!supabase) {
    const p = lerLocal().find((x) => x.token === token);
    if (!p) return null;
    let vinhos: Vinho[] = [];
    try { vinhos = JSON.parse(localStorage.getItem('garrafeira-local-v1') ?? '{}').vinhos ?? []; } catch { /* vazio */ }
    const lista = vinhos.filter((v) => (p.tipo === 'garrafeira' ? v.quantidade > 0 : v.id === p.vinhoId));
    return { tipo: p.tipo, mostrarPrecos: p.mostrarPrecos, vinhos: lista.map((v) => recortar(v, p.mostrarPrecos)) };
  }
  const { data, error } = await supabase.rpc('ver_partilha', { p_token: token });
  if (error) throw erroDe(error);
  if (!data) return null;
  const d = data as { tipo: Partilha['tipo']; mostrar_precos: boolean; vinhos: Linha[] };
  return { tipo: d.tipo, mostrarPrecos: d.mostrar_precos, vinhos: (d.vinhos ?? []).map(deLinha) };
}
