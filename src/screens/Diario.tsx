import { useMemo } from 'react';
import { fotoProps } from '../lib/imagens';
import { FotoVinho } from '../components/FotoVinho';
import { Icone } from '../components/Icone';
import { Estrelas } from '../components/AbrirGarrafa';
import type { Inventario } from '../hooks/useVinhos';

const mes = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
const dia = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' });

export function Diario({ inv, abrir }: { inv: Inventario; abrir: (id: string) => void }) {
  const porId = useMemo(() => new Map(inv.vinhos.map((v) => [v.id, v])), [inv.vinhos]);
  const ano = new Date().getFullYear();
  const esteAno = inv.consumos.filter((c) => c.data.startsWith(String(ano)));
  const notas = inv.consumos.filter((c) => c.nota);
  const media = notas.length ? notas.reduce((s, c) => s + c.nota!, 0) / notas.length : undefined;

  const grupos = useMemo(() => {
    const g: { mes: string; itens: typeof inv.consumos }[] = [];
    inv.consumos.forEach((c) => {
      const m = mes(c.data);
      if (g.at(-1)?.mes !== m) g.push({ mes: m, itens: [] });
      g.at(-1)!.itens.push(c);
    });
    return g;
  }, [inv.consumos]);

  return (
    <main className="ecra">
      <header className="cabecalho">
        <div>
          <div className="sobretitulo">Memória</div>
          <h1 className="titulo">Diário</h1>
        </div>
      </header>

      {inv.consumos.length === 0 ? (
        <section className="em-breve">
          <div className="em-breve-icone"><Icone nome="diario" tamanho={30} /></div>
          <h2 style={{ fontSize: 22 }}>Ainda sem garrafas abertas</h2>
          <p>Na ficha de um vinho, toca em «Abrir uma garrafa» para guardar aqui a nota, o prato e a ocasião.</p>
        </section>
      ) : (
        <>
          <section className="cartao resumo" aria-label="Resumo do diário">
            <div className="resumo-grelha">
              <div><div className="resumo-valor num">{esteAno.length}</div><div className="resumo-rotulo">abertas em {ano}</div></div>
              <div><div className="resumo-valor num">{inv.consumos.length}</div><div className="resumo-rotulo">no total</div></div>
              <div><div className="resumo-valor num dourado">{media ? media.toLocaleString('pt-PT', { maximumFractionDigits: 1 }) : '–'}</div><div className="resumo-rotulo">nota média</div></div>
            </div>
          </section>

          {grupos.map((g) => (
            <section key={g.mes} className="grupo">
              <h3 className="grupo-titulo">{g.mes}</h3>
              <ul className="lista">
                {g.itens.map((c) => {
                  const v = porId.get(c.vinhoId);
                  return (
                    <li key={c.id}>
                      <button className="linha-vinho" onClick={() => v && abrir(v.id)} disabled={!v}>
                        <FotoVinho tipo={v?.tipo ?? 'outro'} {...(v ? fotoProps(v, inv.urls, true) : {})} altura={70} className="mini" rotulo={v ? { nome: v.nome, ano: v.ano } : undefined} />
                        <span className="linha-vinho-texto">
                          <span className="linha-vinho-nome">{v?.nome ?? 'Vinho apagado'}</span>
                          <span className="linha-vinho-sub">{[dia(c.data), v?.ano, c.ocasiao].filter(Boolean).join(' · ')}</span>
                          {c.prato && <span className="linha-vinho-sub fraco">com {c.prato}</span>}
                          {c.comentario && <span className="diario-comentario">«{c.comentario}»</span>}
                        </span>
                        {c.nota && <span className="linha-vinho-lado"><Estrelas valor={c.nota} tamanho={12} /></span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </>
      )}
    </main>
  );
}
