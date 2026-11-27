import { useEffect, useMemo, useState } from 'react';
import { useSessao } from './hooks/useSessao';
import { useVinhos } from './hooks/useVinhos';
import { BottomNav, type Separador } from './components/BottomNav';
import { useAviso } from './components/Aviso';
import { Entrar } from './screens/Entrar';
import { fotoProps } from './lib/imagens';
import { Garrafeira } from './screens/Garrafeira';
import { Definicoes } from './screens/Definicoes';
import { Adicionar } from './screens/Adicionar';
import { Ficha } from './screens/Ficha';
import { Formulario, type Sugestoes } from './screens/Formulario';
import { ImportarClaude } from './screens/ImportarClaude';
import { AbrirHoje } from './screens/AbrirHoje';
import { Diario } from './screens/Diario';
import { Partilhado } from './screens/Partilhado';
import { tokenDoEndereco } from './lib/partilhas';
import { criarExemplos } from './lib/exemplos';
import { caminhoMini } from './lib/vinhos';

type Vista = { tipo: 'lista' } | { tipo: 'ficha'; id: string } | { tipo: 'form'; id?: string; voltarFicha?: boolean } | { tipo: 'claude'; id?: undefined };

/** Ligação de partilha (#/v/…): página só de leitura, sem entrar. Qualquer outro endereço abre a garrafeira normal. */
export default function App() {
  const [token, setToken] = useState(tokenDoEndereco);
  useEffect(() => {
    const f = () => setToken(tokenDoEndereco());
    window.addEventListener('hashchange', f);
    return () => window.removeEventListener('hashchange', f);
  }, []);
  return token ? <Partilhado token={token} /> : <Painel />;
}

function Painel() {
  const sessao = useSessao();
  const dentro = sessao.estado === 'dentro' || sessao.estado === 'sem-config';
  const inv = useVinhos(dentro);
  const { avisar, elemento: aviso } = useAviso();
  const [separador, setSeparador] = useState<Separador>('garrafeira');
  const [adicionar, setAdicionar] = useState(false);
  const [vista, setVista] = useState<Vista>({ tipo: 'lista' });

  const sugestoes = useMemo<Sugestoes>(() => {
    const unicos = (xs: (string | undefined)[]) => [...new Set(xs.filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b, 'pt'));
    return {
      produtores: unicos(inv.vinhos.map((v) => v.produtor)),
      regioes: unicos(inv.vinhos.map((v) => v.regiao)),
      localizacoes: unicos(inv.vinhos.map((v) => v.localizacao)),
    };
  }, [inv.vinhos]);

  // Não deixar a página de trás rolar enquanto há uma ficha ou formulário aberto.
  useEffect(() => {
    document.body.classList.toggle('preso', vista.tipo !== 'lista');
  }, [vista.tipo]);

  if (sessao.estado === 'a-carregar') return <div className="app" />;
  if (sessao.estado === 'fora') return <Entrar />;

  const email = sessao.estado === 'dentro' ? sessao.sessao.user.email : undefined;
  const aberto = vista.tipo !== 'lista' && vista.id ? inv.vinhos.find((v) => v.id === vista.id) : undefined;

  async function carregarExemplos() {
    try {
      await inv.importar(criarExemplos());
      avisar('Seis vinhos de exemplo adicionados');
      setSeparador('garrafeira');
    } catch {
      avisar('Não consegui carregar os exemplos.', true);
    }
  }

  const tentar = (f: () => Promise<unknown>, erro: string) => { f().catch(() => avisar(erro, true)); };

  return (
    <div className="app">
      {sessao.estado === 'sem-config' && (
        <div className="aviso" style={{ margin: 'calc(var(--topo) + 12px) 20px 0' }}>
          Pré-visualização: o Supabase não está ligado, por isso os dados ficam só neste browser.
        </div>
      )}
      {separador === 'garrafeira' && (
        <Garrafeira inv={inv} adicionar={() => setAdicionar(true)} carregarExemplos={carregarExemplos}
          abrir={(id) => setVista({ tipo: 'ficha', id })} />
      )}
      {separador === 'abrir' && <AbrirHoje inv={inv} abrir={(id) => setVista({ tipo: 'ficha', id })} />}
      {separador === 'diario' && <Diario inv={inv} abrir={(id) => setVista({ tipo: 'ficha', id })} />}
      {separador === 'definicoes' && <Definicoes email={email} inv={inv} avisar={avisar} carregarExemplos={carregarExemplos}
        importarClaude={() => setVista({ tipo: 'claude' })} />}

      <BottomNav atual={separador} mudar={setSeparador} adicionar={() => setAdicionar(true)} />
      <Adicionar aberta={adicionar} fechar={() => setAdicionar(false)}
        aMao={() => { setAdicionar(false); setVista({ tipo: 'form' }); }}
        claude={() => { setAdicionar(false); setVista({ tipo: 'claude' }); }} />

      {vista.tipo === 'ficha' && aberto && (
        <Ficha v={aberto} foto={fotoProps(aberto, inv.urls, false)}
          consumos={inv.consumos.filter((c) => c.vinhoId === aberto.id)}
          abrirGarrafa={async (c) => {
            try { await inv.abrirGarrafa(c); avisar('Saúde! Ficou no Diário.'); }
            catch { avisar('Não consegui registar. Tenta outra vez.', true); }
          }}
          fechar={() => setVista({ tipo: 'lista' })}
          editar={() => setVista({ tipo: 'form', id: aberto.id, voltarFicha: true })}
          mudarQuantidade={(q) => tentar(() => inv.mudarQuantidade(aberto.id, q), 'Não consegui atualizar as garrafas.')}
          alternarFavorito={() => tentar(() => inv.alternarFavorito(aberto.id), 'Não consegui guardar o favorito.')}
          apagar={async () => {
            try {
              await inv.apagar(aberto.id);
              setVista({ tipo: 'lista' });
              avisar('Vinho apagado');
            } catch {
              avisar('Não consegui apagar. Tenta outra vez.', true);
            }
          }} />
      )}

      {vista.tipo === 'form' && (vista.id === undefined || aberto) && (
        <Formulario key={vista.id ?? 'novo'} inicial={aberto} sugestoes={sugestoes}
          fotoUrl={aberto?.fotoPath ? inv.urls[aberto.fotoPath] ?? inv.urls[caminhoMini(aberto.fotoPath)] : undefined}
          fechar={() => setVista(vista.voltarFicha && vista.id ? { tipo: 'ficha', id: vista.id } : { tipo: 'lista' })}
          guardar={async (dados, foto, pre) => {
            const salvo = await inv.guardar(dados, foto, pre);
            setSeparador('garrafeira');
            setVista({ tipo: 'ficha', id: salvo.id });
            avisar(aberto ? 'Alterações guardadas' : 'Vinho guardado');
          }} />
      )}

      {vista.tipo === 'claude' && (
        <ImportarClaude inv={inv} avisar={avisar} fechar={() => { setVista({ tipo: 'lista' }); setSeparador('garrafeira'); }} />
      )}

      {aviso}
    </div>
  );
}
