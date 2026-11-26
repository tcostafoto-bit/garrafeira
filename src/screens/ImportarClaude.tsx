import { useMemo, useState } from 'react';
import { Icone } from '../components/Icone';
import { FotoVinho } from '../components/FotoVinho';
import { formatarEuro } from '../lib/formatos';
import { aplicar, lerBloco, type Escolha, type ItemImportado } from '../lib/ponte';
import { TIPOS } from '../types';
import type { Inventario } from '../hooks/useVinhos';

export function ImportarClaude({ inv, fechar, avisar }:
  { inv: Inventario; fechar: () => void; avisar: (t: string, erro?: boolean) => void }) {
  const [texto, setTexto] = useState('');
  const [vista, setVista] = useState<'colar' | 'rever'>('colar');
  const [escolhas, setEscolhas] = useState<Record<number, Escolha>>({});
  const [aImportar, setAImportar] = useState(false);

  const leitura = useMemo(() => lerBloco(texto, inv.vinhos), [texto, inv.vinhos]);
  const itens = leitura.itens;
  const padrao = (it: ItemImportado): Escolha => (!it.existente ? 'criar' : it.acao === 'atualizar' ? 'substituir' : 'somar');
  const escolha = (i: number) => escolhas[i] ?? padrao(itens[i]);
  const existentes = itens.filter((it) => it.existente && it.acao === 'criar').length;
  const ativos = itens.filter((_, i) => escolha(i) !== 'ignorar');
  const garrafas = itens.reduce((s, it, i) => s + (escolha(i) === 'ignorar' ? 0 : it.campos.quantidade ?? (it.acao === 'atualizar' ? 0 : 1)), 0);

  async function colar() {
    try {
      const t = await navigator.clipboard.readText();
      if (t) { setTexto(t); rever(t); }
    } catch {
      avisar('Não consegui ler a área de transferência. Toca na caixa e escolhe Colar.', true);
    }
  }

  function rever(t = texto) {
    const r = lerBloco(t, inv.vinhos);
    if (r.itens.length) { setEscolhas({}); setVista('rever'); }
  }

  function todos(e: Escolha) {
    const n: Record<number, Escolha> = { ...escolhas };
    itens.forEach((it, i) => { if (it.existente && it.acao === 'criar' && escolha(i) !== 'ignorar') n[i] = e; });
    setEscolhas(n);
  }

  async function importar() {
    const lista = itens.map((it, i) => aplicar(it, escolha(i))).filter((x) => x !== null);
    if (!lista.length) return;
    setAImportar(true);
    try {
      await inv.importar(lista);
      avisar(`${lista.length} ${lista.length === 1 ? 'vinho importado' : 'vinhos importados'}`);
      fechar();
    } catch {
      avisar('Não consegui importar. Confirma a ligação e tenta outra vez.', true);
      setAImportar(false);
    }
  }

  return (
    <div className="sobreposto formulario" role="dialog" aria-modal="true" aria-label="Importar do Claude">
      <div className="barra-topo">
        <button className="botao-icone" onClick={vista === 'rever' ? () => setVista('colar') : fechar}
          aria-label={vista === 'rever' ? 'Voltar' : 'Fechar'}>
          <Icone nome={vista === 'rever' ? 'voltar' : 'fechar'} />
        </button>
        <div className="barra-titulo">Importar do Claude</div>
        <span style={{ width: 44 }} />
      </div>

      <div className="formulario-corpo">
        {vista === 'colar' ? (
          <>
            <p className="texto-guia">
              Tira uma foto ao rótulo, manda-a ao Claude e pede a ficha para a Garrafeira.
              Depois cola aqui o bloco <strong>GARRAFEIRA v1</strong> que ele te devolver. Podes colar vários blocos de uma vez.
            </p>
            <button className="botao secundario largo" onClick={colar}>
              <Icone nome="claude" tamanho={18} /> Colar o que copiei
            </button>
            <label className="campo" style={{ marginTop: 16 }}>
              <span>Ou cola aqui</span>
              <textarea className="bloco" rows={10} value={texto} onChange={(e) => setTexto(e.target.value)}
                placeholder={'GARRAFEIRA v1\n{ "acao": "criar", "vinhos": [ … ] }'} spellCheck={false} autoCorrect="off" autoCapitalize="off" />
            </label>
            {texto.trim() && leitura.erros.map((e) => <p key={e} className="erro">{e}</p>)}
            {texto.trim() && itens.length > 0 && (
              <p className="ajuda" style={{ textAlign: 'left', marginTop: 0 }}>
                Encontrei {itens.length} {itens.length === 1 ? 'vinho' : 'vinhos'}.
              </p>
            )}
          </>
        ) : (
          <>
            <section className="cartao resumo-importar">
              <div className="num" style={{ fontSize: 28 }}>{ativos.length} <span className="resumo-rotulo">vinhos</span></div>
              <div className="num" style={{ fontSize: 28 }}>{garrafas} <span className="resumo-rotulo">garrafas</span></div>
              {existentes > 0 && <div className="num" style={{ fontSize: 28 }}>{existentes} <span className="resumo-rotulo">já existem</span></div>}
            </section>
            {leitura.erros.map((e) => <p key={e} className="erro" style={{ marginTop: 12 }}>{e}</p>)}

            {existentes > 0 && (
              <section className="cartao pergunta">
                <strong>Somar garrafas ou substituir dados?</strong>
                <p>{existentes === 1 ? 'Um vinho já está' : `${existentes} vinhos já estão`} na garrafeira. Escolhe para todos ou um a um na lista.</p>
                <div className="segmentado">
                  <button onClick={() => todos('somar')}>Somar garrafas</button>
                  <button onClick={() => todos('substituir')}>Substituir dados</button>
                </div>
              </section>
            )}

            <ul className="lista" style={{ marginTop: 16 }}>
              {itens.map((it, i) => {
                const c = it.campos;
                const e = escolha(i);
                return (
                  <li key={i} className={`item-importar${e === 'ignorar' ? ' ignorado' : ''}`}>
                    <div className="item-importar-topo">
                      <FotoVinho tipo={c.tipo ?? it.existente?.tipo ?? 'outro'} altura={44} className="mini pequeno" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="linha-vinho-nome" style={{ fontSize: 16 }}>{c.nome}</div>
                        <div className="linha-vinho-sub">
                          {[c.ano ?? (it.acao === 'atualizar' ? undefined : 'NV'), TIPOS.find((t) => t.id === c.tipo)?.nome, c.regiao].filter(Boolean).join(' · ')}
                        </div>
                        <div className="linha-vinho-sub fraco">
                          {c.quantidade !== undefined && `×${c.quantidade}`}
                          {c.valorEstimado !== undefined && ` · ${formatarEuro(c.valorEstimado)}`}
                          {c.guia && ' · com guia'}
                        </div>
                      </div>
                      <button className={`marca${e === 'ignorar' ? '' : ' ativa'}`} aria-pressed={e !== 'ignorar'}
                        aria-label={e === 'ignorar' ? 'Incluir' : 'Não importar'}
                        onClick={() => setEscolhas({ ...escolhas, [i]: e === 'ignorar' ? padrao(it) : 'ignorar' })}>
                        {e !== 'ignorar' && <Icone nome="certo" tamanho={16} />}
                      </button>
                    </div>
                    {it.existente && e !== 'ignorar' && (
                      <div className="item-importar-escolha">
                        <span className="etiqueta" style={{ marginLeft: 0 }}>
                          {it.acao === 'atualizar' ? 'Atualizar' : 'Já existe'} · tens {it.existente.quantidade}
                        </span>
                        <div className="segmentado pequeno">
                          {(['somar', 'substituir', 'criar'] as const).map((x) => (
                            <button key={x} className={e === x ? 'ativo' : ''} onClick={() => setEscolhas({ ...escolhas, [i]: x })}>
                              {x === 'somar' ? 'Somar' : x === 'substituir' ? 'Substituir' : 'Novo'}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {it.avisos.map((a) => <p key={a} className="nota-grupo" style={{ margin: '6px 0 0' }}>{a}</p>)}
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>

      <div className="formulario-rodape">
        {vista === 'colar' ? (
          <button className="botao largo" disabled={!itens.length} onClick={() => rever()}>
            {itens.length ? `Rever ${itens.length} ${itens.length === 1 ? 'vinho' : 'vinhos'}` : 'Rever'}
          </button>
        ) : (
          <button className="botao largo" disabled={!ativos.length || aImportar} onClick={importar}>
            {aImportar ? 'A importar…' : `Importar ${ativos.length} ${ativos.length === 1 ? 'vinho' : 'vinhos'}`}
          </button>
        )}
      </div>
    </div>
  );
}
