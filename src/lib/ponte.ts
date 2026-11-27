/**
 * Ponte com o Claude (Fase 3).
 * O Claude devolve fichas num bloco de texto:
 *
 *   GARRAFEIRA v1
 *   { "acao": "criar", "vinhos": [ { "nome": "...", ... } ] }
 *
 * A primeira linha e as crases (```) são opcionais. Podem vir vários blocos colados de uma vez.
 * "acao" pode ser "criar" (por omissão) ou "atualizar" (com "id" de um vinho que já existe).
 */
import type { DadosVinho } from './vinhos';
import { TIPOS, type Criticas, type FonteCritica, type FonteValor, type GuiaVinho, type Nivel, type TipoVinho, type Vinho } from '../types';

export const CABECALHO = 'GARRAFEIRA v1';

export type Escolha = 'criar' | 'somar' | 'substituir' | 'ignorar';

export interface ItemImportado {
  /** Campos que vieram no bloco (só os que tinham valor). */
  campos: Partial<DadosVinho>;
  acao: 'criar' | 'atualizar';
  existente?: Vinho;
  avisos: string[];
  /** Campos de valor que o bloco manda explicitamente limpar (null), para apagar preços antigos. */
  limpar: ('valorMin' | 'valorMax' | 'valorEstimado')[];
  /** Acrescentos ao guia que já existe (ocasiões, notas de prova, pratos...), sem refazer o guia todo. */
  guiaMais?: Partial<GuiaVinho>;
}

export interface ResultadoLeitura { itens: ItemImportado[]; erros: string[] }

const semAcentos = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/** Chave para reconhecer o mesmo vinho: nome + ano (sem acentos nem maiúsculas). */
export const chaveVinho = (nome: string, ano?: number) => `${semAcentos(nome).replace(/\s+/g, ' ')}|${ano ?? 'nv'}`;

// ───────────── Leitura do texto ─────────────

function extrairJsons(texto: string): { json: unknown; erro?: string }[] {
  const limpo = texto.replace(/\r\n?/g, '\n').replace(/[“”]/g, '"').replace(/ /g, ' ');
  const re = /GARRAFEIRA\s*v\s*1/gi;
  const partes = re.test(limpo) ? limpo.split(re).slice(1) : [limpo];
  return partes.map((p) => {
    const sem = p.replace(/^\s*```[a-z]*\s*$/gim, '');
    const i = sem.search(/[[{]/);
    const j = Math.max(sem.lastIndexOf('}'), sem.lastIndexOf(']'));
    if (i < 0 || j < i) return { json: undefined }; // texto sem dados (ex.: uma frase que menciona o cabeçalho)
    try {
      return { json: JSON.parse(sem.slice(i, j + 1)) };
    } catch {
      return { json: null, erro: 'O bloco está incompleto ou foi cortado. Copia-o outra vez do início ao fim.' };
    }
  });
}

export function lerBloco(texto: string, atuais: Vinho[]): ResultadoLeitura {
  const erros: string[] = [];
  const itens: ItemImportado[] = [];
  if (!texto.trim()) return { itens, erros };

  const porId = new Map(atuais.map((v) => [v.id, v]));
  const porChave = new Map(atuais.map((v) => [chaveVinho(v.nome, v.ano), v]));

  extrairJsons(texto).forEach(({ json, erro }, b) => {
    if (erro) { erros.push(erro); return; }
    if (json === undefined) return;
    let acaoBloco: 'criar' | 'atualizar' = 'criar';
    let lista: unknown[];
    if (Array.isArray(json)) lista = json;
    else if (json && typeof json === 'object') {
      const o = json as Record<string, unknown>;
      if (o.acao === 'atualizar' || o.acao === 'inventario') acaoBloco = 'atualizar';
      lista = Array.isArray(o.vinhos) ? o.vinhos : o.vinho ? [o.vinho] : o.nome ? [o] : [];
    } else lista = [];
    if (!lista.length) { erros.push(`O bloco ${b + 1} não tem vinhos.`); return; }

    lista.forEach((bruto, k) => {
      const r = normalizar(bruto);
      if (!r) { erros.push(`Bloco ${b + 1}, vinho ${k + 1}: falta o nome.`); return; }
      const existente = (r.campos.id && porId.get(r.campos.id))
        || porChave.get(chaveVinho(r.campos.nome!, r.campos.ano));
      const acao = acaoBloco === 'atualizar' && existente ? 'atualizar' : 'criar';
      if (acaoBloco === 'atualizar' && !existente) r.avisos.push('Não encontrei este vinho na garrafeira: vai ser criado.');
      itens.push({ campos: r.campos, acao, existente: existente || undefined, avisos: r.avisos, limpar: r.limpar, guiaMais: guiaMais(bruto) });
    });
  });
  if (!itens.length && !erros.length) erros.push('Não encontrei nenhum vinho. Cola o bloco GARRAFEIRA v1 que o Claude te deu.');
  return { itens, erros };
}

// ───────────── Normalização de um vinho ─────────────

const ehVazio = (v: unknown) => v === null || v === undefined || (typeof v === 'string' && !v.trim());

function numero(v: unknown): number | undefined {
  if (ehVazio(v)) return undefined;
  if (typeof v === 'number') return Number.isFinite(v) ? v : undefined;
  const t = String(v).replace(/[€%\s]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.');
  const n = Number(t);
  return Number.isFinite(n) ? n : undefined;
}
const texto = (v: unknown) => (ehVazio(v) ? undefined : String(v).trim());
const listaTexto = (v: unknown): string[] | undefined => {
  if (ehVazio(v)) return undefined;
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  return String(v).split(/[,;]/).map((x) => x.trim()).filter(Boolean);
};
const nivel = (v: unknown): Nivel | undefined => {
  const n = numero(v);
  return n === undefined ? undefined : (Math.min(5, Math.max(1, Math.round(n))) as Nivel);
};

const SINONIMOS: Record<string, TipoVinho> = {
  tinto: 'tinto', red: 'tinto', branco: 'branco', white: 'branco', rose: 'rose', rosado: 'rose',
  espumante: 'espumante', champanhe: 'espumante', champagne: 'espumante', prosecco: 'espumante', cava: 'espumante', sparkling: 'espumante',
  porto: 'porto', 'vinho do porto': 'porto', port: 'porto', madeira: 'madeira', moscatel: 'moscatel',
  sobremesa: 'sobremesa', 'colheita tardia': 'sobremesa', doce: 'sobremesa', outro: 'outro',
  whisky: 'whisky', whiskey: 'whisky', uisque: 'whisky', scotch: 'whisky', bourbon: 'whisky', 'single malt': 'whisky',
  destilado: 'destilado', espirituoso: 'destilado', aguardente: 'destilado', conhaque: 'destilado', cognac: 'destilado', brandy: 'destilado',
  armagnac: 'destilado', gin: 'destilado', rum: 'destilado', rhum: 'destilado', vodka: 'destilado', vodca: 'destilado', tequila: 'destilado',
  mezcal: 'destilado', grappa: 'destilado', bagaceira: 'destilado', calvados: 'destilado',
  licor: 'licor', liqueur: 'licor', amaro: 'licor',
  cerveja: 'cerveja', beer: 'cerveja', ale: 'cerveja', lager: 'cerveja', stout: 'cerveja', ipa: 'cerveja',
  sidra: 'sidra', cider: 'sidra', sake: 'sake', saque: 'sake',
};
function tipo(v: unknown, avisos: string[]): TipoVinho | undefined {
  if (ehVazio(v)) return undefined;
  const t = semAcentos(String(v));
  if (TIPOS.some((x) => x.id === t)) return t as TipoVinho;
  if (SINONIMOS[t]) return SINONIMOS[t];
  avisos.push(`Tipo «${v}» desconhecido: ficou como Outro.`);
  return 'outro';
}

function ano(v: unknown): number | undefined {
  if (ehVazio(v)) return undefined;
  const n = numero(v);
  return n !== undefined && Number.isInteger(n) && n > 1700 && n < 2200 ? n : undefined;
}

function data(v: unknown): string | undefined {
  const t = texto(v);
  if (!t) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  const m = t.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/);
  if (m) {
    const a = m[3].length === 2 ? `20${m[3]}` : m[3];
    return `${a}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  }
  return undefined;
}

function guia(v: unknown): GuiaVinho | undefined {
  if (!v || typeof v !== 'object') return undefined;
  const g = v as Record<string, unknown>;
  const tMin = numero(g.temperaturaMin), tMax = numero(g.temperaturaMax);
  if (tMin === undefined && tMax === undefined) return undefined;
  const dec = semAcentos(String(g.decantar ?? 'nao'));
  const harm = Array.isArray(g.harmonizacoes)
    ? g.harmonizacoes.map((h) => (typeof h === 'string' ? { prato: h } : h && typeof h === 'object'
      ? { prato: texto((h as Record<string, unknown>).prato) ?? '', porque: texto((h as Record<string, unknown>).porque) } : null))
        .filter((h): h is { prato: string; porque: string | undefined } => !!h?.prato)
    : [];
  const p = g.perfil && typeof g.perfil === 'object' ? g.perfil as Record<string, unknown> : undefined;
  const r: GuiaVinho = {
    temperaturaMin: tMin ?? tMax!,
    temperaturaMax: tMax ?? tMin!,
    decantar: dec === 'sim' ? 'sim' : dec === 'opcional' ? 'opcional' : 'nao',
    decantarMinutos: numero(g.decantarMinutos),
    decantarNota: texto(g.decantarNota),
    copo: texto(g.copo) ?? '',
    janelaDe: ano(g.janelaDe), janelaAte: ano(g.janelaAte),
    picoDe: ano(g.picoDe), picoAte: ano(g.picoAte),
    harmonizacoes: harm,
    evitar: listaTexto(g.evitar),
    perfil: p && nivel(p.corpo) ? {
      corpo: nivel(p.corpo)!, acidez: nivel(p.acidez) ?? 3, taninos: nivel(p.taninos), docura: nivel(p.docura) ?? 1,
    } : undefined,
    notasProva: texto(g.notasProva),
    ocasioes: listaTexto(g.ocasioes),
  };
  // tira as chaves vazias para o JSON ficar limpo
  Object.keys(r).forEach((k) => (r as unknown as Record<string, unknown>)[k] === undefined && delete (r as unknown as Record<string, unknown>)[k]);
  return r;
}

/** "guiaMais": só os pedaços novos do guia, juntos ao guia que o vinho já tem. */
function guiaMais(bruto: unknown): Partial<GuiaVinho> | undefined {
  const g = bruto && typeof bruto === 'object' ? (bruto as Record<string, unknown>).guiaMais : undefined;
  if (!g || typeof g !== 'object') return undefined;
  const x = g as Record<string, unknown>;
  const harm = Array.isArray(x.harmonizacoes)
    ? x.harmonizacoes.map((h) => (typeof h === 'string' ? { prato: h } : h && typeof h === 'object'
      ? { prato: texto((h as Record<string, unknown>).prato) ?? '', porque: texto((h as Record<string, unknown>).porque) } : null))
        .filter((h): h is { prato: string; porque: string | undefined } => !!h?.prato)
    : undefined;
  const r: Partial<GuiaVinho> = {
    ocasioes: listaTexto(x.ocasioes), evitar: listaTexto(x.evitar), notasProva: texto(x.notasProva),
    harmonizacoes: harm && harm.length ? harm : undefined,
  };
  Object.keys(r).forEach((k) => (r as Record<string, unknown>)[k] === undefined && delete (r as Record<string, unknown>)[k]);
  return Object.keys(r).length ? r : undefined;
}

function normalizar(bruto: unknown): { campos: Partial<DadosVinho>; avisos: string[]; limpar: ItemImportado['limpar'] } | null {
  if (!bruto || typeof bruto !== 'object') return null;
  const o = bruto as Record<string, unknown>;
  const nome = texto(o.nome);
  if (!nome) return null;
  const avisos: string[] = [];
  const c: Partial<DadosVinho> = {
    id: texto(o.id),
    nome,
    produtor: texto(o.produtor),
    ano: ano(o.ano),
    tipo: tipo(o.tipo, avisos),
    pais: texto(o.pais),
    regiao: texto(o.regiao),
    denominacao: texto(o.denominacao),
    castas: listaTexto(o.castas),
    teorAlcool: numero(o.teorAlcool),
    volumeMl: numero(o.volumeMl),
    quantidade: numero(o.quantidade) !== undefined ? Math.max(0, Math.round(numero(o.quantidade)!)) : undefined,
    localizacao: texto(o.localizacao),
    fotoUrl: (() => { const u = texto(o.fotoUrl); return u && /^https:\/\/[^\s]+$/i.test(u) ? u : undefined; })(),
    dataCompra: data(o.dataCompra),
    precoCompra: numero(o.precoCompra),
    localCompra: texto(o.localCompra),
    codigoBarras: texto(o.codigoBarras),
    valorEstimado: numero(o.valorEstimado),
    valorMin: numero(o.valorMin),
    valorMax: numero(o.valorMax),
    valorFontes: Array.isArray(o.valorFontes)
      ? o.valorFontes.filter((f) => f && typeof f === 'object' && (f as Record<string, unknown>).url)
        .map((f) => {
          const x = f as Record<string, unknown>;
          const m = String(x.moeda ?? 'EUR').toUpperCase();
          return {
            titulo: texto(x.titulo) ?? String(x.url), url: String(x.url), preco: numero(x.preco),
            moeda: m === 'GBP' || m === 'USD' ? m : undefined, nota: texto(x.nota),
          } satisfies FonteValor;
        })
      : undefined,
    valorAtualizadoEm: data(o.valorAtualizadoEm),
    guia: guia(o.guia),
    criticas: criticas(o.criticas),
    favorito: typeof o.favorito === 'boolean' ? o.favorito : undefined,
    notas: texto(o.notas),
    tags: listaTexto(o.tags),
  };
  if (c.guia) c.guiaOrigem = 'claude';
  if (o.guia && !c.guia) avisos.push('O guia veio incompleto e foi ignorado.');
  if (c.castas && !c.castas.length) delete c.castas;
  Object.keys(c).forEach((k) => (c as Record<string, unknown>)[k] === undefined && delete (c as Record<string, unknown>)[k]);
  const limpar = (['valorMin', 'valorMax', 'valorEstimado'] as const).filter((k) => o[k] === null);
  return { campos: c, avisos, limpar };
}

// ───────────── Aplicar ─────────────

/** Junta o item importado com o vinho existente, conforme a escolha. Devolve null se for para ignorar. */
function criticas(x: unknown): Criticas | undefined {
  if (!x || typeof x !== 'object') return undefined;
  const o = x as Record<string, unknown>;
  const fontes = (Array.isArray(o.fontes) ? o.fontes : [])
    .filter((f) => f && typeof f === 'object' && (f as Record<string, unknown>).fonte)
    .map((f) => {
      const y = f as Record<string, unknown>;
      const esc = numero(y.escala);
      return {
        fonte: String(y.fonte), pontos: numero(y.pontos), escala: esc === 20 || esc === 5 ? esc : 100,
        url: texto(y.url), colheita: numero(y.colheita), outraColheita: y.outraColheita === true ? true : undefined, nota: texto(y.nota),
      } satisfies FonteCritica;
    });
  const pontuacao = numero(o.pontuacao);
  const resumo = texto(o.resumo);
  if (!fontes.length && pontuacao === undefined && !resumo) return undefined;
  return { pontuacao: pontuacao !== undefined ? Math.max(0, Math.min(100, Math.round(pontuacao))) : undefined, fontes, resumo, atualizadoEm: data(o.atualizadoEm) };
}

export function aplicar(item: ItemImportado, escolha: Escolha): DadosVinho | null {
  if (escolha === 'ignorar') return null;
  const c = item.campos;
  const e = item.existente;
  if (!e || escolha === 'criar') {
    return {
      valorFontes: [], tags: [], castas: [], favorito: false, pais: 'Portugal', volumeMl: 750, quantidade: 1, tipo: 'outro',
      ...c,
      id: crypto.randomUUID(),
      nome: c.nome!,
    } as DadosVinho;
  }
  const { criadoEm: _c, atualizadoEm: _a, ...base } = e;
  if (escolha === 'somar') {
    // Mantém os dados atuais, soma as garrafas e preenche só o que faltava.
    const preenchido: Partial<DadosVinho> = {};
    (Object.keys(c) as (keyof DadosVinho)[]).forEach((k) => {
      const atual = base[k];
      const vazio = atual === undefined || atual === null || (Array.isArray(atual) && !atual.length);
      if (vazio && k !== 'id') (preenchido as Record<string, unknown>)[k] = c[k];
    });
    return { ...base, ...preenchido, quantidade: base.quantidade + (c.quantidade ?? 1) };
  }
  // substituir: os dados do Claude ganham; ficam a foto, os favoritos e a localização se o bloco não trouxer.
  const r: DadosVinho = {
    ...base, ...c,
    id: e.id, fotoPath: e.fotoPath,
    favorito: c.favorito ?? e.favorito,
    tags: c.tags ?? e.tags,
    quantidade: c.quantidade ?? e.quantidade,
  };
  item.limpar.forEach((k) => delete r[k]);
  if (item.guiaMais) {
    const g = c.guia ?? e.guia;
    if (g) r.guia = { ...g, ...item.guiaMais };
  }
  return r;
}

// ───────────── Copiar inventário para o Claude ─────────────

export function textoInventario(vinhos: Vinho[]): string {
  const lista = vinhos.map((v) => {
    const o: Record<string, unknown> = {
      id: v.id, nome: v.nome, produtor: v.produtor, ano: v.ano ?? null, tipo: v.tipo,
      pais: v.pais, regiao: v.regiao, denominacao: v.denominacao, castas: v.castas.length ? v.castas : undefined,
      volumeMl: v.volumeMl !== 750 ? v.volumeMl : undefined,
      quantidade: v.quantidade, localizacao: v.localizacao,
      precoCompra: v.precoCompra, valorEstimado: v.valorEstimado, valorAtualizadoEm: v.valorAtualizadoEm,
      janela: v.guia?.janelaDe || v.guia?.janelaAte ? `${v.guia?.janelaDe ?? ''}-${v.guia?.janelaAte ?? ''}` : undefined,
      temGuia: !!v.guia || undefined,
      favorito: v.favorito || undefined,
      notas: v.notas,
    };
    Object.keys(o).forEach((k) => o[k] === undefined && delete o[k]);
    return o;
  });
  const hoje = new Date().toISOString().slice(0, 10);
  return [
    `Esta é a minha garrafeira em ${hoje} (${vinhos.reduce((s, v) => s + v.quantidade, 0)} garrafas, ${vinhos.length} referências).`,
    'Usa-a para me aconselhares. Se quiseres alterar vinhos (valor, guia, correções), devolve um bloco',
    '"GARRAFEIRA v1" com "acao": "atualizar" e o "id" de cada vinho, só com os campos que mudam.',
    'Para vinhos novos usa "acao": "criar" com o formato habitual.',
    '',
    '```',
    CABECALHO,
    JSON.stringify({ acao: 'inventario', data: hoje, vinhos: lista }, null, 1),
    '```',
  ].join('\n');
}
