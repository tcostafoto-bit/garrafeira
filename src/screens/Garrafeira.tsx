import { useMemo, useState } from 'react';
import { GarrafaSilhueta } from '../components/GarrafaSilhueta';
import { FotoVinho } from '../components/FotoVinho';
import { Icone } from '../components/Icone';
import { formatarEuro } from '../lib/formatos';
import { estadoJanela } from '../lib/janela';
import { caminhoMini } from '../lib/vinhos';
import { TIPOS, type TipoVinho, type Vinho } from '../types';
import type { Inventario } from '../hooks/useVinhos';

type Filtro = 'todos' | TipoVinho | 'pronto' | 'favoritos' | 'acabados';
type Ordem = 'nome' | 'ano' | 'valor' | 'recentes';

const ORDENS: { id: Ordem; nome: string }[] = [
  { id: 'nome', nome: 'Nome' },
  { id: 'ano', nome: 'Ano' },
  { id: 'valor', nome: 'Valor' },
  { id: 'recentes', nome: 'Recentes' },
];

/** Valor de uma garrafa: o estimado, ou o preço de compra se ainda não houver estimativa. */
export const valorGarrafa = (v: Vinho) => v.valorEstimado ?? v.precoCompra ?? 0;

const semAcentos = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function Garrafeira({ inv, adicionar, abrir, carregarExemplos }:
  { inv: Inventario; adicionar: () => void; abrir: (id: string) => void; carregarExemplos: () => void }) {
  const { vinhos, urls, estado } = inv;
  const [texto, setTexto] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [ordem, setOrdem] = useState<Ordem>('nome');

  const naGarrafeira = vinhos.filter((v) => v.quantidade > 0);
  const garrafas = naGarrafeira.reduce((s, v) => s + v.quantidade, 0);
  const valor = naGarrafeira.reduce((s, v) => s + v.quantidade * valorGarrafa(v), 0);
  const prontos = naGarrafeira.filter((v) => estadoJanela(v) === 'no-ponto').length;

  const filtros = useMemo(() => {
    const f: { id: Filtro; nome: string }[] = [{ id: 'todos', nome: 'Todos' }];
    TIPOS.forEach((t) => { if (naGarrafeira.some((v) => v.tipo === t.id)) f.push({ id: t.id, nome: t.nome }); });
    if (naGarrafeira.some((v) => estadoJanela(v))) f.push({ id: 'pronto', nome: 'Pronto a beber' });
    if (vinhos.some((v) => v.favorito)) f.push({ id: 'favoritos', nome: 'Favoritos' });
    if (vinhos.some((v) => v.quantidade === 0)) f.push({ id: 'acabados', nome: 'Acabados' });
    return f;
  }, [vinhos]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtroAtivo = filtros.some((f) => f.id === filtro) ? filtro : 'todos';

  const lista = useMemo(() => {
    const q = semAcentos(texto.trim());
    let r = vinhos.filter((v) => {
      if (filtroAtivo === 'acabados') return v.quantidade === 0;
      if (filtroAtivo === 'favoritos') return v.favorito;
      if (v.quantidade === 0 && !q) return false;
      if (filtroAtivo === 'pronto') return estadoJanela(v) === 'no-ponto';
      if (filtroAtivo !== 'todos') return v.tipo === filtroAtivo;
      return true;
    });
    if (q) {
      const palavras = q.split(/\s+/);
      r = r.filter((v) => {
        const alvo = semAcentos([v.nome, v.produtor, v.regiao, v.denominacao, v.pais, v.localizacao, v.notas,
          v.ano ?? 'nv', TIPOS.find((t) => t.id === v.tipo)?.nome, ...v.castas].filter(Boolean).join(' '));
        return palavras.every((p) => alvo.includes(p));
      });
    }
    const cmp: Record<Ordem, (a: Vinho, b: Vinho) => number> = {
      nome: (a, b) => a.nome.localeCompare(b.nome, 'pt'),
      ano: (a, b) => (a.ano ?? 9999) - (b.ano ?? 9999) || a.nome.localeCompare(b.nome, 'pt'),
      valor: (a, b) => valorGarrafa(b) - valorGarrafa(a),
      recentes: (a, b) => (b.criadoEm ?? '').localeCompare(a.criadoEm ?? ''),
    };
    return [...r].sort(cmp[ordem]);
  }, [vinhos, texto, filtroAtivo, ordem]);

  const vazia = estado === 'pronto' && vinhos.length === 0;

  return (
    <main className="ecra">
      <header className="cabecalho">
        <div>
          <div className="sobretitulo">A minha</div>
          <h1 className="titulo">Garrafeira</h1>
        </div>
      </header>

      <section className="cartao resumo" aria-label="Resumo">
        <div className="resumo-grelha">
          <div><div className="resumo-valor num">{garrafas}</div><div className="resumo-rotulo">{garrafas === 1 ? 'garrafa' : 'garrafas'}</div></div>
          <div><div className="resumo-valor num">{naGarrafeira.length}</div><div className="resumo-rotulo">{naGarrafeira.length === 1 ? 'referência' : 'referências'}</div></div>
          <div><div className="resumo-valor num dourado">{formatarEuro(valor, true)}</div><div className="resumo-rotulo">valor estimado</div></div>
        </div>
        <div className="resumo-linha">
          <span className="ponto" style={{ background: 'var(--no-ponto)' }} />
          {prontos} {prontos === 1 ? 'pronto' : 'prontos'} a beber
        </div>
      </section>

      {estado === 'erro' && (
        <div className="aviso" style={{ marginTop: 16 }}>
          Não consegui carregar a garrafeira. Confirma a ligação à internet.
          <button className="ligacao" onClick={inv.carregar}>Tentar outra vez</button>
        </div>
      )}

      {vazia ? (
        <section className="vazio">
          <div className="vazio-garrafas">
            <GarrafaSilhueta tipo="espumante" altura={92} forma="flute" />
            <GarrafaSilhueta tipo="branco" altura={104} forma="borgonha" />
            <GarrafaSilhueta tipo="tinto" altura={118} />
            <GarrafaSilhueta tipo="rose" altura={100} forma="borgonha" />
            <GarrafaSilhueta tipo="porto" altura={96} />
          </div>
          <h2>A garrafeira está vazia</h2>
          <p>Tira uma foto ao rótulo, manda-a ao Claude e cola aqui a ficha que ele te devolver. Também podes adicionar à mão.</p>
          <button className="botao" onClick={adicionar}>
            <Icone nome="mais" tamanho={20} /> Adicionar vinho
          </button>
          <div><button className="ligacao" style={{ marginTop: 20 }} onClick={carregarExemplos}>Carregar vinhos de exemplo</button></div>
        </section>
      ) : (
        <>
          <label className="pesquisa">
            <Icone nome="pesquisa" tamanho={20} />
            <span className="sr-only">Pesquisar</span>
            <input type="search" placeholder="Nome, produtor, região, casta" value={texto}
              onChange={(e) => setTexto(e.target.value)} enterKeyHint="search" />
            {texto && (
              <button className="pesquisa-limpar" aria-label="Limpar pesquisa" onClick={() => setTexto('')}>
                <Icone nome="fechar" tamanho={16} />
              </button>
            )}
          </label>

          <div className="chips" role="tablist" aria-label="Filtros">
            {filtros.map((f) => (
              <button key={f.id} role="tab" aria-selected={filtroAtivo === f.id}
                className={`chip${filtroAtivo === f.id ? ' ativo' : ''}`} onClick={() => setFiltro(f.id)}>
                {f.id !== 'todos' && f.id !== 'pronto' && f.id !== 'favoritos' && f.id !== 'acabados' && (
                  <span className="ponto" style={{ background: `var(--${f.id})` }} />
                )}
                {f.nome}
              </button>
            ))}
          </div>

          <div className="lista-topo">
            <span>{lista.length} {lista.length === 1 ? 'vinho' : 'vinhos'}</span>
            <label className="ordenar">
              <Icone nome="ordenar" tamanho={16} />
              <span className="sr-only">Ordenar por</span>
              <select value={ordem} onChange={(e) => setOrdem(e.target.value as Ordem)}>
                {ORDENS.map((o) => <option key={o.id} value={o.id}>{o.nome}</option>)}
              </select>
            </label>
          </div>

          {estado === 'a-carregar' ? (
            <div className="lista">{[0, 1, 2].map((i) => <div key={i} className="linha-vinho esqueleto" />)}</div>
          ) : lista.length === 0 ? (
            <p className="ajuda" style={{ marginTop: 32 }}>
              {texto ? <>Nenhum vinho encontrado para «{texto}».</> : 'Nada neste filtro.'}
            </p>
          ) : (
            <ul className="lista">
              {lista.map((v) => <LinhaVinho key={v.id} v={v} url={v.fotoPath ? urls[caminhoMini(v.fotoPath)] : undefined} abrir={abrir} />)}
            </ul>
          )}
        </>
      )}
    </main>
  );
}

function LinhaVinho({ v, url, abrir }: { v: Vinho; url?: string; abrir: (id: string) => void }) {
  const janela = estadoJanela(v);
  const linha2 = [v.produtor, v.ano ?? 'NV'].filter(Boolean).join(' · ');
  const linha3 = [TIPOS.find((t) => t.id === v.tipo)?.nome, v.regiao].filter(Boolean).join(' · ');
  return (
    <li>
      <button className={`linha-vinho${v.quantidade === 0 ? ' acabado' : ''}`} onClick={() => abrir(v.id)}>
        <FotoVinho tipo={v.tipo} url={url} altura={58} className="mini" />
        <span className="linha-vinho-texto">
          <span className="linha-vinho-nome">{v.nome}</span>
          <span className="linha-vinho-sub">{linha2}</span>
          <span className="linha-vinho-sub fraco">
            <span className="ponto" style={{ background: `var(--${v.tipo})` }} /> {linha3}
          </span>
        </span>
        <span className="linha-vinho-lado">
          <span className="quantidade num">{v.quantidade === 0 ? 'acabou' : `×${v.quantidade}`}</span>
          <span className="linha-vinho-icones">
            {v.favorito && <span style={{ color: 'var(--dourado)' }}><Icone nome="estrela-cheia" tamanho={14} /></span>}
            {janela && <span className="ponto" title={janela} style={{ background: `var(--${janela})` }} />}
          </span>
        </span>
      </button>
    </li>
  );
}
