import type { Vinho } from '../types';
import type { DadosVinho } from './vinhos';

const FORMATO = 'garrafeira-backup';

export interface Backup {
  formato: typeof FORMATO;
  versao: 1;
  exportadoEm: string;
  vinhos: Vinho[];
}

export function criarBackup(vinhos: Vinho[]): Blob {
  const b: Backup = { formato: FORMATO, versao: 1, exportadoEm: new Date().toISOString(), vinhos };
  return new Blob([JSON.stringify(b, null, 2)], { type: 'application/json' });
}

/** No iPhone abre a folha de partilhar (Guardar em Ficheiros, Mail…); noutros sítios descarrega. */
export async function partilharBackup(vinhos: Vinho[]) {
  const nome = `garrafeira-${new Date().toISOString().slice(0, 10)}.json`;
  const blob = criarBackup(vinhos);
  const ficheiro = new File([blob], nome, { type: 'application/json' });
  if (navigator.canShare?.({ files: [ficheiro] })) {
    try {
      await navigator.share({ files: [ficheiro], title: 'Backup da garrafeira' });
      return;
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = nome;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** Lê um ficheiro de backup e devolve os vinhos prontos a guardar. Lança erro se o ficheiro não for válido. */
export async function lerBackup(f: File): Promise<DadosVinho[]> {
  let dados: unknown;
  try { dados = JSON.parse(await f.text()); } catch { throw new Error('O ficheiro não é um JSON válido.'); }
  const b = dados as Partial<Backup>;
  if (b?.formato !== FORMATO || !Array.isArray(b.vinhos)) throw new Error('Este ficheiro não é um backup da Garrafeira.');
  return b.vinhos
    .filter((v) => v && typeof v.nome === 'string' && v.nome.trim())
    .map((v) => {
      const { criadoEm: _c, atualizadoEm: _a, ...resto } = v;
      return {
        ...resto,
        id: v.id || crypto.randomUUID(),
        castas: v.castas ?? [], tags: v.tags ?? [], valorFontes: v.valorFontes ?? [],
        pais: v.pais || 'Portugal', volumeMl: v.volumeMl || 750,
        quantidade: Math.max(0, Number(v.quantidade) || 0), favorito: !!v.favorito,
      };
    });
}
