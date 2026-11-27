import { useEffect, useMemo, useState } from 'react';
import { FotoVinho } from '../components/FotoVinho';
import { Icone } from '../components/Icone';
import { BottomSheet } from '../components/BottomSheet';
import { Ficha } from './Ficha';
import { imagemExterna } from '../lib/imagens';
import { formatarEuro } from '../lib/formatos';
import { verPartilha, type VistaPartilha } from '../lib/partilhas';
import { TIPOS, type Vinho } from '../types';

const semAcentos = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const fotoDe = (v: Vinho) => { const u = imagemExterna(v); return u ? { url: u, externa: true } : {}; };

/** O que um amigo vê ao abrir uma ligação: só leitura, sem entrar. */
export function Partilhado({ token }: { token: string }) {
  const [dados, setDados] = useState<VistaPartilha | null | 'a-carregar' | 'erro'>('a-carregar');
  const [aberto, setAberto] = useState<string>();
  const [texto, setTexto] = useState('');
  const [tipo, setTipo] = useState('');
  const [pais, setPais] = useState('');
  const [regiao, setRegiao] = useState('');
  const [decada, setDecada] = useState('');
  const [casta, setCasta] = useState('');
  const [ordem, setOrdem] = useState<'nome' | 'ano' | 'valor' | 'pontuados'>('nome');
  const [minimo, setMinimo] = useState(0);
  const [folha, setFolha] = useState(false);

  useEffect(() => {
    document.title = 'Garrafeira';
    verPartilha(token).then(setDados).catch(() => setDados('erro'));
  }, [token]);

  const todos = useMemo(() => (typeof dados === 'object' && dados ? dados.vinhos : []), [dados]);
  const decadaDe = (v: Vinho) => (v.ano ? `${Math.floor(v.ano / 10) * 10}s` : 'NV');
  const unicos = (f: (v: Vinho) => (string | undefined)[]) =>
    [...new Set(todos.flatMap(f).filter((x): x is string => !!x))].sort((a, b) => a.localeCompare(b, 'pt'));
  const tiposPresentes = TIPOS.filter((t) => todos.some((v) => v.tipo === t.id));
  const paises = unicos((v) => [v.pais]);
  const regioes = unicos((v) => (!pais || v.pais === pais ? [v.regiao] : []));
  const decadas = unicos((v) => [decadaDe(v)]).reverse();
  const castas = unicos((v) => v.castas);
  const nFiltros = [pais, regiao, decada, casta].filter(Boolean).length + (minimo ? 1 : 0);
  const haNotas = todos.some((v) => v.criticas?.pontuacao !== undefined);
  const limpar = () => { setTipo(''); setPais(''); setRegiao(''); setDecada(''); setCasta(''); setTexto(''); setMinimo(0); };

  const vinhos = useMemo(() => {
    const q = semAcentos(texto.trim());
    const lista = todos.filter((v) =>
      (!tipo || v.tipo === tipo) && (!pais || v.pais === pais) && (!regiao || v.regiao === regiao) &&
      (!minimo || (v.criticas?.pontuacao ?? 0) >= minimo) && (!decada || decadaDe(v) === decada) && (!casta || v.castas.includes(casta)) &&
      (!q || q.split(/\s+/).every((p) =>
        semAcentos([v.nome, v.produtor, v.regiao, v.pais, v.ano ?? 'nv', TIPOS.find((t) => t.id === v.tipo)?.nome, ...v.castas].filter(Boolean).join(' ')).includes(p))));
    const cmp = ordem === 'ano' ? (a: Vinho, b: Vinho) => (b.ano ?? 0) - (a.ano ?? 0)
      : ordem === 'pontuados' ? (a: Vinho, b: Vinho) => (b.criticas?.pontuacao ?? -1) - (a.criticas?.pontuacao ?? -1)
      : ordem === 'valor' ? (a: Vinho, b: Vinho) => (b.valorEstimado ?? 0) - (a.valorEstimado ?? 0)
      : (a: Vinho, b: Vinho) => a.nome.localeCompare(b.nome, 'pt');
    return [...lista].sort((a, b) => cmp(a, b) || a.nome.localeCompare(b.nome, 'pt'));
  }, [todos, texto, tipo, pais, regiao, decada, casta, ordem, minimo]);

  if (dados === 'a-carregar') return <main className="ecra"><div className="lista">{[0, 1, 2].map((i) => <div key={i} className="linha-vinho esqueleto" />)}</div></main>;
  if (dados === 'erro') return <Aviso titulo="Não consegui abrir" texto="Confirma a ligação à internet e tenta outra vez." />;
  if (!dados || !dados.vinhos.length) return <Aviso titulo="Esta ligação já não está ativa" texto="Quem a partilhou deixou de partilhar, ou a ligação mudou. Pede uma nova." />;

  if (dados.tipo === 'vinho') {
    const v = dados.vinhos[0];
    return <Ficha v={v} foto={fotoDe(v)} leitura />;
  }

  const aVer = aberto ? dados.vinhos.find((v) => v.id === aberto) : undefined;
  return (
    <main className="ecra">
      <header className="cabecalho">
        <div>
          <div className="sobretitulo">Partilhada contigo</div>
          <h1 className="titulo">Garrafeira</h1>
          <p className="subtitulo">{dados.vinhos.length} {dados.vinhos.length === 1 ? 'item' : 'itens'} · só para ver</p>
        </div>
      </header>

      <label className="pesquisa">
        <Icone nome="pesquisa" tamanho={20} />
        <span className="sr-only">Pesquisar</span>
        <input type="search" placeholder="Nome, produtor, região, país, casta" value={texto} onChange={(e) => setTexto(e.target.value)} enterKeyHint="search" />
      </label>

      {tiposPresentes.length > 1 && (
        <div className="chips" aria-label="Tipo de bebida">
          <button className={`chip${!tipo ? ' ativo' : ''}`} onClick={() => setTipo('')}>Todos</button>
          {tiposPresentes.map((t) => (
            <button key={t.id} className={`chip${tipo === t.id ? ' ativo' : ''}`} onClick={() => setTipo(tipo === t.id ? '' : t.id)}>
              <span className="ponto" style={{ background: `var(--${t.id})` }} />{t.nome}
            </button>
          ))}
        </div>
      )}

      <div className="lista-topo">
        <span>
          {vinhos.length} {vinhos.length === 1 ? 'item' : 'itens'}
          <button className="ligacao" style={{ marginLeft: 12 }} onClick={() => setFolha(true)}>
            Filtros{nFiltros ? ` (${nFiltros})` : ''}
          </button>
          {(tipo || nFiltros > 0 || texto) && <button className="ligacao" style={{ marginLeft: 12 }} onClick={limpar}>Limpar</button>}
        </span>
        <label className="ordenar">
          <Icone nome="ordenar" tamanho={16} />
          <span className="sr-only">Ordenar por</span>
          <select value={ordem} onChange={(e) => setOrdem(e.target.value as 'nome' | 'ano' | 'valor' | 'pontuados')}>
            <option value="nome">Nome</option>
            <option value="ano">Ano</option>
            {haNotas && <option value="pontuados">Mais pontuados</option>}
            {dados.mostrarPrecos && <option value="valor">Valor</option>}
          </select>
        </label>
      </div>

      {vinhos.length === 0 ? (
        <p className="ajuda" style={{ marginTop: 32 }}>Nada encontrado com estes filtros. <button className="ligacao" onClick={limpar}>Limpar</button></p>
      ) : (
        <ul className="lista" style={{ marginTop: 16 }}>
          {vinhos.map((v) => (
            <li key={v.id}>
              <button className="linha-vinho" onClick={() => setAberto(v.id)}>
                <FotoVinho tipo={v.tipo} {...fotoDe(v)} altura={70} className="mini" rotulo={{ nome: v.nome, ano: v.ano }} />
                <span className="linha-vinho-texto">
                  <span className="linha-vinho-nome">{v.nome}</span>
                  <span className="linha-vinho-sub">{[v.produtor, v.ano ?? 'NV'].filter(Boolean).join(' · ')}</span>
 {v.criticas?.pontuacao !== undefined && <span className="linha-vinho-pontos num">★ {v.criticas.pontuacao} pts</span>}
                  <span className="linha-vinho-sub fraco">
                    <span className="ponto" style={{ background: `var(--${v.tipo})` }} /> {[TIPOS.find((t) => t.id === v.tipo)?.nome, v.regiao].filter(Boolean).join(' · ')}
                  </span>
                </span>
                {dados.mostrarPrecos && v.valorEstimado !== undefined && (
                  <span className="linha-vinho-lado"><span className="quantidade num">{formatarEuro(v.valorEstimado)}</span></span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="ajuda" style={{ marginTop: 32 }}>Garrafeira privada · partilhada só para ver</p>

      <BottomSheet aberta={folha} fechar={() => setFolha(false)} titulo="Filtrar">
        <Grupo titulo="País" opcoes={paises} valor={pais} mudar={(v) => { setPais(v); setRegiao(''); }} />
        <Grupo titulo="Região" opcoes={regioes} valor={regiao} mudar={setRegiao} />
        <Grupo titulo="Ano" opcoes={decadas} valor={decada} mudar={setDecada} />
        {haNotas && <Grupo titulo="Pontuação mínima" opcoes={['90', '92', '94']} valor={minimo ? String(minimo) : ''} mudar={(v) => setMinimo(Number(v) || 0)} />}
        <Grupo titulo="Casta" opcoes={castas} valor={casta} mudar={setCasta} />
        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <button className="botao secundario" onClick={limpar}>Limpar</button>
          <button className="botao" onClick={() => setFolha(false)}>Ver {vinhos.length} {vinhos.length === 1 ? 'item' : 'itens'}</button>
        </div>
      </BottomSheet>

      {aVer && <Ficha v={aVer} foto={fotoDe(aVer)} fechar={() => setAberto(undefined)} leitura />}
    </main>
  );
}

function Grupo({ titulo, opcoes, valor, mudar }: { titulo: string; opcoes: string[]; valor: string; mudar: (v: string) => void }) {
  if (!opcoes.length) return null;
  return (
    <div className="campo" style={{ marginTop: 14 }}>
      <span>{titulo}</span>
      <div className="chips-grelha">
        {opcoes.map((o) => (
          <button key={o} type="button" className={`chip${valor === o ? ' ativo' : ''}`} aria-pressed={valor === o} onClick={() => mudar(valor === o ? '' : o)}>{o}</button>
        ))}
      </div>
    </div>
  );
}

function Aviso({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <main className="ecra">
      <section className="vazio" style={{ marginTop: 80 }}>
        <h2>{titulo}</h2>
        <p>{texto}</p>
      </section>
    </main>
  );
}
