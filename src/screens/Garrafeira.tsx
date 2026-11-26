import { GarrafaSilhueta } from '../components/GarrafaSilhueta';
import { Icone } from '../components/Icone';
import { formatarEuro } from '../lib/formatos';

const filtros = ['Todos', 'Tinto', 'Branco', 'Porto', 'Pronto a beber', 'Favoritos'];

export function Garrafeira({ adicionar }: { adicionar: () => void }) {
  // Fase 0: ainda sem dados. O inventário real chega na Fase 1.
  const garrafas = 0, referencias = 0, valor = 0, prontos = 0;

  return (
    <main className="ecra">
      <header className="cabecalho">
        <div>
          <div className="sobretitulo">A minha</div>
          <h1 className="titulo">Garrafeira</h1>
        </div>
      </header>

      <section className="cartao resumo" aria-label="Resumo">
        <div className="resumo-grelha">
          <div><div className="resumo-valor num">{garrafas}</div><div className="resumo-rotulo">garrafas</div></div>
          <div><div className="resumo-valor num">{referencias}</div><div className="resumo-rotulo">referências</div></div>
          <div><div className="resumo-valor num dourado">{formatarEuro(valor, true)}</div><div className="resumo-rotulo">valor estimado</div></div>
        </div>
        <div className="resumo-linha">
          <span className="ponto" style={{ background: 'var(--no-ponto)' }} />
          {prontos} prontos a beber
        </div>
      </section>

      <label className="pesquisa">
        <Icone nome="pesquisa" tamanho={20} />
        <span className="sr-only">Pesquisar</span>
        <input type="search" placeholder="Nome, produtor, região, casta" disabled />
      </label>

      <div className="chips" role="list">
        {filtros.map((f, i) => (
          <span key={f} role="listitem" className={`chip${i === 0 ? ' ativo' : ''}`}>{f}</span>
        ))}
      </div>

      <section className="vazio">
        <div className="vazio-garrafas">
          <GarrafaSilhueta tipo="espumante" altura={92} forma="flute" />
          <GarrafaSilhueta tipo="branco" altura={104} forma="borgonha" />
          <GarrafaSilhueta tipo="tinto" altura={118} />
          <GarrafaSilhueta tipo="rose" altura={100} forma="borgonha" />
          <GarrafaSilhueta tipo="porto" altura={96} />
        </div>
        <h2>A garrafeira está vazia</h2>
        <p>Tira uma foto ao rótulo, manda-a ao Claude e cola aqui a ficha que ele te devolver.</p>
        <button className="botao" onClick={adicionar}>
          <Icone nome="mais" tamanho={20} /> Adicionar vinho
        </button>
      </section>
    </main>
  );
}
