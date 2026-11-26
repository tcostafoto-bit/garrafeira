type Nome =
  | 'garrafeira' | 'copo' | 'diario' | 'definicoes' | 'mais' | 'pesquisa'
  | 'claude' | 'lapis' | 'codigo' | 'sair' | 'email' | 'nuvem' | 'seta';

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
};

export function Icone({ nome, tamanho = 22 }: { nome: Nome; tamanho?: number }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {caminhos[nome]}
    </svg>
  );
}
