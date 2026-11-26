import type { DadosVinho } from './vinhos';

/** Vinhos de exemplo para experimentar a app. Têm a etiqueta "exemplo" e podem ser removidos de uma vez. */
export const TAG_EXEMPLO = 'exemplo';

const base = {
  pais: 'Portugal', volumeMl: 750, valorFontes: [], favorito: false, tags: [TAG_EXEMPLO],
} satisfies Partial<DadosVinho>;

export function criarExemplos(): DadosVinho[] {
  const id = () => crypto.randomUUID();
  return [
    {
      ...base, id: id(), nome: 'Quinta do Crasto Vinhas Velhas', produtor: 'Quinta do Crasto', ano: 2019,
      tipo: 'tinto', regiao: 'Douro', denominacao: 'DOC Douro',
      castas: ['Touriga Nacional', 'Tinta Roriz', 'Touriga Franca', 'Tinto Cão'], teorAlcool: 14.5,
      quantidade: 3, localizacao: 'Adega · prateleira A', precoCompra: 32, valorEstimado: 35, favorito: true,
      guia: { temperaturaMin: 16, temperaturaMax: 18, decantar: 'sim', decantarMinutos: 45, copo: 'Bordeaux',
        janelaDe: 2023, janelaAte: 2034, harmonizacoes: [{ prato: 'Cabrito assado' }, { prato: 'Posta mirandesa' }] },
      guiaOrigem: 'claude',
    },
    {
      ...base, id: id(), nome: 'Esporão Reserva', produtor: 'Herdade do Esporão', ano: 2020,
      tipo: 'tinto', regiao: 'Alentejo', denominacao: 'DOC Alentejo',
      castas: ['Aragonez', 'Trincadeira', 'Cabernet Sauvignon', 'Alicante Bouschet'], teorAlcool: 14.5,
      quantidade: 6, localizacao: 'Adega · prateleira B', precoCompra: 19, valorEstimado: 21,
      guia: { temperaturaMin: 16, temperaturaMax: 18, decantar: 'opcional', copo: 'Bordeaux',
        janelaDe: 2023, janelaAte: 2030, harmonizacoes: [{ prato: 'Secretos de porco preto' }] },
      guiaOrigem: 'claude',
    },
    {
      ...base, id: id(), nome: 'Soalheiro Alvarinho', produtor: 'Soalheiro', ano: 2023,
      tipo: 'branco', regiao: 'Vinho Verde', denominacao: 'DOC Vinho Verde · Monção e Melgaço',
      castas: ['Alvarinho'], teorAlcool: 12.5,
      quantidade: 4, localizacao: 'Frigorífico de vinhos', precoCompra: 14, valorEstimado: 15,
      guia: { temperaturaMin: 8, temperaturaMax: 10, decantar: 'nao', copo: 'Branco',
        janelaDe: 2024, janelaAte: 2028, harmonizacoes: [{ prato: 'Marisco' }, { prato: 'Robalo grelhado' }] },
      guiaOrigem: 'claude',
    },
    {
      ...base, id: id(), nome: 'Redoma Branco', produtor: 'Niepoort', ano: 2021,
      tipo: 'branco', regiao: 'Douro', denominacao: 'DOC Douro',
      castas: ['Rabigato', 'Códega do Larinho', 'Viosinho', 'Gouveio'], teorAlcool: 12.5,
      quantidade: 2, localizacao: 'Frigorífico de vinhos', precoCompra: 24, valorEstimado: 26,
      guia: { temperaturaMin: 10, temperaturaMax: 12, decantar: 'nao', copo: 'Borgonha (branco)',
        janelaDe: 2023, janelaAte: 2031, harmonizacoes: [{ prato: 'Bacalhau com natas' }] },
      guiaOrigem: 'claude',
    },
    {
      ...base, id: id(), nome: "Graham's 10 Anos Tawny", produtor: "W. & J. Graham's",
      tipo: 'porto', regiao: 'Douro', denominacao: 'DOP Porto',
      castas: ['Touriga Nacional', 'Touriga Franca', 'Tinta Barroca'], teorAlcool: 20,
      quantidade: 1, localizacao: 'Sala · aparador', precoCompra: 29, valorEstimado: 30,
      notas: 'Aberto dura algumas semanas. Bom com queijo da Serra.',
    },
    {
      ...base, id: id(), nome: 'Murganheira Bruto Reserva', produtor: 'Caves da Murganheira', ano: 2018,
      tipo: 'espumante', regiao: 'Távora-Varosa', denominacao: 'DOC Távora-Varosa',
      castas: ['Malvasia Fina', 'Gouveio', 'Pinot Noir'], teorAlcool: 12.5,
      quantidade: 2, localizacao: 'Frigorífico de vinhos', precoCompra: 13, valorEstimado: 14,
      guia: { temperaturaMin: 6, temperaturaMax: 8, decantar: 'nao', copo: 'Tulipa',
        janelaDe: 2021, janelaAte: 2025, harmonizacoes: [{ prato: 'Leitão da Bairrada' }] },
      guiaOrigem: 'claude',
    },
  ];
}
