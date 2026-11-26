/**
 * Comprime a foto do rótulo no próprio iPhone antes de a enviar:
 * uma versão grande (lado maior até 1200 px) e uma miniatura (até 320 px) para a lista.
 */
export async function prepararFoto(ficheiro: File): Promise<{ grande: Blob; mini: Blob; preVisualizacao: string }> {
  const img = await carregar(ficheiro);
  const grande = await redimensionar(img, 1200, 0.82);
  const mini = await redimensionar(img, 320, 0.75);
  return { grande, mini, preVisualizacao: URL.createObjectURL(grande) };
}

function carregar(f: File): Promise<HTMLImageElement> {
  return new Promise((ok, falha) => {
    const url = URL.createObjectURL(f);
    const img = new Image();
    // O Safari já aplica a orientação EXIF ao desenhar no canvas.
    img.onload = () => { ok(img); URL.revokeObjectURL(url); };
    img.onerror = () => { URL.revokeObjectURL(url); falha(new Error('Não consegui ler a imagem.')); };
    img.src = url;
  });
}

function redimensionar(img: HTMLImageElement, max: number, qualidade: number): Promise<Blob> {
  const escala = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * escala);
  const h = Math.round(img.naturalHeight * escala);
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, w, h);
  return new Promise((ok, falha) =>
    c.toBlob((b) => (b ? ok(b) : falha(new Error('Falhou a compressão.'))), 'image/jpeg', qualidade));
}
