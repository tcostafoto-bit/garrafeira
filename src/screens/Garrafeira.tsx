import { useMemo, useState } from 'react';
import { GarrafaSilhueta } from '../components/GarrafaSilhueta';
import { FotoVinho } from '../components/FotoVinho';
import { BottomSheet } from '../components/BottomSheet';
import { Icone } from '../components/Icone';
import { formatarEuro } from '../lib/formatos';
import { alertaJanela, estadoJanela } from '../lib/janela';
import { fotoProps } from '../lib/imagens';
import { TIPOS, type TipoVinho, type Vinho } from '../types';
import type { Inventario } from '../hooks/useVinhos';

type Filtro = 'todos' | TipoVinho | 'pronto' | 'atencao' | 'favoritos' | 'acabados';
type Ordem = 'minha' | 'nome' | 'ano' | 'valor' | 'recentes' | 'pontuados';

const ORDENS: { id: Ordem; nome: string }[] = [
  { id: 'minha', nome: 'A minha ordem' },
  { id: 'nome', nome: 'Nome' },
  { id: 'ano', nome: 'Ano' },
  { id: 'valor', nome: 'Valor' },
  { id: 'recentes', nome: 'Recentes' },
  { id: 'pontuados', nome: 'Mais pontuados' },
];

/** Valor de uma garrafa: o estimado, ou o preço de compra se ainda não houver estimativa. */
export const valorGarrafa = (v: Vinho) => v.valorEstimado ?? v.precoCompra ?? 0;

const CHAVE_ORDEM = 'garrafeira-minha-ordem-v1';
const CHAVE_MODO = 'garrafeira-modo-ordem-v1';
function lerLS<T>(chave: string, vazio: T): T {
  try { const r = localStorage.getItem(chave); return r ? (JSON.parse(r) as T) : vazio; } catch { return vazio; }
}
function gravarLS(chave: string, valor: unknown) {
  try { localStorage.setItem(chave, JSON.stringify(valor)); } catch { /* sem armazenamento: a ordem só dura esta sessão */ }
}

const semAcentos = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function Garrafeira({ inv, adicionar, abrir, carregarExemplos }:
  { inv: Inventario; adicionar: () => void; abrir: (id: string) => void; carregarExemplos: () => void }) {
  const { vinhos, urls, estado } = inv;
  const [texto, setTexto] = useState('');
  const [minimo, setMinimo] = useState(0);
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [ordem, setOrdemEstado] = useState<Ordem>(() => {
    const o = lerLS<string>(CHAVE_MODO, 'nome');
    return ORDENS.some((x) => x.id === o) ? (o as Ordem) : 'nome';
  });
  const [minhaOrdem, setMinhaOrdem] = useState<string[]>(() => lerLS<string[]>(CHAVE_ORDEM, []));
  const [arrumar, setArrumar] = useState(false);
  const setOrdem = (o: Ordem) => { setOrdemEstado(o); gravarLS(CHAVE_MODO, o); if (o !== 'minha') setArrumar(false); };

  const naGarrafeira = vinhos.filter((v) => v.quantidade > 0);
  const garrafas = naGarrafeira.reduce((s, v) => s + v.quantidade, 0);
  const valor = naGarrafeira.reduce((s, v) => s + v.quantidade * valorGarrafa(v), 0);
  const [verValores, setVerValores] = useState(false);
  const porTipo = TIPOS.map((t) => {
    const l = naGarrafeira.filter((v) => v.tipo === t.id);
    return { ...t, garrafas: l.reduce((a, v) => a + v.quantidade, 0), valor: l.reduce((a, v) => a + v.quantidade * valorGarrafa(v), 0) };
  }).filter((t) => t.garrafas > 0).sort((a, b) => b.valor - a.valor);
  const prontos = naGarrafeira.filter((v) => estadoJanela(v) === 'no-ponto').length;

  const alertas = naGarrafeira
    .map((v) => ({ v, a: alertaJanela(v) }))
    .filter((x): x is { v: Vinho; a: NonNullable<ReturnType<typeof alertaJanela>> } => !!x.a)
    .sort((x, y) => (x.a.tipo === y.a.tipo ? 0 : x.a.tipo === 'passou' ? -1 : 1));

  const filtros = useMemo(() => {
    const f: { id: Filtro; nome: string }[] = [{ id: 'todos', nome: 'Todos' }];
    TIPOS.forEach((t) => { if (naGarrafeira.some((v) => v.tipo === t.id)) f.push({ id: t.id, nome: t.nome }); });
    if (naGarrafeira.some((v) => estadoJanela(v))) f.push({ id: 'pronto', nome: 'Pronto a beber' });
    if (naGarrafeira.some((v) => alertaJanela(v))) f.push({ id: 'atencao', nome: 'A pedir atenção' });
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
      if (filtroAtivo === 'atencao') return !!alertaJanela(v);
      if (filtroAtivo === 'pronto') return estadoJanela(v) === 'no-ponto';
      if (filtroAtivo !== 'todos') return v.tipo === filtroAtivo;
      return true;
    });
    if (minimo) r = r.filter((v) => (v.criticas?.pontuacao ?? 0) >= minimo);
    if (q) {
      const palavras = q.split(/\s+/);
      r = r.filter((v) => {
        const alvo = semAcentos([v.nome, v.produtor, v.regiao, v.denominacao, v.pais, v.localizacao, v.notas,
          v.ano ?? 'nv', TIPOS.find((t) => t.id === v.tipo)?.nome, ...v.castas].filter(Boolean).join(' '));
        return palavras.every((p) => alvo.includes(p));
      });
    }
    const pos = (id: string) => { const i = minhaOrdem.indexOf(id); return i < 0 ? 1e9 : i; };
    const cmp: Record<Ordem, (a: Vinho, b: Vinho) => number> = {
      minha: (a, b) => pos(a.id) - pos(b.id) || a.nome.localeCompare(b.nome, 'pt'),
      nome: (a, b) => a.nome.localeCompare(b.nome, 'pt'),
      ano: (a, b) => (a.ano ?? 9999) - (b.ano ?? 9999) || a.nome.localeCompare(b.nome, 'pt'),
      valor: (a, b) => valorGarrafa(b) - valorGarrafa(a),
      recentes: (a, b) => (b.criadoEm ?? '').localeCompare(a.criadoEm ?? ''),
      pontuados: (a, b) => (b.criticas?.pontuacao ?? -1) - (a.criticas?.pontuacao ?? -1) || a.nome.localeCompare(b.nome, 'pt'),
    };
    return [...r].sort(cmp[ordem]);
  }, [vinhos, texto, filtroAtivo, ordem, minhaOrdem, minimo]);

  /** Troca o vinho com o vizinho visível (para cima ou para baixo) e guarda a ordem neste telemóvel. */
  const mover = (id: string, passo: -1 | 1) => {
    const i = lista.findIndex((v) => v.id === id);
    const vizinho = lista[i + passo];
    if (!vizinho) return;
    const completa = [...vinhos].sort((a, b) => {
      const pa = minhaOrdem.indexOf(a.id), pb = minhaOrdem.indexOf(b.id);
      return (pa < 0 ? 1e9 : pa) - (pb < 0 ? 1e9 : pb) || a.nome.localeCompare(b.nome, 'pt');
    }).map((v) => v.id);
    const a = completa.indexOf(id), b = completa.indexOf(vizinho.id);
    [completa[a], completa[b]] = [completa[b], completa[a]];
    setMinhaOrdem(completa);
    gravarLS(CHAVE_ORDEM, completa);
  };

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
          {porTipo.length > 0 && <button className="ligacao" style={{ marginLeft: 'auto' }} onClick={() => setVerValores(true)}>Valor por tipo</button>}
        </div>
      </section>

      {alertas.length > 0 && !vazia && (
        <section className="cartao alertas" aria-label="Vinhos a pedir atenção">
          <div className="alertas-topo">
            <strong>{alertas.length} {alertas.length === 1 ? 'vinho a pedir atenção' : 'vinhos a pedir atenção'}</strong>
            <button className="ligacao" onClick={() => setFiltro('atencao')}>Ver todos</button>
          </div>
          <ul>
            {alertas.slice(0, 3).map(({ v, a }) => (
              <li key={v.id}>
                <button onClick={() => abrir(v.id)}>
                  <span className="ponto" style={{ background: a.tipo === 'passou' ? 'var(--a-passar)' : 'var(--dourado)' }} />
                  <span className="alertas-texto">
                    <span className="alertas-nome">{v.nome}{v.ano ? ` ${v.ano}` : ''}</span>
                    <span className="alertas-sub">{a.texto}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {alertas.length > 3 && <div className="nota-grupo" style={{ margin: '8px 0 0' }}>E mais {alertas.length - 3}.</div>}
        </section>
      )}

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
            <Icone nome="mais" tamanho={20} /> Adicionar à garrafeira
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

          {vinhos.some((v) => v.criticas?.pontuacao !== undefined) && (
            <div className="chips" aria-label="Pontuação mínima" style={{ marginTop: 10 }}>
              <span className="chip-rotulo">Pontuação</span>
              {[90, 92, 94].map((m) => (
                <button key={m} className={`chip${minimo === m ? ' ativo' : ''}`} aria-pressed={minimo === m} onClick={() => setMinimo(minimo === m ? 0 : m)}>{m}+</button>
              ))}
            </div>
          )}

          <div className="lista-topo">
            <span>{lista.length} {lista.length === 1 ? 'item' : 'itens'}
              {ordem === 'minha' && (
                <button className="ligacao" style={{ marginLeft: 12 }} onClick={() => setArrumar(!arrumar)}>
                  {arrumar ? 'Concluído' : 'Arrumar'}
                </button>
              )}
            </span>
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
              {lista.map((v, i) => (
                <LinhaVinho key={v.id} v={v} urls={urls} abrir={abrir}
                  mover={arrumar && ordem === 'minha' ? (p) => mover(v.id, p) : undefined}
                  primeiro={i === 0} ultimo={i === lista.length - 1} />
              ))}
            </ul>
          )}
        </>
      )}
      <BottomSheet aberta={verValores} fechar={() => setVerValores(false)} titulo="Valor por tipo">
        <ul className="valor-tipos">
          {porTipo.map((t) => (
            <li key={t.id}>
              <span className="ponto" style={{ background: `var(--${t.id})` }} />
              <span className="vt-nome">{t.nome}<small>{t.garrafas} {t.garrafas === 1 ? 'garrafa' : 'garrafas'}</small></span>
              <span className="num">{formatarEuro(t.valor, true)}</span>
            </li>
          ))}
          <li className="vt-total">
            <span className="vt-nome">Total<small>{garrafas} {garrafas === 1 ? 'garrafa' : 'garrafas'}</small></span>
            <span className="num dourado">{formatarEuro(valor, true)}</span>
          </li>
        </ul>
      </BottomSheet>
    </main>
  );
}

function LinhaVinho({ v, urls, abrir, mover, primeiro, ultimo }:
  { v: Vinho; urls: Record<string, string>; abrir: (id: string) => void; mover?: (p: -1 | 1) => void; primeiro: boolean; ultimo: boolean }) {
  const janela = estadoJanela(v);
  const alerta = v.quantidade > 0 ? alertaJanela(v) : undefined;
  const linha2 = [v.produtor, v.ano ?? 'NV'].filter(Boolean).join(' · ');
  const unit = valorGarrafa(v);
  const linhaValor = unit > 0 && v.quantidade > 0
    ? (v.quantidade > 1 ? `${formatarEuro(unit, true)} cada · total ${formatarEuro(unit * v.quantidade, true)}` : formatarEuro(unit, true))
    : undefined;
  const linha3 = [TIPOS.find((t) => t.id === v.tipo)?.nome, v.regiao].filter(Boolean).join(' · ');
  return (
    <li className={mover ? 'com-mover' : undefined}>
      {mover && (
        <span className="mover">
          <button aria-label={`Subir ${v.nome}`} disabled={primeiro} onClick={() => mover(-1)}>↑</button>
          <button aria-label={`Descer ${v.nome}`} disabled={ultimo} onClick={() => mover(1)}>↓</button>
        </span>
      )}
      <button className={`linha-vinho${v.quantidade === 0 ? ' acabado' : ''}`} onClick={() => abrir(v.id)}>
        <FotoVinho tipo={v.tipo} {...fotoProps(v, urls, true)} altura={70} className="mini" rotulo={{ nome: v.nome, ano: v.ano }} />
        <span className="linha-vinho-texto">
          <span className="linha-vinho-nome">{v.nome}</span>
          <span className="linha-vinho-sub">{linha2}</span>
          <span className="linha-vinho-sub fraco">
            <span className="ponto" style={{ background: `var(--${v.tipo})` }} /> {linha3}
          </span>
          {linhaValor && <span className="linha-vinho-valor num">{linhaValor}</span>}
          {v.criticas?.pontuacao !== undefined && <span className="linha-vinho-pontos num">★ {v.criticas.pontuacao} pts</span>}
          {alerta && <span className="linha-vinho-alerta" style={{ color: alerta.tipo === 'passou' ? 'var(--a-passar)' : 'var(--dourado)' }}>{alerta.texto}</span>}
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
