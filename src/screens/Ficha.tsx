import { useState } from 'react';
import { BottomSheet } from '../components/BottomSheet';
import { Contador } from '../components/Contador';
import { FotoVinho } from '../components/FotoVinho';
import { Icone } from '../components/Icone';
import { AbrirGarrafa, Estrelas } from '../components/AbrirGarrafa';
import { formatarEuro, formatarMoeda, formatarTemperatura } from '../lib/formatos';
import { estadoJanela, NOME_JANELA, noPico, textoJanela } from '../lib/janela';
import { guiaEfetivo } from '../lib/guia';
import { TIPOS, type Consumo, type Vinho } from '../types';

const formatarData = (d: string) =>
  new Date(d + 'T12:00:00').toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' });

const formatarVolume = (ml: number) => (ml >= 1000 ? `${(ml / 1000).toLocaleString('pt-PT')} L` : `${ml} ml`);

const DECANTAR = { nao: 'Não precisa', opcional: 'Opcional', sim: 'Sim' } as const;

export function Ficha({ v, url, consumos, fechar, editar, mudarQuantidade, alternarFavorito, apagar, abrirGarrafa }: {
  v: Vinho; url?: string; consumos: Consumo[]; fechar: () => void; editar: () => void;
  mudarQuantidade: (q: number) => void; alternarFavorito: () => void; apagar: () => Promise<void>;
  abrirGarrafa: (c: Omit<Consumo, 'id'>) => Promise<void>;
}) {
  const [confirmar, setConfirmar] = useState(false);
  const [aApagar, setAApagar] = useState(false);
  const [abrir, setAbrir] = useState(false);
  const tipo = TIPOS.find((t) => t.id === v.tipo)?.nome;
  const janela = estadoJanela(v);
  const { guia, origem } = guiaEfetivo(v);
  const pico = noPico(v);

  const detalhes: [string, string | undefined][] = [
    ['Denominação', v.denominacao],
    ['Origem', [v.regiao, v.pais].filter(Boolean).join(', ')],
    ['Castas', v.castas.join(', ') || undefined],
    ['Álcool', v.teorAlcool ? `${v.teorAlcool.toLocaleString('pt-PT')} %` : undefined],
    ['Garrafa', formatarVolume(v.volumeMl)],
    ['Comprado', [v.dataCompra && formatarData(v.dataCompra), v.localCompra].filter(Boolean).join(' · ') || undefined],
    ['Preço de compra', v.precoCompra !== undefined ? formatarEuro(v.precoCompra) : undefined],
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
          <div style={{ minWidth: 0 }}>
            <div className="resumo-rotulo" style={{ marginTop: 0 }}>Na garrafeira</div>
            <div className="ficha-local">
              {v.quantidade === 0 ? 'Acabou' : v.localizacao
                ? <><Icone nome="local" tamanho={15} /> {v.localizacao}</>
                : `${v.quantidade} ${v.quantidade === 1 ? 'garrafa' : 'garrafas'}`}
            </div>
          </div>
          <Contador valor={v.quantidade} mudar={mudarQuantidade} grande />
        </section>
        {v.quantidade > 0 && (
          <button className="botao largo" style={{ marginTop: 12 }} onClick={() => setAbrir(true)}>
            <Icone nome="copo" tamanho={18} /> Abrir uma garrafa
          </button>
        )}

        {(v.valorEstimado !== undefined || v.valorFontes.length > 0) && (
          <section className="cartao valor">
            <div className="valor-topo">
              <div>
                <div className="resumo-rotulo" style={{ marginTop: 0 }}>Valor estimado · por garrafa{v.volumeMl !== 750 ? ` de ${formatarVolume(v.volumeMl)}` : ''}</div>
                <div className="num dourado" style={{ fontSize: 28, color: 'var(--dourado)' }}>
                  {v.valorEstimado !== undefined ? formatarEuro(v.valorEstimado) : '–'}
                </div>
              </div>
              {(v.valorMin !== undefined || v.valorMax !== undefined) && (
                <div className="valor-intervalo">
                  {v.valorMin !== undefined && formatarEuro(v.valorMin)}{v.valorMin !== undefined && v.valorMax !== undefined && ' – '}{v.valorMax !== undefined && formatarEuro(v.valorMax)}
                </div>
              )}
            </div>
            {v.valorFontes.length > 0 && (
              <ul className="fontes">
                {v.valorFontes.map((f) => (
                  <li key={f.url + f.titulo}>
                    <span style={{ minWidth: 0 }}>
                      <a href={f.url} target="_blank" rel="noopener noreferrer">{f.titulo}</a>
                      {f.nota && <span className="fonte-nota">{f.nota}</span>}
                    </span>
                    {f.preco !== undefined && <span className="num">{formatarMoeda(f.preco, f.moeda)}</span>}
                  </li>
                ))}
              </ul>
            )}
            {v.valorAtualizadoEm && <div className="nota-grupo" style={{ margin: '10px 0 0' }}>Pesquisado em {formatarData(v.valorAtualizadoEm)}</div>}
          </section>
        )}

        <section className="grupo">
          <h3 className="grupo-titulo">Como servir</h3>
          {janela && (
            <div className="ficha-janela" style={{ marginTop: 0, marginBottom: 12 }}>
              <span className="ponto" style={{ background: `var(--${janela})` }} />
              <span>
                <strong>{pico ? 'No melhor momento' : NOME_JANELA[janela]}</strong>
                {textoJanela(v) && <> · beber {textoJanela(v)}</>}
                {guia.picoDe && guia.picoAte && <> · melhor {guia.picoDe}–{guia.picoAte}</>}
              </span>
            </div>
          )}
          <div className="guia-grelha">
            <div className="guia-caixa"><div className="resumo-rotulo">Temperatura</div><div className="num">{formatarTemperatura(guia.temperaturaMin, guia.temperaturaMax)}</div></div>
            <div className="guia-caixa"><div className="resumo-rotulo">Decantar</div><div>{DECANTAR[guia.decantar]}{guia.decantar !== 'nao' && guia.decantarMinutos ? ` · ${guia.decantarMinutos} min` : ''}</div></div>
            {guia.copo && <div className="guia-caixa largo"><div className="resumo-rotulo">Copo</div><div>{guia.copo}</div></div>}
          </div>
          {guia.decantarNota && <p className="ficha-notas" style={{ marginTop: 10 }}>{guia.decantarNota}</p>}

          {guia.perfil && (
            <div className="perfil">
              {([['Corpo', guia.perfil.corpo], ['Acidez', guia.perfil.acidez], ['Taninos', guia.perfil.taninos], ['Doçura', guia.perfil.docura]] as const)
                .filter(([, n]) => n).map(([k, n]) => (
                  <div key={k} className="perfil-linha">
                    <span>{k}</span>
                    <span className="perfil-barra">{[1, 2, 3, 4, 5].map((i) => <span key={i} className={i <= n! ? 'cheio' : ''} />)}</span>
                  </div>
                ))}
            </div>
          )}

          {guia.harmonizacoes.length > 0 && (
            <>
              <h4 className="sub-grupo">Pratos</h4>
              <ul className="pratos">
                {guia.harmonizacoes.map((h) => (
                  <li key={h.prato}><strong>{h.prato}</strong>{h.porque && <span>{h.porque}</span>}</li>
                ))}
              </ul>
            </>
          )}
          {guia.evitar && guia.evitar.length > 0 && <p className="nota-grupo">Evitar: {guia.evitar.join(', ')}.</p>}
          {guia.notasProva && (
            <>
              <h4 className="sub-grupo">Prova</h4>
              <p className="ficha-notas">{guia.notasProva}</p>
            </>
          )}
          <p className="nota-grupo">{origem === 'claude' ? 'Guia feito pelo Claude.' : 'Guia aproximado, calculado pela app a partir do tipo, região e ano. Para um guia à medida, pede a ficha ao Claude.'}</p>
        </section>

        <section className="grupo">
          <h3 className="grupo-titulo">Ficha</h3>
          <div className="cartao lista">
            {detalhes.filter(([, val]) => val).map(([k, val]) => (
              <div key={k} className="linha-def"><span>{k}</span><span className="valor">{val}</span></div>
            ))}
          </div>
        </section>

        {v.notas && (
          <section className="grupo">
            <h3 className="grupo-titulo">Notas</h3>
            <p className="ficha-notas">{v.notas}</p>
          </section>
        )}

        {consumos.length > 0 && (
          <section className="grupo">
            <h3 className="grupo-titulo">Garrafas abertas</h3>
            <div className="cartao lista">
              {consumos.map((c) => (
                <div key={c.id} className="linha-def" style={{ alignItems: 'flex-start' }}>
                  <span>
                    <span style={{ display: 'block' }}>{formatarData(c.data)}</span>
                    <span className="nota-grupo" style={{ margin: 0 }}>{[c.prato, c.ocasiao].filter(Boolean).join(' · ')}</span>
                    {c.comentario && <span className="diario-comentario">«{c.comentario}»</span>}
                  </span>
                  {c.nota && <Estrelas valor={c.nota} tamanho={12} />}
                </div>
              ))}
            </div>
          </section>
        )}

        <button className="botao secundario largo perigo" style={{ marginTop: 32 }} onClick={() => setConfirmar(true)}>
          <Icone nome="lixo" tamanho={18} /> Apagar vinho
        </button>
      </div>

      <AbrirGarrafa v={v} aberta={abrir} fechar={() => setAbrir(false)}
        guardar={async (c) => { await abrirGarrafa(c); setAbrir(false); }} />

      <BottomSheet aberta={confirmar} fechar={() => setConfirmar(false)} titulo="Apagar este vinho?">
        <p style={{ color: 'var(--texto-2)', marginTop: 0 }}>
          «{v.nome}», a foto{consumos.length ? ' e as entradas no Diário' : ''} saem de vez. Se só bebeste a última garrafa, usa «Abrir uma garrafa» e o vinho fica em «Acabados».
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
