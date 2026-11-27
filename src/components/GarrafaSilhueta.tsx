import type { TipoVinho } from '../types';

/** Silhueta de garrafa usada quando um vinho não tem foto. */
export interface Rotulo { nome: string; produtor?: string; ano?: number }

/** Parte um texto em linhas de no máximo `max` letras (sem partir palavras; palavras longas ficam cortadas). */
function linhas(texto: string, max: number, limite: number): string[] {
  const r: string[] = [];
  let atual = '';
  for (const p of texto.split(/\s+/).filter(Boolean)) {
    const pal = p.length > max ? `${p.slice(0, max - 1)}…` : p;
    if (atual && (atual + ' ' + pal).length > max) { r.push(atual); atual = pal; } else atual = atual ? `${atual} ${pal}` : pal;
  }
  if (atual) r.push(atual);
  if (r.length > limite) { r.length = limite; r[limite - 1] = r[limite - 1].replace(/…?$/, '…'); }
  return r;
}

export function GarrafaSilhueta({ tipo = 'tinto', altura = 120, forma = 'bordeaux', rotulo }:
  { tipo?: TipoVinho; altura?: number; forma?: 'bordeaux' | 'borgonha' | 'flute'; rotulo?: Rotulo }) {
  const cor = `var(--${tipo})`;
  const corpo =
    forma === 'borgonha'
      ? 'M17 4h6v20c0 6 9 12 9 24v62a6 6 0 0 1-6 6H14a6 6 0 0 1-6-6V48c0-12 9-18 9-24Z'
      : forma === 'flute'
        ? 'M17.5 4h5v26c0 4 6 8 6 16v64a6 6 0 0 1-6 6h-5a6 6 0 0 1-6-6V46c0-8 6-12 6-16Z'
        : 'M17 4h6v26c0 3 9 5 9 12v68a6 6 0 0 1-6 6H14a6 6 0 0 1-6-6V42c0-7 9-9 9-12Z';
  return (
    <svg viewBox="0 0 40 120" height={altura} width={(altura * 40) / 120} aria-hidden="true">
      <defs>
        <linearGradient id={`brilho-${forma}`} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.3" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={corpo} fill={cor} />
      <path d={corpo} fill={`url(#brilho-${forma})`} />
      <rect x="16.5" y="2" width="7" height="9" rx="1.5" fill="var(--dourado)" opacity="0.85" />
      {rotulo ? <RotuloTexto r={rotulo} forma={forma} cor={cor} /> : (
        <>
          <rect x={forma === 'flute' ? 12.5 : 10} y="64" width={forma === 'flute' ? 15 : 20} height="26" rx="2"
            fill="var(--texto)" opacity="0.9" />
          <rect x={forma === 'flute' ? 15 : 13} y="72" width={forma === 'flute' ? 10 : 14} height="2" fill={cor} opacity="0.7" />
          <rect x={forma === 'flute' ? 16 : 15} y="78" width={forma === 'flute' ? 8 : 10} height="1.5" fill={cor} opacity="0.45" />
        </>
      )}
    </svg>
  );
}

/** Rótulo desenhado na garrafa: produtor pequeno, nome em destaque e ano. */
function RotuloTexto({ r, forma, cor }: { r: Rotulo; forma: 'bordeaux' | 'borgonha' | 'flute'; cor: string }) {
  const largo = forma !== 'flute';
  const x = largo ? 9.5 : 12, w = largo ? 21 : 16;
  const max = largo ? 11 : 8;
  const tam = largo ? 3.1 : 2.8;
  const nome = linhas(r.nome, max, 3);
  const prod = r.produtor ? linhas(r.produtor, max + 3, 1)[0] : undefined;
  const y0 = 69, passo = 3.9;
  return (
    <g>
      <rect x={x} y="60" width={w} height="38" rx="2" fill="#efe6d8" />
      <rect x={x + 1.2} y="61.2" width={w - 2.4} height="35.6" rx="1.2" fill="none" stroke={cor} strokeWidth="0.4" opacity="0.7" />
      {prod && <text x="20" y="65" textAnchor="middle" fontSize="2" letterSpacing="0.2" fill="#6b5a4a" fontFamily="var(--sans)">{prod.toUpperCase()}</text>}
      {nome.map((l, i) => (
        <text key={i} x="20" y={y0 + 3 + i * passo} textAnchor="middle" fontSize={tam} fill="#2a1d1d" fontFamily="var(--serif)">{l}</text>
      ))}
      {r.ano !== undefined && <text x="20" y="94.5" textAnchor="middle" fontSize="3.2" fill={cor} fontFamily="var(--serif)">{r.ano}</text>}
    </g>
  );
}
