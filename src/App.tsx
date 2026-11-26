import { useState } from 'react';
import { useSessao } from './hooks/useSessao';
import { BottomNav, type Separador } from './components/BottomNav';
import { Entrar } from './screens/Entrar';
import { Garrafeira } from './screens/Garrafeira';
import { Definicoes } from './screens/Definicoes';
import { EmBreve } from './screens/EmBreve';
import { Adicionar } from './screens/Adicionar';

export default function App() {
  const sessao = useSessao();
  const [separador, setSeparador] = useState<Separador>('garrafeira');
  const [adicionar, setAdicionar] = useState(false);

  if (sessao.estado === 'a-carregar') return <div className="app" />;
  if (sessao.estado === 'fora') return <Entrar />;

  const email = sessao.estado === 'dentro' ? sessao.sessao.user.email : undefined;

  return (
    <div className="app">
      {sessao.estado === 'sem-config' && (
        <div className="aviso" style={{ margin: 'calc(var(--topo) + 12px) 20px 0' }}>
          Pré-visualização: o Supabase ainda não está ligado, por isso não há login nem dados.
        </div>
      )}
      {separador === 'garrafeira' && <Garrafeira adicionar={() => setAdicionar(true)} />}
      {separador === 'abrir' && (
        <EmBreve sobretitulo="Sommelier" titulo="O que abro hoje?" icone="copo"
          texto="Escolhes o prato e a app sugere três vinhos que tens em casa." />
      )}
      {separador === 'diario' && (
        <EmBreve sobretitulo="Memória" titulo="Diário" icone="diario"
          texto="As garrafas que vais abrindo, com nota, prato e ocasião." />
      )}
      {separador === 'definicoes' && <Definicoes email={email} />}

      <BottomNav atual={separador} mudar={setSeparador} adicionar={() => setAdicionar(true)} />
      <Adicionar aberta={adicionar} fechar={() => setAdicionar(false)} />
    </div>
  );
}
