import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type EstadoSessao =
  | { estado: 'a-carregar' }
  | { estado: 'sem-config' }
  | { estado: 'fora' }
  | { estado: 'dentro'; sessao: Session };

export function useSessao(): EstadoSessao {
  const [s, setS] = useState<EstadoSessao>(supabase ? { estado: 'a-carregar' } : { estado: 'sem-config' });

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) =>
      setS(data.session ? { estado: 'dentro', sessao: data.session } : { estado: 'fora' }),
    );
    const { data } = supabase.auth.onAuthStateChange((_e, sessao) =>
      setS(sessao ? { estado: 'dentro', sessao } : { estado: 'fora' }),
    );
    return () => data.subscription.unsubscribe();
  }, []);

  return s;
}
