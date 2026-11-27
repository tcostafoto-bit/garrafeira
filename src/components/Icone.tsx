type Nome =
  | 'garrafeira' | 'copo' | 'diario' | 'definicoes' | 'mais' | 'pesquisa'
  | 'claude' | 'lapis' | 'codigo' | 'sair' | 'email' | 'nuvem' | 'seta'
  | 'camara' | 'estrela' | 'estrela-cheia' | 'lixo' | 'menos' | 'fechar' | 'voltar'
  | 'descarregar' | 'carregar' | 'local' | 'ordenar' | 'exemplos' | 'certo' | 'copiar' | 'partilhar';

const caminhos: Record<Nome, React.ReactNode> = {
  garrafeira: (<><path d="M3 21V9l9-6 9 6v12" /><path d="M7 21v-6h10v6" /><path d="M7 18h10" /></>),
  copo: (<><path d="M7 3h10l-.6 5.5a4.4 4.4 0 0 1-8.8 0Z" /><path d="M12 13v8" /><path d="M8 21h8" /></>),
  diario: (<><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3Z" /><path d="M5 17a3 3 0 0 1 3-3h11" /><path d="M9 8h6" /></>),
  definicoes: (<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></>),
  mais: (<><path d="M12 5v14" /><path d="M5 12h14" /></>),
  pesquisa: (<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>),
  claude: (<><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" /></>),
  lapis: (<><path d="M4 20h4L19 9l-4-4L4 16Z" /><path d="m13.5 6.5 4 4" /></>),
  codigo: (<><path d="M4 6v12M7 6v12M11 6v12M14 6v12M18 6v12M20 6v12" /></>),
  sair: (<><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" /><path d="M10 17l-5-5 5-5" /><path d="M5 12h11" /></>),
  email: (<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>),
  nuvem: (<><path d="M7 18a4.5 4.5 0 0 1-.5-9 6 6 0 0 1 11.6 1.5A3.8 3.8 0 0 1 17.5 18Z" /></>),
  seta: (<><path d="m9 6 6 6-6 6" /></>),
  camara: (<><path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" /><circle cx="12" cy="13.5" r="3.5" /></>),
  estrela: (<><path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9Z" /></>),
  'estrela-cheia': (<><path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9Z" fill="currentColor" /></>),
  lixo: (<><path d="M4 7h16" /><path d="M10 11v6M14 11v6" /><path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" /><path d="M9 7V4h6v3" /></>),
  menos: (<><path d="M5 12h14" /></>),
  fechar: (<><path d="M6 6l12 12M18 6 6 18" /></>),
  voltar: (<><path d="m15 6-6 6 6 6" /></>),
  descarregar: (<><path d="M12 4v11" /><path d="m7 10 5 5 5-5" /><path d="M5 20h14" /></>),
  carregar: (<><path d="M12 15V4" /><path d="m7 9 5-5 5 5" /><path d="M5 20h14" /></>),
  local: (<><path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11Z" /><circle cx="12" cy="10" r="2.2" /></>),
  ordenar: (<><path d="M7 4v16M3.5 16.5 7 20l3.5-3.5" /><path d="M17 20V4M13.5 7.5 17 4l3.5 3.5" /></>),
  certo: (<><path d="m5 12.5 4.5 4.5L19 7.5" /></>),
  copiar: (<><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>),
  partilhar: (<><path d="M12 15V3" /><path d="m8 7 4-4 4 4" /><path d="M7 10H6a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1" /></>),
  exemplos: (<><path d="M8 3h8M9 3v5l-4 9a2.5 2.5 0 0 0 2.3 3.5h9.4A2.5 2.5 0 0 0 19 17l-4-9V3" /><path d="M7 14h10" /></>),
};

export function Icone({ nome, tamanho = 22 }: { nome: Nome; tamanho?: number }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {caminhos[nome]}
    </svg>
  );
}
