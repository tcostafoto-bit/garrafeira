import { useEffect, useState } from 'react';
import { BottomSheet } from './BottomSheet';
import { Icone } from './Icone';
import { supabase } from '../lib/supabase';
import {
  alterarPrecos, apagarPartilha, criarPartilha, FaltaMigracao, ligacao, listarPartilhas, type Partilha,
} from '../lib/partilhas';
import type { Vinho } from '../types';

/** Folha para partilhar uma garrafa (vinho) ou a garrafeira toda, só para ver. */
export function PartilharFolha({ aberta, fechar, vinho }: { aberta: boolean; fechar: () => void; vinho?: Vinho }) {
  const tipo = vinho ? 'vinho' : 'garrafeira';
  const [partilha, setPartilha] = useState<Partilha | null | undefined>(undefined);
  const [precos, setPrecos] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string>();
  const [aviso, setAviso] = useState<string>();

  useEffect(() => {
    if (!aberta) return;
    setPartilha(undefined); setErro(undefined); setAviso(undefined);
    listarPartilhas()
      .then((l) => {
        const p = l.find((x) => x.tipo === tipo && (tipo === 'garrafeira' || x.vinhoId === vinho?.id)) ?? null;
        setPartilha(p);
        setPrecos(p?.mostrarPrecos ?? false);
      })
      .catch((e) => { setPartilha(null); setErro(e instanceof FaltaMigracao ? 'migracao' : 'Não consegui carregar. Confirma a ligação à internet.'); });
  }, [aberta, tipo, vinho?.id]);

  async function fazer(f: () => Promise<void>) {
    setOcupado(true); setErro(undefined); setAviso(undefined);
    try { await f(); } catch (e) { setErro(e instanceof FaltaMigracao ? 'migracao' : 'Não consegui. Tenta outra vez.'); }
    finally { setOcupado(false); }
  }

  const criar = () => fazer(async () => { setPartilha(await criarPartilha(tipo, vinho?.id, precos)); });
  const parar = () => fazer(async () => { if (partilha) await apagarPartilha(partilha.id); setPartilha(null); setAviso('Deixou de estar partilhado.'); });
  const novaLigacao = () => fazer(async () => {
    if (partilha) await apagarPartilha(partilha.id);
    setPartilha(await criarPartilha(tipo, vinho?.id, precos));
    setAviso('Ligação nova criada. A antiga deixou de funcionar.');
  });
  const mudarPrecos = (v: boolean) => {
    setPrecos(v);
    if (partilha) fazer(async () => { await alterarPrecos(partilha.id, v); setPartilha({ ...partilha, mostrarPrecos: v }); });
  };

  const url = partilha ? ligacao(partilha.token) : '';
  async function copiar() {
    try { await navigator.clipboard.writeText(url); setAviso('Ligação copiada.'); } catch { setAviso('Não consegui copiar. Seleciona a ligação e copia à mão.'); }
  }
  async function enviar() {
    try { await navigator.share({ title: vinho ? vinho.nome : 'A minha garrafeira', url }); } catch { /* cancelado */ }
  }

  return (
    <BottomSheet aberta={aberta} fechar={fechar} titulo={vinho ? 'Partilhar esta garrafa' : 'Partilhar a garrafeira'}>
      <p style={{ color: 'var(--texto-2)', marginTop: 0 }}>
        {vinho
          ? 'Quem tiver a ligação vê as características desta garrafa, sem precisar de conta. Só para ver.'
          : 'Quem tiver a ligação vê todos os vinhos que tens (sem os já acabados), sem precisar de conta. Só para ver.'}
        {' '}Não vê notas, locais, preços de compra, favoritos nem as tuas fotos.
      </p>

      {!supabase && <div className="aviso">Pré-visualização: a ligação só abre neste browser.</div>}
      {erro && <div className="aviso" style={{ borderColor: 'rgba(224,138,120,.5)' }}>{erro === 'migracao'
        ? <>Falta ativar a partilha na base de dados (uma única vez). Segue o guia que o Claude te enviou, o ficheiro «002_partilhas.sql».</> : erro}</div>}

      {partilha === undefined && <p className="ajuda">A carregar…</p>}

      {partilha !== undefined && (
        <label className="interruptor">
          <input type="checkbox" checked={precos} disabled={ocupado || (partilha === null && !!erro)} onChange={(e) => mudarPrecos(e.target.checked)} />
          <span>Mostrar o valor estimado</span>
        </label>
      )}

      {partilha === null && !erro && (
        <button className="botao largo" style={{ marginTop: 14 }} disabled={ocupado} onClick={criar}>
          {ocupado ? 'A criar…' : 'Criar ligação'}
        </button>
      )}

      {partilha && (
        <>
          <input className="ligacao-caixa" readOnly value={url} aria-label="Ligação para partilhar" onFocus={(e) => e.currentTarget.select()} />
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button className="botao" style={{ flex: 1 }} onClick={copiar}><Icone nome="copiar" tamanho={18} /> Copiar</button>
            {typeof navigator.share === 'function' && (
              <button className="botao" style={{ flex: 1 }} onClick={enviar}><Icone nome="partilhar" tamanho={18} /> Enviar</button>
            )}
          </div>
          <button className="botao secundario largo" style={{ marginTop: 10 }} disabled={ocupado} onClick={novaLigacao}>Criar ligação nova</button>
          <button className="botao secundario largo perigo" style={{ marginTop: 10 }} disabled={ocupado} onClick={parar}>Parar de partilhar</button>
        </>
      )}

      {aviso && <p className="ajuda" style={{ marginTop: 12 }} role="status">{aviso}</p>}
    </BottomSheet>
  );
}
