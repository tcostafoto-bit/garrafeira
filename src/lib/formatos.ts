const euro = new Intl.NumberFormat('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const euroInteiro = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 });

/** € 24,50 */
export const formatarEuro = (v: number, inteiro = false) =>
  `€ ${(inteiro ? euroInteiro : euro).format(v)}`;

const SIMBOLO = { EUR: '€', GBP: '£', USD: 'US$' } as const;
/** € 24,50 · £ 54,00 · US$ 81,50 */
export const formatarMoeda = (v: number, moeda: keyof typeof SIMBOLO = 'EUR') =>
  `${SIMBOLO[moeda] ?? '€'} ${euro.format(v)}`;

/** 16–18 °C */
export const formatarTemperatura = (min: number, max: number) =>
  min === max ? `${min} °C` : `${min}–${max} °C`;
