import { pontos100, type Criticas } from '../types';
const formatarData = (d: string) => new Date(d).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' });

const ESCALA = { 100: '/100', 20: '/20', 5: '/5' } as const;

/** Pontuação da crítica: nota agregada, notas por fonte (com ligação) e o resumo do que dizem. */
export function CriticasVinho({ c }: { c: Criticas }) {
  const nota = c.pontuacao;
  return (
    <section className="cartao criticas">
      <div className="valor-topo">
        <div>
          <div className="resumo-rotulo" style={{ marginTop: 0 }}>Crítica · pontuação agregada</div>
          <div className="num dourado" style={{ fontSize: 28, color: 'var(--dourado)' }}>
            {nota !== undefined ? <>{nota}<small style={{ fontSize: 14, opacity: .7 }}> /100</small></> : '–'}
          </div>
        </div>
      </div>
      {c.resumo && <p className="criticas-resumo">{c.resumo}</p>}
      {c.fontes.length > 0 && (
        <ul className="fontes">
          {c.fontes.map((f) => (
            <li key={f.fonte + (f.url ?? '') + (f.colheita ?? '')}>
              <span style={{ minWidth: 0 }}>
                {f.url ? <a href={f.url} target="_blank" rel="noopener noreferrer">{f.fonte}</a> : f.fonte}
                {(f.colheita || f.outraColheita || f.nota) && (
                  <span className="fonte-nota">
                    {[f.outraColheita ? `outra colheita${f.colheita ? ` (${f.colheita})` : ''}` : f.colheita ? `colheita ${f.colheita}` : '', f.nota].filter(Boolean).join(' · ')}
                  </span>
                )}
              </span>
              {f.pontos !== undefined && (
                <span className="num" title={`${pontos100(f)}/100`}>
                  {f.pontos.toLocaleString('pt-PT')}{ESCALA[f.escala ?? 100]}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
      {c.atualizadoEm && <div className="nota-grupo" style={{ margin: '10px 0 0' }}>Pesquisado em {formatarData(c.atualizadoEm)}</div>}
    </section>
  );
}
