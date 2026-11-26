import { useCallback, useEffect, useState } from 'react';

/** Mensagem curta que aparece por cima da barra de baixo e desaparece sozinha. */
export function useAviso() {
  const [msg, setMsg] = useState<{ texto: string; erro?: boolean; n: number } | null>(null);
  const avisar = useCallback((texto: string, erro = false) => setMsg({ texto, erro, n: Date.now() }), []);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), msg.erro ? 4500 : 2400);
    return () => clearTimeout(t);
  }, [msg]);
  const elemento = msg ? (
    <div key={msg.n} className={`toast${msg.erro ? ' erro' : ''}`} role="status">{msg.texto}</div>
  ) : null;
  return { avisar, elemento };
}
