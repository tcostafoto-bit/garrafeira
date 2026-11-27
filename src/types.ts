export type TipoVinho =
  | 'tinto' | 'branco' | 'rose' | 'espumante' | 'porto'
  | 'madeira' | 'moscatel' | 'sobremesa' | 'outro';

export const TIPOS: { id: TipoVinho; nome: string }[] = [
  { id: 'tinto', nome: 'Tinto' },
  { id: 'branco', nome: 'Branco' },
  { id: 'rose', nome: 'Rosé' },
  { id: 'espumante', nome: 'Espumante' },
  { id: 'porto', nome: 'Porto' },
  { id: 'madeira', nome: 'Madeira' },
  { id: 'moscatel', nome: 'Moscatel' },
  { id: 'sobremesa', nome: 'Sobremesa' },
  { id: 'outro', nome: 'Outro' },
];

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
}

/** Uma loja ou site onde se viu o preço. A moeda é EUR se não vier indicada. */
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

  fotoPath?: string;
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
