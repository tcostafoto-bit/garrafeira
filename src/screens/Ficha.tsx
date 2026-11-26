import { useState } from 'react';
import { BottomSheet } from '../components/BottomSheet';
import { Contador } from '../components/Contador';
import { FotoVinho } from '../components/FotoVinho';
import { Icone } from '../components/Icone';
import { formatarEuro } from '../lib/formatos';
import { estadoJanela, NOME_JANELA, textoJanela } from '../lib/janela';
import { TIPOS, type Vinho } from '../types';

const formatarData = (d: string) =>
  new Date(d + 'T12:00:00').toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' });

const formatarVolume = (ml: number) => (ml >= 1000 ? `${(ml / 1000).toLocaleString('pt-PT')} L` : `${ml} ml`);

export function Ficha({ v, url, fechar, editar, mudarQuantidade, alternarFavorito, apagar }: {
  v: Vinho; url?: string; fechar: () => void; editar: () => void;
  mudarQuantidade: (q: number) => void; alternarFavorito: () => void; apagar: () => Promise<void>;
}) {
  const [confirmar, setConfirmar] = useState(false);
  const [aApagar, setAApagar] = useState(false);
  const tipo = TIPOS.find((t) => t.id === v.tipo)?.nome;
  const janela = estadoJanela(v);

  const detalhes: [string, string | undefined][] = [
    ['Denominação', v.denominacao],
    ['Origem', [v.regiao, v.pais].filter(Boolean).join(', ')],
    ['Castas', v.castas.join(', ') || undefined],
    ['Álcool', v.teorAlcool ? `${v.teorAlcool.toLocaleString('pt-PT')} %` : undefined],
    ['Garrafa', formatarVolume(v.volumeMl)],
    ['Comprado', [v.dataCompra && formatarData(v.dataCompra), v.localCompra].filter(Boolean).join(' · ') || undefined],
    ['Preço de compra', v.precoCompra !== undefined ? formatarEuro(v.precoCompra) : undefined],
    ['Valor estimado', v.valorEstimado !== undefined ? formatarEuro(v.valorEstimado) : undefined],
  ];

  return (
    <div className="sobreposto ficha" role="dialog" aria-modal="true" aria-label={v.nome}>
      <div className="barra-topo">
        <button className="botao-icone" onClick={fechar} aria-label="Voltar"><Icone nome="voltar" /></button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={`botao-icone${v.favorito ? ' dourado' : ''}`} onClick={alternarFavorito}
            aria-label={v.favorito ? 'Tirar dos favoritos' : 'Marcar como favorito'} aria-pressed={v.favorito}>
            <Icone nome={v.favorito ? 'estrela-cheia' : 'estrela'} />
          </button>
          <button className="botao-icone" onClick={editar} aria-label="Editar"><Icone nome="lapis" /></button>
        </div>
      </div>

      <div className="ficha-heroi" style={{ ['--cor-tipo' as string]: `var(--${v.tipo})` }}>
        <FotoVinho tipo={v.tipo} url={url} altura={200} className="grande" />
      </div>

      <div className="ficha-corpo">
        {v.produtor && <div className="sobretitulo">{v.produtor}</div>}
        <h1 className="titulo" style={{ fontSize: 30 }}>{v.nome}</h1>
        <p className="subtitulo">
          <span className="ponto" style={{ background: `var(--${v.tipo})`, display: 'inline-block', marginRight: 8, verticalAlign: 'middle' }} />
          {[v.ano ?? 'NV', tipo, v.regiao].filter(Boolean).join(' · ')}
        </p>

        <section className="cartao ficha-stock">
          <div>
            <div className="resumo-rotulo" style={{ marginTop: 0 }}>Na garrafeira</div>
            <div className="ficha-local">
              {v.quantidade === 0 ? 'Acabou' : v.localizacao
                ? <><Icone nome="local" tamanho={15} /> {v.localizacao}</>
                : `${v.quantidade} ${v.quantidade === 1 ? 'garrafa' : 'garrafas'}`}
            </div>
          </div>
          <Contador valor={v.quantidade} mudar={mudarQuantidade} grande />
        </section>

        {janela && (
          <div className="ficha-janela">
            <span className="ponto" style={{ background: `var(--${janela})` }} />
            <span><strong>{NOME_JANELA[janela]}</strong> · beber {textoJanela(v)}</span>
          </div>
        )}

        <section className="cartao lista" style={{ marginTop: 16 }}>
          {detalhes.filter(([, val]) => val).map(([k, val]) => (
            <div key={k} className="linha-def"><span>{k}</span><span className="valor">{val}</span></div>
          ))}
        </section>

        {v.notas && (
          <section className="grupo">
            <h3 className="grupo-titulo">Notas</h3>
            <p className="ficha-notas">{v.notas}</p>
          </section>
        )}

        <button className="botao secundario largo perigo" style={{ marginTop: 32 }} onClick={() => setConfirmar(true)}>
          <Icone nome="lixo" tamanho={18} /> Apagar vinho
        </button>
      </div>

      <BottomSheet aberta={confirmar} fechar={() => setConfirmar(false)} titulo="Apagar este vinho?">
        <p style={{ color: 'var(--texto-2)', marginTop: 0 }}>
          «{v.nome}» e a foto saem da garrafeira de vez. Se só bebeste a última garrafa, usa o − e fica guardado em «Acabados».
        </p>
        <button className="botao largo perigo-cheio" disabled={aApagar}
          onClick={async () => { setAApagar(true); try { await apagar(); } finally { setAApagar(false); } }}>
          {aApagar ? 'A apagar…' : 'Apagar'}
        </button>
        <button className="botao secundario largo" style={{ marginTop: 10 }} onClick={() => setConfirmar(false)}>Cancelar</button>
      </BottomSheet>
    </div>
  );
}
