import type { Vinho } from '../types';
import { guiaEfetivo } from './guia';

export type EstadoJanela = 'jovem' | 'no-ponto' | 'a-passar';

/** Semáforo da janela de consumo (usa o guia do Claude ou, se não houver, o das regras). */
export function estadoJanela(v: Vinho, ano = new Date().getFullYear()): EstadoJanela | undefined {
  const { guia: g } = guiaEfetivo(v);
  if (g.janelaDe === undefined && g.janelaAte === undefined) {
    // Sem janela (NV, tawny, Madeira…): conta como pronto a beber.
    return v.tipo === 'outro' ? undefined : 'no-ponto';
  }
  if (g.janelaDe !== undefined && ano < g.janelaDe) return 'jovem';
  if (g.janelaAte !== undefined && ano > g.janelaAte) return 'a-passar';
  return 'no-ponto';
}

/** Está no melhor momento (pico)? */
export function noPico(v: Vinho, ano = new Date().getFullYear()) {
  const { guia: g } = guiaEfetivo(v);
  return g.picoDe !== undefined && g.picoAte !== undefined && ano >= g.picoDe && ano <= g.picoAte;
}

export const NOME_JANELA: Record<EstadoJanela, string> = {
  jovem: 'Ainda jovem',
  'no-ponto': 'Pronto a beber',
  'a-passar': 'A passar do ponto',
};

export function textoJanela(v: Vinho): string | undefined {
  const { guia: g } = guiaEfetivo(v);
  if (g.janelaDe && g.janelaAte) return `${g.janelaDe}–${g.janelaAte}`;
  if (g.janelaDe) return `a partir de ${g.janelaDe}`;
  if (g.janelaAte) return `até ${g.janelaAte}`;
  return undefined;
}
