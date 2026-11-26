import { GarrafaSilhueta } from './GarrafaSilhueta';
import type { TipoVinho } from '../types';

export const formaGarrafa = (t: TipoVinho) =>
  t === 'espumante' ? 'flute' : t === 'branco' || t === 'rose' ? 'borgonha' : 'bordeaux';

/** Foto do rótulo ou, se não houver, a silhueta da garrafa na cor do tipo. */
export function FotoVinho({ tipo, url, altura, className }:
  { tipo: TipoVinho; url?: string; altura: number; className?: string }) {
  return (
    <div className={`foto-vinho ${className ?? ''}`} style={{ ['--cor-tipo' as string]: `var(--${tipo})` }}>
      {url
        ? <img src={url} alt="" loading="lazy" decoding="async" />
        : <GarrafaSilhueta tipo={tipo} altura={altura} forma={formaGarrafa(tipo)} />}
    </div>
  );
}
