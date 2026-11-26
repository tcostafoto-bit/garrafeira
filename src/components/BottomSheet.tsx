import { useEffect, type ReactNode } from 'react';

export function BottomSheet({ aberta, fechar, titulo, children }:
  { aberta: boolean; fechar: () => void; titulo?: string; children: ReactNode }) {
  useEffect(() => {
    if (!aberta) return;
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && fechar();
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [aberta, fechar]);

  if (!aberta) return null;
  return (
    <>
      <div className="veu" onClick={fechar} />
      <div className="folha" role="dialog" aria-modal="true" aria-label={titulo}>
        <div className="folha-pega" />
        {titulo && <h2>{titulo}</h2>}
        {children}
      </div>
    </>
  );
}
