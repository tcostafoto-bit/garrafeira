import { BottomSheet } from '../components/BottomSheet';
import { Icone } from '../components/Icone';

export function Adicionar({ aberta, fechar }: { aberta: boolean; fechar: () => void }) {
  const opcoes = [
    { id: 'claude', icone: 'claude' as const, titulo: 'Importar do Claude', texto: 'Colar a ficha que o Claude fez a partir do rótulo', fase: 'Fase 3', principal: true },
    { id: 'mao', icone: 'lapis' as const, titulo: 'À mão', texto: 'Preencher os dados em passos curtos', fase: 'Fase 1' },
    { id: 'codigo', icone: 'codigo' as const, titulo: 'Código de barras', texto: 'Ler o código da garrafa com a câmara', fase: 'Fase 3' },
  ];
  return (
    <BottomSheet aberta={aberta} fechar={fechar} titulo="Adicionar vinho">
      {opcoes.map((o) => (
        <button key={o.id} className={`opcao${o.principal ? ' principal' : ''}`} disabled aria-disabled="true">
          <span className="opcao-icone"><Icone nome={o.icone} /></span>
          <span>
            <span className="opcao-titulo" style={{ display: 'block' }}>{o.titulo}</span>
            <span className="opcao-texto">{o.texto}</span>
          </span>
          <span className="etiqueta">{o.fase}</span>
        </button>
      ))}
    </BottomSheet>
  );
}
