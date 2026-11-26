import { Icone } from './Icone';

/** Botões − / + para o número de garrafas. */
export function Contador({ valor, mudar, minimo = 0, grande }:
  { valor: number; mudar: (n: number) => void; minimo?: number; grande?: boolean }) {
  return (
    <div className={`contador${grande ? ' grande' : ''}`}>
      <button type="button" aria-label="Menos uma garrafa" disabled={valor <= minimo} onClick={() => mudar(valor - 1)}>
        <Icone nome="menos" tamanho={grande ? 22 : 18} />
      </button>
      <span className="num" aria-live="polite">{valor}</span>
      <button type="button" aria-label="Mais uma garrafa" onClick={() => mudar(valor + 1)}>
        <Icone nome="mais" tamanho={grande ? 22 : 18} />
      </button>
    </div>
  );
}
