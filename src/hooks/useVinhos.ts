import { useCallback, useEffect, useRef, useState } from 'react';
import type { Vinho } from '../types';
import { caminhoMini, repo, type DadosVinho } from '../lib/vinhos';

export type FotoNova = { grande: Blob; mini: Blob } | null | undefined; // undefined = sem alteração, null = remover

export function useVinhos(ativo: boolean) {
  const [vinhos, setVinhos] = useState<Vinho[]>([]);
  const [estado, setEstado] = useState<'a-carregar' | 'pronto' | 'erro'>('a-carregar');
  const [urls, setUrls] = useState<Record<string, string>>({});
  const pedidas = useRef(new Set<string>());

  const carregar = useCallback(async () => {
    try {
      setVinhos(await repo.listar());
      setEstado('pronto');
    } catch {
      setEstado('erro');
    }
  }, []);

  useEffect(() => { if (ativo) carregar(); }, [ativo, carregar]);

  // URLs das fotos (assinadas, porque o bucket é privado). Pede só as que faltam.
  useEffect(() => {
    const faltam = vinhos
      .filter((v) => v.fotoPath)
      .flatMap((v) => [caminhoMini(v.fotoPath!), v.fotoPath!])
      .filter((c) => !pedidas.current.has(c));
    if (!faltam.length) return;
    faltam.forEach((c) => pedidas.current.add(c));
    repo.urls(faltam).then((r) => setUrls((u) => ({ ...u, ...r }))).catch(() => {
      faltam.forEach((c) => pedidas.current.delete(c));
    });
  }, [vinhos]);

  const guardar = useCallback(async (dados: DadosVinho, foto: FotoNova, preVisualizacao?: string) => {
    const antigo = vinhos.find((v) => v.id === dados.id);
    let fotoPath = antigo?.fotoPath;
    if (foto) {
      fotoPath = await repo.enviarFoto(dados.id, foto.grande, foto.mini);
      if (preVisualizacao) {
        pedidas.current.add(fotoPath);
        setUrls((u) => ({ ...u, [fotoPath!]: preVisualizacao }));
      }
    } else if (foto === null) {
      fotoPath = undefined;
    }
    const salvo = await repo.guardar({ ...dados, fotoPath });
    if (antigo?.fotoPath && antigo.fotoPath !== fotoPath) repo.apagarFoto(antigo.fotoPath).catch(() => {});
    setVinhos((vs) => ordenar(antigo ? vs.map((v) => (v.id === salvo.id ? salvo : v)) : [...vs, salvo]));
    return salvo;
  }, [vinhos]);

  const mudarQuantidade = useCallback(async (id: string, q: number) => {
    const antes = vinhos.find((v) => v.id === id)?.quantidade;
    const nova = Math.max(0, q);
    setVinhos((vs) => vs.map((v) => (v.id === id ? { ...v, quantidade: nova } : v)));
    try {
      await repo.quantidade(id, nova);
    } catch (e) {
      setVinhos((vs) => vs.map((v) => (v.id === id ? { ...v, quantidade: antes ?? v.quantidade } : v)));
      throw e;
    }
  }, [vinhos]);

  const alternarFavorito = useCallback(async (id: string) => {
    const v = vinhos.find((x) => x.id === id);
    if (!v) return;
    const { criadoEm: _c, atualizadoEm: _a, ...dados } = v;
    setVinhos((vs) => vs.map((x) => (x.id === id ? { ...x, favorito: !x.favorito } : x)));
    try {
      await repo.guardar({ ...dados, favorito: !v.favorito });
    } catch (e) {
      setVinhos((vs) => vs.map((x) => (x.id === id ? { ...x, favorito: v.favorito } : x)));
      throw e;
    }
  }, [vinhos]);

  const apagar = useCallback(async (id: string) => {
    const v = vinhos.find((x) => x.id === id);
    await repo.apagar(id);
    if (v?.fotoPath) repo.apagarFoto(v.fotoPath).catch(() => {});
    setVinhos((vs) => vs.filter((x) => x.id !== id));
  }, [vinhos]);

  const importar = useCallback(async (lista: DadosVinho[]) => {
    await repo.guardarVarios(lista);
    await carregar();
  }, [carregar]);

  const apagarVarios = useCallback(async (ids: string[]) => {
    for (const id of ids) {
      const v = vinhos.find((x) => x.id === id);
      await repo.apagar(id);
      if (v?.fotoPath) repo.apagarFoto(v.fotoPath).catch(() => {});
    }
    setVinhos((vs) => vs.filter((x) => !ids.includes(x.id)));
  }, [vinhos]);

  return { vinhos, estado, urls, carregar, guardar, mudarQuantidade, alternarFavorito, apagar, importar, apagarVarios };
}

export type Inventario = ReturnType<typeof useVinhos>;

const ordenar = (vs: Vinho[]) => [...vs].sort((a, b) => a.nome.localeCompare(b.nome, 'pt'));
