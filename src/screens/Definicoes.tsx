import { supabase } from '../lib/supabase';
import { Icone } from '../components/Icone';

export function Definicoes({ email }: { email?: string }) {
  return (
    <main className="ecra">
      <header className="cabecalho">
        <div>
          <div className="sobretitulo">Ajustes</div>
          <h1 className="titulo">Definições</h1>
        </div>
      </header>

      <div className="grupo">
        <h3 className="grupo-titulo">Conta</h3>
        <div className="cartao lista">
          <div className="linha-def"><span>Email</span><span className="valor">{email ?? 'Pré-visualização'}</span></div>
          <div className="linha-def">
            <span>Dados</span>
            <span className="valor" style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
              <Icone nome="nuvem" tamanho={16} /> {supabase ? 'Supabase (nuvem)' : 'Por configurar'}
            </span>
          </div>
          {supabase && (
            <button className="linha-def" style={{ width: '100%', color: '#e08a78' }} onClick={() => supabase!.auth.signOut()}>
              <span>Terminar sessão</span><Icone nome="sair" tamanho={18} />
            </button>
          )}
        </div>
      </div>

      <div className="grupo">
        <h3 className="grupo-titulo">Garrafeira</h3>
        <div className="cartao lista">
          {['Localizações', 'Exportar backup', 'Importar backup', 'Carregar exemplos'].map((t) => (
            <div key={t} className="linha-def" style={{ color: 'var(--texto-3)' }}>
              <span>{t}</span><span className="etiqueta">Fase 1</span>
            </div>
          ))}
        </div>
      </div>

      <p className="ajuda" style={{ marginTop: 32 }}>Garrafeira · versão 0.1</p>
    </main>
  );
}
