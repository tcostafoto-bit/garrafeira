import { useState } from 'react';
import { GarrafaSilhueta, type Rotulo } from './GarrafaSilhueta';
import type { TipoVinho } from '../types';

export const formaGarrafa = (t: TipoVinho) =>
  t === 'espumante' ? 'flute' : t === 'branco' || t === 'rose' ? 'borgonha' : 'bordeaux';

/** Foto da garrafa (do Tiago ou de loja) ou, se não houver ou falhar, a silhueta com o rótulo desenhado. */
export function FotoVinho({ tipo, url, altura, className, rotulo, externa }:
  { tipo: TipoVinho; url?: string; altura: number; className?: string; rotulo?: Rotulo; externa?: boolean }) {
  const [falhou, setFalhou] = useState<string>();
  const [larga, setLarga] = useState(false);
  const mostrar = url && falhou !== url;
  return (
    <div className={`foto-vinho ${className ?? ''}${mostrar && externa ? ` externa${larga ? ' larga' : ''}` : ''}`} style={{ ['--cor-tipo' as string]: `var(--${tipo})` }}>
      {mostrar
        ? <img src={url} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFalhou(url)}
            onLoad={(e) => setLarga(e.currentTarget.naturalWidth > e.currentTarget.naturalHeight * 1.5)} />
        : <GarrafaSilhueta tipo={tipo} altura={altura} forma={formaGarrafa(tipo)} rotulo={rotulo} />}
    </div>
  );
}
