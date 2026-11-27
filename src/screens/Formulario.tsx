import { Fragment, useEffect, useRef, useState } from 'react';
import { Contador } from '../components/Contador';
import { Icone } from '../components/Icone';
import { GarrafaSilhueta } from '../components/GarrafaSilhueta';
import { formaGarrafa } from '../components/FotoVinho';
import { prepararFoto } from '../lib/fotos';
import type { DadosVinho } from '../lib/vinhos';
import type { FotoNova } from '../hooks/useVinhos';
import { TIPOS, ehBebida, type TipoVinho, type Vinho } from '../types';

const PASSOS = ['Rótulo', 'Origem', 'Na garrafeira'] as const;
const VOLUMES = [330, 375, 500, 700, 750, 1000, 1500, 3000];
const ANO_ATUAL = new Date().getFullYear();

const paraTexto = (n?: number) => (n === undefined ? '' : String(n).replace('.', ','));
const paraNumero = (s: string) => {
  const t = s.trim().replace(/\s/g, '').replace(',', '.');
  if (!t) return undefined;
  const x = Number(t);
  return Number.isFinite(x) ? x : undefined;
};

export interface Sugestoes { produtores: string[]; regioes: string[]; localizacoes: string[] }

export function Formulario({ inicial, fotoUrl, sugestoes, fechar, guardar }: {
  inicial?: Vinho; fotoUrl?: string; sugestoes: Sugestoes; fechar: () => void;
  guardar: (d: DadosVinho, foto: FotoNova, pre?: string) => Promise<void>;
}) {
  const editar = !!inicial;
  const [passo, setPasso] = useState(0);
  const [f, setF] = useState(() => ({
    nome: inicial?.nome ?? '',
    produtor: inicial?.produtor ?? '',
    ano: inicial?.ano ? String(inicial.ano) : '',
    nv: editar ? inicial!.ano === undefined : false,
    tipo: (inicial?.tipo ?? 'tinto') as TipoVinho,
    pais: inicial?.pais ?? 'Portugal',
    regiao: inicial?.regiao ?? '',
    denominacao: inicial?.denominacao ?? '',
    castas: inicial?.castas.join(', ') ?? '',
    teorAlcool: paraTexto(inicial?.teorAlcool),
    volumeMl: inicial?.volumeMl ?? 750,
    quantidade: inicial?.quantidade ?? 1,
    localizacao: inicial?.localizacao ?? '',
    dataCompra: inicial?.dataCompra ?? '',
    precoCompra: paraTexto(inicial?.precoCompra),
    localCompra: inicial?.localCompra ?? '',
    valorEstimado: paraTexto(inicial?.valorEstimado),
    notas: inicial?.notas ?? '',
  }));
  const [foto, setFoto] = useState<FotoNova>(undefined);
  const [pre, setPre] = useState<string | undefined>(fotoUrl);
  const [aPreparar, setAPreparar] = useState(false);
  const [aGuardar, setAGuardar] = useState(false);
  const [erro, setErro] = useState('');
  const ficheiro = useRef<HTMLInputElement>(null);
  const corpo = useRef<HTMLDivElement>(null);

  const mudar = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));

  useEffect(() => { corpo.current?.scrollTo({ top: 0 }); }, [passo]);

  async function escolherFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const fi = e.target.files?.[0];
    e.target.value = '';
    if (!fi) return;
    setAPreparar(true); setErro('');
    try {
      const r = await prepararFoto(fi);
      setFoto({ grande: r.grande, mini: r.mini });
      setPre(r.preVisualizacao);
    } catch {
      setErro('Não consegui ler esta foto. Tenta outra.');
    } finally {
      setAPreparar(false);
    }
  }

  function validar(): string {
    if (!f.nome.trim()) return 'Falta o nome do vinho.';
    if (!f.nv && f.ano) {
      const a = Number(f.ano);
      if (!Number.isInteger(a) || a < 1800 || a > ANO_ATUAL + 1) return 'O ano não parece certo.';
    }
    const alc = paraNumero(f.teorAlcool);
    if (f.teorAlcool && (alc === undefined || alc < 0 || alc > 99)) return 'O teor alcoólico não parece certo.';
    for (const [campo, nome] of [['precoCompra', 'preço de compra'], ['valorEstimado', 'valor estimado']] as const) {
      if (f[campo] && paraNumero(f[campo]) === undefined) return `O ${nome} não é um número.`;
    }
    return '';
  }

  async function submeter() {
    const e = validar();
    if (e) {
      setErro(e);
      if (!f.nome.trim() || e.includes('ano')) setPasso(0);
      return;
    }
    setAGuardar(true); setErro('');
    const dados: DadosVinho = {
      ...(inicial ?? { valorFontes: [], tags: [], favorito: false }),
      id: inicial?.id ?? crypto.randomUUID(),
      nome: f.nome.trim(),
      produtor: f.produtor.trim() || undefined,
      ano: f.nv || !f.ano ? undefined : Number(f.ano),
      tipo: f.tipo,
      pais: f.pais.trim() || 'Portugal',
      regiao: f.regiao.trim() || undefined,
      denominacao: f.denominacao.trim() || undefined,
      castas: f.castas.split(/[,;\n]/).map((c) => c.trim()).filter(Boolean),
      teorAlcool: paraNumero(f.teorAlcool),
      volumeMl: f.volumeMl,
      quantidade: f.quantidade,
      localizacao: f.localizacao.trim() || undefined,
      dataCompra: f.dataCompra || undefined,
      precoCompra: paraNumero(f.precoCompra),
      localCompra: f.localCompra.trim() || undefined,
      valorEstimado: paraNumero(f.valorEstimado),
      notas: f.notas.trim() || undefined,
    };
    delete (dados as Partial<Vinho>).criadoEm;
    delete (dados as Partial<Vinho>).atualizadoEm;
    try {
      await guardar(dados, foto, pre);
    } catch {
      setErro('Não consegui guardar. Confirma a ligação à internet e tenta outra vez.');
      setAGuardar(false);
    }
  }

  const ultimo = passo === PASSOS.length - 1;

  return (
    <div className="sobreposto formulario" role="dialog" aria-modal="true" aria-label={editar ? 'Editar vinho' : 'Novo vinho'}>
      <div className="barra-topo">
        <button className="botao-icone" onClick={passo > 0 && !editar ? () => setPasso(passo - 1) : fechar}
          aria-label={passo > 0 && !editar ? 'Passo anterior' : 'Fechar'}>
          <Icone nome={passo > 0 && !editar ? 'voltar' : 'fechar'} />
        </button>
        <div className="barra-titulo">{editar ? 'Editar vinho' : 'Novo vinho'}</div>
        <button className="ligacao forte" onClick={submeter} disabled={aGuardar || aPreparar || !f.nome.trim()}>
          Guardar
        </button>
      </div>

      <div className="passos" role="tablist">
        {PASSOS.map((p, i) => (
          <button key={p} role="tab" aria-selected={passo === i} className={`passo${passo === i ? ' ativo' : ''}${i < passo ? ' feito' : ''}`}
            onClick={() => setPasso(i)}>
            <span className="passo-barra" />
            {p}
          </button>
        ))}
      </div>

      <div className="formulario-corpo" ref={corpo}>
        {passo === 0 && (
          <>
            <input ref={ficheiro} type="file" accept="image/*" hidden onChange={escolherFoto} />
            <button type="button" className={`foto-escolher${pre ? ' com-foto' : ''}`} onClick={() => ficheiro.current?.click()}
              style={{ ['--cor-tipo' as string]: `var(--${f.tipo})` }}>
              {pre ? <img src={pre} alt="Foto do rótulo" /> : (
                <>
                  <GarrafaSilhueta tipo={f.tipo} altura={96} forma={formaGarrafa(f.tipo)} />
                  <span className="foto-escolher-texto"><Icone nome="camara" tamanho={18} /> Foto do rótulo</span>
                  <span className="opcao-texto">Tirar agora ou escolher da fototeca</span>
                </>
              )}
              {aPreparar && <span className="foto-a-preparar">A preparar…</span>}
            </button>
            {pre && (
              <div className="foto-acoes">
                <button type="button" className="ligacao" onClick={() => ficheiro.current?.click()}>Trocar foto</button>
                <button type="button" className="ligacao" onClick={() => { setFoto(null); setPre(undefined); }}>Remover</button>
              </div>
            )}

            <Campo rotulo={ehBebida(f.tipo) ? 'Nome da bebida *' : 'Nome do vinho *'}>
              <input value={f.nome} onChange={(e) => mudar('nome', e.target.value)} placeholder="ex.: Quinta do Vale Meão"
                autoCapitalize="words" enterKeyHint="next" />
            </Campo>
            <Campo rotulo="Produtor">
              <input value={f.produtor} onChange={(e) => mudar('produtor', e.target.value)} list="l-produtores" autoCapitalize="words" />
            </Campo>
            <div className="campo">
              <span>{ehBebida(f.tipo) ? 'Ano (se tiver)' : 'Ano da colheita'}</span>
              <div className="linha-campos">
                <input value={f.nv ? '' : f.ano} disabled={f.nv} inputMode="numeric" maxLength={4} placeholder={f.nv ? 'Sem ano' : String(ANO_ATUAL - 4)}
                  onChange={(e) => mudar('ano', e.target.value.replace(/\D/g, ''))} />
                <button type="button" className={`chip${f.nv ? ' ativo' : ''}`} onClick={() => mudar('nv', !f.nv)} aria-pressed={f.nv}>
                  NV · sem ano
                </button>
              </div>
            </div>
            <div className="campo">
              <span>Tipo</span>
              <div className="chips-grelha">
                {(['vinho', 'bebida'] as const).map((g) => (
                  <Fragment key={g}>
                    <span className="grupo-tipo">{g === 'vinho' ? 'Vinhos' : 'Outras bebidas'}</span>
                    {TIPOS.filter((t) => t.grupo === g).map((t) => (
                      <button key={t.id} type="button" className={`chip${f.tipo === t.id ? ' ativo' : ''}`} onClick={() => mudar('tipo', t.id)}
                        aria-pressed={f.tipo === t.id}>
                        <span className="ponto" style={{ background: `var(--${t.id})` }} />{t.nome}
                      </button>
                    ))}
                  </Fragment>
                ))}
              </div>
            </div>
          </>
        )}

        {passo === 1 && (
          <>
            <div className="linha-campos">
              <Campo rotulo="País"><input value={f.pais} onChange={(e) => mudar('pais', e.target.value)} autoCapitalize="words" /></Campo>
              <Campo rotulo="Região"><input value={f.regiao} onChange={(e) => mudar('regiao', e.target.value)} list="l-regioes" placeholder="ex.: Douro" autoCapitalize="words" /></Campo>
            </div>
            <Campo rotulo="Denominação">
              <input value={f.denominacao} onChange={(e) => mudar('denominacao', e.target.value)} placeholder="ex.: DOC Douro" />
            </Campo>
            {!ehBebida(f.tipo) && (
              <Campo rotulo="Castas" ajuda="Separadas por vírgulas">
                <input value={f.castas} onChange={(e) => mudar('castas', e.target.value)} placeholder="Touriga Nacional, Tinta Roriz" autoCapitalize="words" />
              </Campo>
            )}
            <Campo rotulo="Teor alcoólico (%)">
              <input value={f.teorAlcool} onChange={(e) => mudar('teorAlcool', e.target.value)} inputMode="decimal" placeholder="13,5" />
            </Campo>
            <div className="campo">
              <span>Garrafa</span>
              <div className="chips-grelha">
                {VOLUMES.map((ml) => (
                  <button key={ml} type="button" className={`chip${f.volumeMl === ml ? ' ativo' : ''}`} onClick={() => mudar('volumeMl', ml)}
                    aria-pressed={f.volumeMl === ml}>
                    {ml >= 1000 ? `${(ml / 1000).toLocaleString('pt-PT')} L` : `${ml} ml`}
                    {ml === 1500 && ' · Magnum'}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {passo === 2 && (
          <>
            <div className="campo">
              <span>Garrafas</span>
              <Contador valor={f.quantidade} mudar={(q) => mudar('quantidade', Math.max(0, q))} grande />
            </div>
            <Campo rotulo="Onde está guardado">
              <input value={f.localizacao} onChange={(e) => mudar('localizacao', e.target.value)} list="l-locais" placeholder="ex.: Adega · prateleira A" />
            </Campo>
            <div className="linha-campos">
              <Campo rotulo="Preço de compra (€)">
                <input value={f.precoCompra} onChange={(e) => mudar('precoCompra', e.target.value)} inputMode="decimal" placeholder="0,00" />
              </Campo>
              <Campo rotulo="Valor estimado (€)">
                <input value={f.valorEstimado} onChange={(e) => mudar('valorEstimado', e.target.value)} inputMode="decimal" placeholder="0,00" />
              </Campo>
            </div>
            <div className="linha-campos">
              <Campo rotulo="Data de compra">
                <input type="date" value={f.dataCompra} onChange={(e) => mudar('dataCompra', e.target.value)} max={new Date().toISOString().slice(0, 10)} />
              </Campo>
              <Campo rotulo="Onde comprei">
                <input value={f.localCompra} onChange={(e) => mudar('localCompra', e.target.value)} autoCapitalize="sentences" />
              </Campo>
            </div>
            <Campo rotulo="Notas">
              <textarea value={f.notas} onChange={(e) => mudar('notas', e.target.value)} rows={4} placeholder="Oferta, ocasião especial, impressões…" />
            </Campo>
          </>
        )}

        {erro && <p className="erro" role="alert">{erro}</p>}

        <datalist id="l-produtores">{sugestoes.produtores.map((s) => <option key={s} value={s} />)}</datalist>
        <datalist id="l-regioes">{sugestoes.regioes.map((s) => <option key={s} value={s} />)}</datalist>
        <datalist id="l-locais">{sugestoes.localizacoes.map((s) => <option key={s} value={s} />)}</datalist>
      </div>

      <div className="formulario-rodape">
        {ultimo ? (
          <button className="botao largo" onClick={submeter} disabled={aGuardar || aPreparar}>
            {aGuardar ? 'A guardar…' : editar ? 'Guardar alterações' : 'Guardar na garrafeira'}
          </button>
        ) : (
          <button className="botao largo" onClick={() => { if (passo === 0 && !f.nome.trim()) { setErro('Falta o nome do vinho.'); return; } setErro(''); setPasso(passo + 1); }}>
            Seguinte · {PASSOS[passo + 1]}
          </button>
        )}
      </div>
    </div>
  );
}

function Campo({ rotulo, ajuda, children }: { rotulo: string; ajuda?: string; children: React.ReactNode }) {
  return (
    <label className="campo">
      <span>{rotulo}{ajuda && <em> · {ajuda}</em>}</span>
      {children}
    </label>
  );
}
