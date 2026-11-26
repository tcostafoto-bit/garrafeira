import { useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Icone } from '../components/Icone';
import { BottomSheet } from '../components/BottomSheet';
import { lerBackup, partilharBackup } from '../lib/backup';
import { textoInventario } from '../lib/ponte';
import { TAG_EXEMPLO } from '../lib/exemplos';
import type { DadosVinho } from '../lib/vinhos';
import type { Inventario } from '../hooks/useVinhos';

export function Definicoes({ email, inv, avisar, carregarExemplos, importarClaude }:
  { email?: string; inv: Inventario; avisar: (t: string, erro?: boolean) => void; carregarExemplos: () => Promise<void>; importarClaude: () => void }) {
  const ficheiro = useRef<HTMLInputElement>(null);
  const [aImportar, setAImportar] = useState<DadosVinho[] | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const exemplos = inv.vinhos.filter((v) => v.tags.includes(TAG_EXEMPLO));
  const comFoto = inv.vinhos.filter((v) => v.fotoPath).length;

  async function copiarInventario() {
    const t = textoInventario(inv.vinhos);
    try {
      await navigator.clipboard.writeText(t);
      avisar('Inventário copiado. Cola-o numa conversa com o Claude.');
    } catch {
      try { await navigator.share({ text: t }); } catch { avisar('Não consegui copiar.', true); }
    }
  }

  async function escolher(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    try {
      const lista = await lerBackup(f);
      if (!lista.length) return avisar('O backup não tem vinhos.', true);
      setAImportar(lista);
    } catch (err) {
      avisar((err as Error).message, true);
    }
  }

  async function importar() {
    if (!aImportar) return;
    setOcupado(true);
    try {
      await inv.importar(aImportar);
      avisar(`${aImportar.length} vinhos importados`);
      setAImportar(null);
    } catch {
      avisar('Não consegui importar. Tenta outra vez.', true);
    } finally {
      setOcupado(false);
    }
  }

  async function correr(f: () => Promise<void>) {
    setOcupado(true);
    try { await f(); } finally { setOcupado(false); }
  }

  const existentes = aImportar ? aImportar.filter((v) => inv.vinhos.some((x) => x.id === v.id)).length : 0;

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
              <Icone nome="nuvem" tamanho={16} /> {supabase ? 'Supabase (nuvem)' : 'Neste browser'}
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
        <h3 className="grupo-titulo">Claude</h3>
        <div className="cartao lista">
          <button className="linha-def" style={{ width: '100%' }} disabled={!inv.vinhos.length} onClick={copiarInventario}>
            <span>Copiar inventário para o Claude</span><Icone nome="copiar" tamanho={18} />
          </button>
          <button className="linha-def" style={{ width: '100%' }} onClick={importarClaude}>
            <span>Importar do Claude</span><Icone nome="claude" tamanho={18} />
          </button>
        </div>
        <p className="nota-grupo">Copia a lista de vinhos com os ids. Cola-a numa conversa com o Claude para ele te aconselhar ou devolver correções num bloco GARRAFEIRA v1.</p>
      </div>

      <div className="grupo">
        <h3 className="grupo-titulo">Backup</h3>
        <div className="cartao lista">
          <button className="linha-def" style={{ width: '100%' }} disabled={!inv.vinhos.length || ocupado}
            onClick={() => partilharBackup(inv.vinhos).catch(() => avisar('Não consegui criar o backup.', true))}>
            <span>Exportar backup</span>
            <span className="valor" style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
              {inv.vinhos.length} vinhos <Icone nome="descarregar" tamanho={18} />
            </span>
          </button>
          <button className="linha-def" style={{ width: '100%' }} disabled={ocupado} onClick={() => ficheiro.current?.click()}>
            <span>Importar backup</span><Icone nome="carregar" tamanho={18} />
          </button>
        </div>
        <p className="nota-grupo">
          Ficheiro JSON com todos os dados dos vinhos. As fotos ficam na nuvem e não vão no ficheiro
          {comFoto ? ` (${comFoto} com foto)` : ''}.
        </p>
        <input ref={ficheiro} type="file" accept="application/json,.json" hidden onChange={escolher} />
      </div>

      <div className="grupo">
        <h3 className="grupo-titulo">Exemplos</h3>
        <div className="cartao lista">
          {exemplos.length ? (
            <button className="linha-def" style={{ width: '100%', color: '#e08a78' }} disabled={ocupado}
              onClick={() => correr(async () => {
                try { await inv.apagarVarios(exemplos.map((v) => v.id)); avisar('Exemplos removidos'); }
                catch { avisar('Não consegui remover os exemplos.', true); }
              })}>
              <span>Remover vinhos de exemplo</span><span className="valor">{exemplos.length}</span>
            </button>
          ) : (
            <button className="linha-def" style={{ width: '100%' }} disabled={ocupado} onClick={() => correr(carregarExemplos)}>
              <span>Carregar vinhos de exemplo</span><Icone nome="exemplos" tamanho={18} />
            </button>
          )}
        </div>
        <p className="nota-grupo">Seis vinhos portugueses para experimentar. Saem todos de uma vez com o botão acima.</p>
      </div>

      <p className="ajuda" style={{ marginTop: 32 }}>Garrafeira · versão 0.5</p>

      <BottomSheet aberta={!!aImportar} fechar={() => setAImportar(null)} titulo="Importar backup?">
        <p style={{ color: 'var(--texto-2)', marginTop: 0 }}>
          {aImportar?.length} vinhos no ficheiro.
          {existentes > 0 && ` ${existentes} já existem e vão ser substituídos pela versão do backup.`}
          {' '}Os restantes vinhos da garrafeira ficam como estão.
        </p>
        <button className="botao largo" disabled={ocupado} onClick={importar}>{ocupado ? 'A importar…' : 'Importar'}</button>
        <button className="botao secundario largo" style={{ marginTop: 10 }} onClick={() => setAImportar(null)}>Cancelar</button>
      </BottomSheet>
    </main>
  );
}
