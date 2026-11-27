import { useEffect, useMemo, useState } from 'react';
import { FotoVinho } from '../components/FotoVinho';
import { Icone } from '../components/Icone';
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

  useEffect(() => {
    document.title = 'Garrafeira';
    verPartilha(token).then(setDados).catch(() => setDados('erro'));
  }, [token]);

  const vinhos = useMemo(() => {
    if (typeof dados !== 'object' || !dados) return [];
    const q = semAcentos(texto.trim());
    const lista = !q ? dados.vinhos : dados.vinhos.filter((v) => q.split(/\s+/).every((p) =>
      semAcentos([v.nome, v.produtor, v.regiao, v.ano ?? 'nv', TIPOS.find((t) => t.id === v.tipo)?.nome, ...v.castas].filter(Boolean).join(' ')).includes(p)));
    return [...lista].sort((a, b) => a.nome.localeCompare(b.nome, 'pt'));
  }, [dados, texto]);

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
          <p className="subtitulo">{dados.vinhos.length} {dados.vinhos.length === 1 ? 'vinho' : 'vinhos'} · só para ver</p>
        </div>
      </header>

      <label className="pesquisa">
        <Icone nome="pesquisa" tamanho={20} />
        <span className="sr-only">Pesquisar</span>
        <input type="search" placeholder="Nome, produtor, região, casta" value={texto} onChange={(e) => setTexto(e.target.value)} enterKeyHint="search" />
      </label>

      {vinhos.length === 0 ? (
        <p className="ajuda" style={{ marginTop: 32 }}>Nenhum vinho encontrado para «{texto}».</p>
      ) : (
        <ul className="lista" style={{ marginTop: 16 }}>
          {vinhos.map((v) => (
            <li key={v.id}>
              <button className="linha-vinho" onClick={() => setAberto(v.id)}>
                <FotoVinho tipo={v.tipo} {...fotoDe(v)} altura={70} className="mini" rotulo={{ nome: v.nome, ano: v.ano }} />
                <span className="linha-vinho-texto">
                  <span className="linha-vinho-nome">{v.nome}</span>
                  <span className="linha-vinho-sub">{[v.produtor, v.ano ?? 'NV'].filter(Boolean).join(' · ')}</span>
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

      {aVer && <Ficha v={aVer} foto={fotoDe(aVer)} fechar={() => setAberto(undefined)} leitura />}
    </main>
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
