import { Icone } from '../components/Icone';

export function EmBreve({ sobretitulo, titulo, texto, icone }:
  { sobretitulo: string; titulo: string; texto: string; icone: Parameters<typeof Icone>[0]['nome'] }) {
  return (
    <main className="ecra">
      <header className="cabecalho">
        <div>
          <div className="sobretitulo">{sobretitulo}</div>
          <h1 className="titulo">{titulo}</h1>
        </div>
      </header>
      <section className="em-breve">
        <div className="em-breve-icone"><Icone nome={icone} tamanho={30} /></div>
        <h2 style={{ fontSize: 22 }}>Em breve</h2>
        <p>{texto}</p>
      </section>
    </main>
  );
}
