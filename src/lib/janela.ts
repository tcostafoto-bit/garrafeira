import type { Vinho } from '../types';

export type EstadoJanela = 'jovem' | 'no-ponto' | 'a-passar';

/** Semáforo da janela de consumo. Só existe quando o vinho tem guia com janela. */
export function estadoJanela(v: Vinho, ano = new Date().getFullYear()): EstadoJanela | undefined {
  const g = v.guia;
  if (!g || (g.janelaDe === undefined && g.janelaAte === undefined)) return undefined;
  if (g.janelaDe !== undefined && ano < g.janelaDe) return 'jovem';
  if (g.janelaAte !== undefined && ano > g.janelaAte) return 'a-passar';
  return 'no-ponto';
}

export const NOME_JANELA: Record<EstadoJanela, string> = {
  jovem: 'Ainda jovem',
  'no-ponto': 'Pronto a beber',
  'a-passar': 'A passar do ponto',
};

export function textoJanela(v: Vinho): string | undefined {
  const g = v.guia;
  if (!g) return undefined;
  if (g.janelaDe && g.janelaAte) return `${g.janelaDe}–${g.janelaAte}`;
  if (g.janelaDe) return `a partir de ${g.janelaDe}`;
  if (g.janelaAte) return `até ${g.janelaAte}`;
  return undefined;
}
