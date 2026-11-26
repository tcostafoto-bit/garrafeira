import { BottomSheet } from '../components/BottomSheet';
import { Icone } from '../components/Icone';

export function Adicionar({ aberta, fechar, aMao, claude }: { aberta: boolean; fechar: () => void; aMao: () => void; claude: () => void }) {
  const opcoes = [
    { id: 'claude', icone: 'claude' as const, titulo: 'Importar do Claude', texto: 'Colar a ficha que o Claude fez a partir do rótulo', ativa: true, principal: true, acao: claude },
    { id: 'mao', icone: 'lapis' as const, titulo: 'À mão', texto: 'Foto do rótulo e os dados em três passos curtos', ativa: true, acao: aMao },
    { id: 'codigo', icone: 'codigo' as const, titulo: 'Código de barras', texto: 'Ler o código da garrafa com a câmara', fase: 'Em breve' },
  ];
  return (
    <BottomSheet aberta={aberta} fechar={fechar} titulo="Adicionar vinho">
      {opcoes.map((o) => (
        <button key={o.id} className={`opcao${'principal' in o && o.principal ? ' principal' : ''}`} disabled={!o.ativa} aria-disabled={!o.ativa}
          onClick={'acao' in o ? o.acao : undefined}>
          <span className="opcao-icone"><Icone nome={o.icone} /></span>
          <span>
            <span className="opcao-titulo" style={{ display: 'block' }}>{o.titulo}</span>
            <span className="opcao-texto">{o.texto}</span>
          </span>
          {o.fase ? <span className="etiqueta">{o.fase}</span> : <span style={{ marginLeft: 'auto', color: 'var(--texto-3)' }}><Icone nome="seta" tamanho={18} /></span>}
        </button>
      ))}
    </BottomSheet>
  );
}
