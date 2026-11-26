import { Icone } from './Icone';

export type Separador = 'garrafeira' | 'abrir' | 'diario' | 'definicoes';

const itens: { id: Separador; nome: string; icone: Parameters<typeof Icone>[0]['nome'] }[] = [
  { id: 'garrafeira', nome: 'Garrafeira', icone: 'garrafeira' },
  { id: 'abrir', nome: 'Abrir hoje', icone: 'copo' },
  { id: 'diario', nome: 'Diário', icone: 'diario' },
  { id: 'definicoes', nome: 'Definições', icone: 'definicoes' },
];

export function BottomNav({ atual, mudar, adicionar }:
  { atual: Separador; mudar: (s: Separador) => void; adicionar: () => void }) {
  const botao = (i: (typeof itens)[number]) => (
    <button key={i.id} className={`nav-item${atual === i.id ? ' ativo' : ''}`}
      onClick={() => mudar(i.id)} aria-current={atual === i.id ? 'page' : undefined}>
      <Icone nome={i.icone} />
      {i.nome}
    </button>
  );
  return (
    <nav className="nav" aria-label="Navegação principal">
      <div className="nav-interior">
        {itens.slice(0, 2).map(botao)}
        <button className="nav-mais" onClick={adicionar} aria-label="Adicionar vinho">
          <Icone nome="mais" tamanho={26} />
        </button>
        {itens.slice(2).map(botao)}
      </div>
    </nav>
  );
}
