import { useState } from 'react';
import { BottomSheet } from './BottomSheet';
import { Icone } from './Icone';
import type { Consumo, Vinho } from '../types';

const OCASIOES = ['Jantar em casa', 'Com amigos', 'Em família', 'Celebração', 'Oferta'];

/** Folha "Abrir uma garrafa": regista no Diário e tira uma garrafa. */
export function AbrirGarrafa({ v, aberta, fechar, guardar }:
  { v: Vinho; aberta: boolean; fechar: () => void; guardar: (c: Omit<Consumo, 'id'>) => Promise<void> }) {
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));
  const [ocasiao, setOcasiao] = useState('');
  const [prato, setPrato] = useState('');
  const [nota, setNota] = useState<number | undefined>();
  const [comentario, setComentario] = useState('');
  const [ocupado, setOcupado] = useState(false);

  async function submeter() {
    setOcupado(true);
    try {
      await guardar({
        vinhoId: v.id, data, ocasiao: ocasiao.trim() || undefined, prato: prato.trim() || undefined,
        nota, comentario: comentario.trim() || undefined,
      });
      setOcasiao(''); setPrato(''); setNota(undefined); setComentario('');
    } finally {
      setOcupado(false);
    }
  }

  return (
    <BottomSheet aberta={aberta} fechar={fechar} titulo="Abrir uma garrafa">
      <div className="folha-rolar">
        <p style={{ color: 'var(--texto-2)', marginTop: 0, fontSize: 14 }}>
          Fica no Diário e passa a haver {Math.max(0, v.quantidade - 1)} {v.quantidade - 1 === 1 ? 'garrafa' : 'garrafas'} de «{v.nome}».
        </p>
        <div className="campo">
          <span>Nota</span>
          <Estrelas valor={nota} mudar={setNota} />
        </div>
        <label className="campo">
          <span>Com que prato</span>
          <input value={prato} onChange={(e) => setPrato(e.target.value)} placeholder="ex.: cabrito assado" />
        </label>
        <div className="campo">
          <span>Ocasião</span>
          <div className="chips-grelha">
            {OCASIOES.map((o) => (
              <button key={o} type="button" className={`chip${ocasiao === o ? ' ativo' : ''}`} onClick={() => setOcasiao(ocasiao === o ? '' : o)}>{o}</button>
            ))}
          </div>
        </div>
        <label className="campo">
          <span>Comentário</span>
          <textarea rows={2} value={comentario} onChange={(e) => setComentario(e.target.value)} placeholder="Como estava?" />
        </label>
        <label className="campo">
          <span>Data</span>
          <input type="date" value={data} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setData(e.target.value || data)} />
        </label>
      </div>
      <button className="botao largo" disabled={ocupado} onClick={submeter}>
        <Icone nome="copo" tamanho={18} /> {ocupado ? 'A guardar…' : 'Abrir e registar'}
      </button>
    </BottomSheet>
  );
}

/** Nota de 1 a 5 com meias estrelas: tocar de novo na mesma estrela tira meia. */
export function Estrelas({ valor, mudar, tamanho = 30 }: { valor?: number; mudar?: (n: number | undefined) => void; tamanho?: number }) {
  return (
    <div className="estrelas" role={mudar ? 'radiogroup' : 'img'} aria-label={valor ? `${valor} em 5` : 'Sem nota'}>
      {[1, 2, 3, 4, 5].map((i) => {
        const cheia = (valor ?? 0) >= i;
        const meia = !cheia && (valor ?? 0) >= i - 0.5;
        const corpo = (
          <span className={`estrela${cheia ? ' cheia' : meia ? ' meia' : ''}`} style={{ width: tamanho, height: tamanho }}>
            <Icone nome="estrela" tamanho={tamanho} />
            <span className="estrela-preenchida"><Icone nome="estrela-cheia" tamanho={tamanho} /></span>
          </span>
        );
        return mudar ? (
          <button key={i} type="button" aria-label={`${i} estrelas`}
            onClick={() => mudar(valor === i ? i - 0.5 : valor === i - 0.5 ? undefined : i)}>{corpo}</button>
        ) : <span key={i}>{corpo}</span>;
      })}
    </div>
  );
}
