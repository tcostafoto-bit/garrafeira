import { useMemo, useState } from 'react';
import { fotoProps } from '../lib/imagens';
import { FotoVinho } from '../components/FotoVinho';
import { Icone } from '../components/Icone';
import { CATEGORIAS, sugerir, type Categoria } from '../lib/sommelier';
import { guiaEfetivo } from '../lib/guia';
import { formatarTemperatura } from '../lib/formatos';
import type { Inventario } from '../hooks/useVinhos';

export function AbrirHoje({ inv, abrir }: { inv: Inventario; abrir: (id: string) => void }) {
  const [cat, setCat] = useState<Categoria | undefined>();
  const [texto, setTexto] = useState('');
  const pediu = !!cat || texto.trim().length > 2;
  const [todas, setTodas] = useState(false);
  const todasSug = useMemo(() => (pediu ? sugerir(inv.vinhos, cat, texto) : []), [inv.vinhos, cat, texto, pediu]);
  const sugestoes = todas ? todasSug : todasSug.slice(0, 3);

  return (
    <main className="ecra">
      <header className="cabecalho">
        <div>
          <div className="sobretitulo">Sommelier</div>
          <h1 className="titulo">O que abro hoje?</h1>
          <p className="subtitulo">Escolhe o prato ou a ocasião e sugiro o que tens em casa.</p>
        </div>
      </header>

      <label className="pesquisa" style={{ marginTop: 0 }}>
        <Icone nome="pesquisa" tamanho={20} />
        <span className="sr-only">Prato</span>
        <input type="search" placeholder="Escreve o prato, ex.: arroz de pato" value={texto}
          onChange={(e) => { setTexto(e.target.value); setCat(undefined); setTodas(false); }} enterKeyHint="search" />
      </label>
      <div className="chips-grelha" style={{ marginTop: 14 }}>
        {CATEGORIAS.map((c) => (
          <button key={c.id} className={`chip${cat?.id === c.id ? ' ativo' : ''}`} aria-pressed={cat?.id === c.id}
            onClick={() => { setCat(cat?.id === c.id ? undefined : c); setTexto(''); setTodas(false); }}>{c.nome}</button>
        ))}
      </div>

      {pediu && (
        <section style={{ marginTop: 28 }}>
          <h3 className="grupo-titulo">Sugestões</h3>
          {sugestoes.length === 0 ? (
            <p className="ajuda" style={{ textAlign: 'left' }}>
              {inv.vinhos.some((v) => v.quantidade > 0)
                ? 'Não encontrei nada que combine bem. Experimenta outra categoria.'
                : 'A garrafeira está vazia.'}
            </p>
          ) : (
            <ol className="lista sugestoes">
              {sugestoes.map(({ vinho: v, razoes }, i) => {
                const { guia } = guiaEfetivo(v);
                return (
                  <li key={v.id}>
                    <button className="linha-vinho sugestao" onClick={() => abrir(v.id)}>
                      <span className="sugestao-n num">{i + 1}</span>
                      <FotoVinho tipo={v.tipo} {...fotoProps(v, inv.urls, true)} altura={70} className="mini" rotulo={v ? { nome: v.nome, ano: v.ano } : undefined} />
                      <span className="linha-vinho-texto">
                        <span className="linha-vinho-nome">{v.nome}</span>
                        <span className="linha-vinho-sub">{[v.produtor, v.ano ?? 'NV'].filter(Boolean).join(' · ')}</span>
                        <span className="linha-vinho-sub fraco" style={{ whiteSpace: 'normal' }}>{razoes.slice(0, 2).join(' · ')}</span>
                        <span className="linha-vinho-sub fraco">
                          {formatarTemperatura(guia.temperaturaMin, guia.temperaturaMax)}
                          {guia.decantar === 'sim' && ` · decantar${guia.decantarMinutos ? ` ${guia.decantarMinutos} min` : ''}`}
                        </span>
                      </span>
                      <span className="quantidade num">×{v.quantidade}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          )}
          {todasSug.length > 3 && (
            <button className="ligacao" style={{ marginTop: 14 }} onClick={() => setTodas(!todas)}>
              {todas ? 'Mostrar só as 3 melhores' : `Mostrar todas (${todasSug.length})`}
            </button>
          )}
        </section>
      )}
    </main>
  );
}
