import { useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { GarrafaSilhueta } from '../components/GarrafaSilhueta';

export function Entrar() {
  const [passo, setPasso] = useState<'email' | 'codigo'>('email');
  const [email, setEmail] = useState('');
  const [digitos, setDigitos] = useState<string[]>(Array(6).fill(''));
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const caixas = useRef<(HTMLInputElement | null)[]>([]);

  async function pedirCodigo(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setErro(''); setOcupado(true);
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } });
    setOcupado(false);
    if (error) return setErro(traduzir(error.message));
    setPasso('codigo');
    setTimeout(() => caixas.current[0]?.focus(), 50);
  }

  async function verificar(codigo: string) {
    if (!supabase) return;
    setErro(''); setOcupado(true);
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: codigo, type: 'email' });
    setOcupado(false);
    if (error) {
      setErro('Código inválido ou expirado.');
      setDigitos(Array(6).fill(''));
      caixas.current[0]?.focus();
    }
  }

  function escrever(i: number, valor: string) {
    const so = valor.replace(/\D/g, '');
    const novos = [...digitos];
    if (so.length > 1) {
      // colou o código inteiro
      so.slice(0, 6).split('').forEach((d, k) => { if (i + k < 6) novos[i + k] = d; });
    } else {
      novos[i] = so;
    }
    setDigitos(novos);
    const proximo = novos.findIndex((d) => !d);
    if (proximo === -1) verificar(novos.join(''));
    else if (so) caixas.current[Math.min(proximo, 5)]?.focus();
  }

  return (
    <main className="entrar">
      <div className="entrar-marca">
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
          <GarrafaSilhueta tipo="branco" altura={84} forma="borgonha" />
          <GarrafaSilhueta tipo="tinto" altura={112} />
          <GarrafaSilhueta tipo="porto" altura={96} />
        </div>
        <div className="sobretitulo">Privada</div>
        <h1>Garrafeira</h1>
        <p>Os vinhos que tenho em casa.</p>
      </div>

      {passo === 'email' ? (
        <form onSubmit={pedirCodigo}>
          <label className="campo">
            <span>Email</span>
            <input type="email" inputMode="email" autoComplete="email" required
              value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@exemplo.pt" />
          </label>
          {erro && <p className="erro">{erro}</p>}
          <button className="botao largo" disabled={ocupado || !email}>
            {ocupado ? 'A enviar…' : 'Receber código'}
          </button>
        </form>
      ) : (
        <div>
          <p className="ajuda" style={{ marginTop: 0, marginBottom: 16 }}>
            Enviei um código de 6 dígitos para <strong style={{ color: 'var(--texto)' }}>{email}</strong>.
          </p>
          <div className="codigo">
            {digitos.map((d, i) => (
              <input key={i} ref={(el) => { caixas.current[i] = el; }}
                value={d} inputMode="numeric" autoComplete={i === 0 ? 'one-time-code' : 'off'}
                aria-label={`Dígito ${i + 1}`} maxLength={i === 0 ? 6 : 1}
                onChange={(e) => escrever(i, e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Backspace' && !d && i > 0) caixas.current[i - 1]?.focus(); }} />
            ))}
          </div>
          {erro && <p className="erro">{erro}</p>}
          {ocupado && <p className="ajuda">A verificar…</p>}
          <p className="ajuda">
            Não chegou? <button className="ligacao" onClick={() => { setPasso('email'); setDigitos(Array(6).fill('')); }}>Mudar email ou reenviar</button>
          </p>
        </div>
      )}
    </main>
  );
}

function traduzir(m: string) {
  if (/rate limit|too many/i.test(m)) return 'Demasiados pedidos. Espera um minuto e tenta outra vez.';
  if (/signups not allowed/i.test(m)) return 'Este email não tem acesso à garrafeira.';
  return 'Não consegui enviar o código. Confirma o email e a ligação à internet.';
}
