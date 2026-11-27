/** "O que abro hoje?" (Fase 2): escolhe três vinhos da garrafeira para um prato, sem internet. */
import { TIPOS, type TipoVinho, type Vinho } from '../types';

const nomeTipo = (t: TipoVinho) => TIPOS.find((x) => x.id === t)?.nome ?? t;
import { guiaEfetivo } from './guia';
import { estadoJanela, noPico } from './janela';

export interface Categoria { id: string; nome: string; palavras: string[]; tipos: Partial<Record<TipoVinho, number>> }

export const CATEGORIAS: Categoria[] = [
  { id: 'vermelha', nome: 'Carne vermelha', palavras: ['carne', 'novilho', 'vaca', 'bife', 'posta', 'costeleta', 'entrecosto', 'picanha', 'grelhad', 'brasa'], tipos: { tinto: 5 } },
  { id: 'cabrito', nome: 'Cabrito ou borrego', palavras: ['cabrito', 'borrego', 'cordeiro', 'chanfana'], tipos: { tinto: 5 } },
  { id: 'porco', nome: 'Porco', palavras: ['porco', 'secretos', 'plumas', 'lombo', 'leitao', 'rojoes', 'alentejana'], tipos: { tinto: 4, espumante: 3, branco: 2, sidra: 3, cerveja: 2 } },
  { id: 'aves', nome: 'Aves', palavras: ['frango', 'pato', 'peru', 'aves', 'galinha'], tipos: { tinto: 3, branco: 3, rose: 2 } },
  { id: 'caca', nome: 'Caça', palavras: ['caca', 'javali', 'veado', 'perdiz', 'lebre', 'faisao'], tipos: { tinto: 5 } },
  { id: 'bacalhau', nome: 'Bacalhau', palavras: ['bacalhau'], tipos: { branco: 4, tinto: 3 } },
  { id: 'peixe', nome: 'Peixe', palavras: ['peixe', 'robalo', 'dourada', 'pescada', 'salmao', 'atum', 'polvo', 'sardinha'], tipos: { branco: 5, rose: 3, espumante: 3, sake: 3 } },
  { id: 'marisco', nome: 'Marisco', palavras: ['marisco', 'camarao', 'ameijoa', 'ostra', 'lagosta', 'sapateira', 'gamba'], tipos: { branco: 5, espumante: 4, rose: 2, sake: 3 } },
  { id: 'massa', nome: 'Massa ou pizza', palavras: ['massa', 'pizza', 'lasanha', 'risotto', 'arroz'], tipos: { tinto: 3, branco: 3, rose: 3 } },
  { id: 'picante', nome: 'Picante ou asiático', palavras: ['picante', 'caril', 'sushi', 'asiatic', 'tailandes', 'indiano', 'chines'], tipos: { branco: 4, rose: 4, espumante: 3, cerveja: 4, sake: 3 } },
  { id: 'aperitivo', nome: 'Aperitivo', palavras: ['aperitivo', 'petisco', 'entrada', 'fritos', 'charcutaria', 'presunto'], tipos: { espumante: 5, branco: 3, rose: 3, sidra: 3, cerveja: 3, sake: 2 } },
  { id: 'queijo', nome: 'Queijos', palavras: ['queijo', 'serra', 'azul', 'stilton', 'curado'], tipos: { porto: 5, tinto: 3, madeira: 3, whisky: 2 } },
  { id: 'sobremesa', nome: 'Sobremesa', palavras: ['sobremesa', 'doce', 'bolo', 'tarte', 'pudim', 'leite-creme', 'nata', 'amendoa'], tipos: { porto: 5, moscatel: 5, madeira: 4, sobremesa: 5, espumante: 1 } },
  { id: 'digestivo', nome: 'Digestivo', palavras: ['digestivo', 'cafe', 'charuto', 'depois do jantar', 'fim de refeicao'], tipos: { whisky: 5, destilado: 5, licor: 4, porto: 3, madeira: 2, sake: 1 } },
  { id: 'brinde', nome: 'Brinde ou festa', palavras: ['brinde', 'festa', 'aniversario', 'natal', 'celebrar', 'ano novo'], tipos: { espumante: 5, sidra: 3, sake: 2, branco: 1 } },
  { id: 'convivio', nome: 'Cerveja e convívio', palavras: ['cerveja', 'hamburguer', 'churrasco', 'francesinha', 'tremocos', 'futebol', 'amigos'], tipos: { cerveja: 5, sidra: 4, espumante: 1 } },
  { id: 'solo', nome: 'Provar a solo', palavras: ['solo', 'provar', 'sozinho', 'relaxar', 'lareira'], tipos: { whisky: 4, destilado: 3, porto: 3, madeira: 3, tinto: 2, licor: 2, sake: 2, outro: 2 } },
  { id: 'chocolate', nome: 'Chocolate', palavras: ['chocolate', 'cacau'], tipos: { porto: 5, madeira: 3, whisky: 3, licor: 3 } },
];

const s = (x?: string) => (x ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export interface Sugestao { vinho: Vinho; pontos: number; razoes: string[] }

export function sugerir(vinhos: Vinho[], categoria?: Categoria, texto = ''): Sugestao[] {
  const pedido = s(texto);
  const doTexto = pedido.split(/[^a-z0-9-]+/).filter((p) => p.length > 3);
  const palavras = [...(categoria?.palavras ?? []), ...doTexto];
  const cat = categoria ?? CATEGORIAS.find((c) => c.palavras.some((p) => pedido.includes(p)));

  return vinhos
    .filter((v) => v.quantidade > 0)
    .map((v): Sugestao & { ajusta: boolean } => {
      const { guia } = guiaEfetivo(v);
      const razoes: string[] = [];
      let pontos = cat?.tipos[v.tipo] ?? (cat ? -2 : 0);

      // Pratos do guia: conta quantas palavras do pedido aparecem no mesmo prato (o prato inteiro vale mais).
      let harm: { prato: string } | undefined;
      let melhor = 0;
      guia.harmonizacoes.forEach((h) => {
        const ws = s(h.prato).split(/[^a-z0-9-]+/);
        const bate = (p: string) => ws.some((w) => w.startsWith(p));
        const n = doTexto.filter(bate).length * 2.5 + (doTexto.length > 1 && doTexto.every(bate) ? 2 : 0)
          + (categoria?.palavras.some(bate) ? 3 : 0);
        if (n > melhor) { melhor = n; harm = h; }
      });
      if (harm) { pontos += melhor; razoes.push(`Combina com ${harm.prato.charAt(0).toLowerCase()}${harm.prato.slice(1)}`); }
      else if (cat && (cat.tipos[v.tipo] ?? 0) >= 2) razoes.push(`${nomeTipo(v.tipo)}: boa escolha para ${cat.nome.toLowerCase()}`);
      if (guia.evitar?.some((e) => palavras.some((p) => s(e).includes(p)))) pontos -= 5;

      const janela = estadoJanela(v);
      if (janela === 'no-ponto') { pontos += 2; if (noPico(v)) { pontos += 1; razoes.push('Está no melhor momento'); } else razoes.push('Pronto a beber'); }
      if (janela === 'a-passar') { pontos += 2; razoes.push('Convém beber em breve'); }
      if (janela === 'jovem') { pontos -= 3; razoes.push('Ainda jovem'); }
      if (v.quantidade > 2) pontos += 0.5; // há garrafas de sobra
      return { vinho: v, pontos, razoes, ajusta: !cat || (cat.tipos[v.tipo] ?? 0) > 0 || melhor > 0 };
    })
    .filter((x) => x.pontos > 0 && x.ajusta)
    .sort((a, b) => b.pontos - a.pontos || (a.vinho.valorEstimado ?? 0) - (b.vinho.valorEstimado ?? 0))
}
