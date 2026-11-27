/** Tipos de vinho e de outras bebidas (o nome «TipoVinho» ficou por já estar em todo o código). */
export type TipoVinho =
  | 'tinto' | 'branco' | 'rose' | 'espumante' | 'porto'
  | 'madeira' | 'moscatel' | 'sobremesa'
  | 'whisky' | 'destilado' | 'licor' | 'cerveja' | 'sidra' | 'sake'
  | 'outro';

export type GrupoTipo = 'vinho' | 'bebida';

export const TIPOS: { id: TipoVinho; nome: string; grupo: GrupoTipo }[] = [
  { id: 'tinto', nome: 'Tinto', grupo: 'vinho' },
  { id: 'branco', nome: 'Branco', grupo: 'vinho' },
  { id: 'rose', nome: 'Rosé', grupo: 'vinho' },
  { id: 'espumante', nome: 'Espumante', grupo: 'vinho' },
  { id: 'porto', nome: 'Porto', grupo: 'vinho' },
  { id: 'madeira', nome: 'Madeira', grupo: 'vinho' },
  { id: 'moscatel', nome: 'Moscatel', grupo: 'vinho' },
  { id: 'sobremesa', nome: 'Sobremesa', grupo: 'vinho' },
  { id: 'whisky', nome: 'Whisky', grupo: 'bebida' },
  { id: 'destilado', nome: 'Destilado', grupo: 'bebida' },
  { id: 'licor', nome: 'Licor', grupo: 'bebida' },
  { id: 'cerveja', nome: 'Cerveja', grupo: 'bebida' },
  { id: 'sidra', nome: 'Sidra', grupo: 'bebida' },
  { id: 'sake', nome: 'Saquê', grupo: 'bebida' },
  { id: 'outro', nome: 'Outro', grupo: 'bebida' },
];

/** Vinho (tinto, branco, porto…) ou outra bebida (whisky, licor, cerveja…). */
export const ehBebida = (t: TipoVinho) => TIPOS.find((x) => x.id === t)?.grupo === 'bebida';

export type Nivel = 1 | 2 | 3 | 4 | 5;

export interface GuiaVinho {
  temperaturaMin: number;
  temperaturaMax: number;
  decantar: 'nao' | 'opcional' | 'sim';
  decantarMinutos?: number;
  decantarNota?: string;
  copo: string;
  janelaDe?: number;
  janelaAte?: number;
  picoDe?: number;
  picoAte?: number;
  harmonizacoes: { prato: string; porque?: string }[];
  evitar?: string[];
  perfil?: { corpo: Nivel; acidez: Nivel; taninos?: Nivel; docura: Nivel };
  notasProva?: string;
  /** Quando abrir: verão, inverno, Natal, aperitivo, digestivo, convívio, ocasião especial… */
  ocasioes?: string[];
}

/** Uma loja ou site onde se viu o preço. A moeda é EUR se não vier indicada. */
export interface FonteCritica {
  /** Ex.: "Wine Advocate", "Vivino", "Revista de Vinhos". */
  fonte: string;
  pontos?: number;
  /** Escala da nota original: 100, 20 ou 5 (Vivino). */
  escala?: 100 | 20 | 5;
  url?: string;
  colheita?: number;
  /** A nota é de outra colheita do mesmo vinho. */
  outraColheita?: boolean;
  nota?: string;
}

export interface Criticas {
  /** Pontuação agregada, 0 a 100. */
  pontuacao?: number;
  fontes: FonteCritica[];
  /** O que a crítica diz, em poucas linhas. */
  resumo?: string;
  atualizadoEm?: string;
}

/** Nota numa escala de 0 a 100. */
export const pontos100 = (f: FonteCritica): number | undefined =>
  f.pontos === undefined ? undefined : Math.round(f.pontos * (f.escala === 20 ? 5 : f.escala === 5 ? 20 : 1));

export interface FonteValor {
  titulo: string;
  url: string;
  preco?: number;
  moeda?: 'EUR' | 'GBP' | 'USD';
  /** Ex.: "sem IVA (in bond)", "colheita 2020", "esgotado". */
  nota?: string;
}

export interface Vinho {
  id: string;
  nome: string;
  produtor?: string;
  ano?: number;
  tipo: TipoVinho;
  pais: string;
  regiao?: string;
  denominacao?: string;
  castas: string[];
  teorAlcool?: number;
  volumeMl: number;

  quantidade: number;
  localizacao?: string;
  dataCompra?: string;
  precoCompra?: number;
  localCompra?: string;
  codigoBarras?: string;

  valorEstimado?: number;
  valorMin?: number;
  valorMax?: number;
  valorFontes: FonteValor[];
  valorAtualizadoEm?: string;

  guia?: GuiaVinho;
  guiaOrigem?: 'regras' | 'claude';

  criticas?: Criticas;

  fotoPath?: string;
  /** Foto da garrafa na net (só o endereço). A foto do próprio Tiago ganha sempre. */
  fotoUrl?: string;
  favorito: boolean;
  notas?: string;
  tags: string[];

  criadoEm: string;
  atualizadoEm: string;
}

export interface Consumo {
  id: string;
  vinhoId: string;
  data: string;
  ocasiao?: string;
  prato?: string;
  nota?: number;
  comentario?: string;
}
