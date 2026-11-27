/**
 * Guia offline (Fase 2): quando o vinho não traz guia do Claude, a app calcula um aproximado
 * a partir do tipo, do ano, da região e do nome. Funciona sem internet.
 */
import type { GuiaVinho, Vinho } from '../types';

const s = (x?: string) => (x ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const tem = (texto: string, ...palavras: string[]) => palavras.some((p) => texto.includes(p));

export function guiaEfetivo(v: Vinho): { guia: GuiaVinho; origem: 'claude' | 'regras' } {
  return v.guia ? { guia: v.guia, origem: 'claude' } : { guia: guiaPorRegras(v), origem: 'regras' };
}

export function guiaPorRegras(v: Vinho): GuiaVinho {
  const nome = s(`${v.nome} ${v.denominacao ?? ''}`);
  const regiao = s(`${v.regiao ?? ''} ${v.pais}`);
  const castas = s(v.castas.join(' '));
  const ano = v.ano;
  const idade = ano ? new Date().getFullYear() - ano : undefined;
  const topo = tem(nome, 'reserva', 'grande', 'garrafeira', 'vinhas velhas', 'old vines', 'premium', 'special', 'superior', 'edicao', 'curriculum')
    || (v.valorEstimado ?? v.precoCompra ?? 0) >= 35;
  const j = (de: number, ate: number, picoDe?: number, picoAte?: number) => ano
    ? { janelaDe: ano + de, janelaAte: ano + ate, picoDe: picoDe !== undefined ? ano + picoDe : undefined, picoAte: picoAte !== undefined ? ano + picoAte : undefined }
    : {};

  switch (v.tipo) {
    case 'tinto': {
      const leve = tem(castas + nome, 'pinot', 'gamay', 'baga') || tem(regiao, 'vinho verde', 'borgonha', 'bourgogne');
      const encorpado = tem(regiao, 'douro', 'alentejo', 'bordeus', 'bordeaux', 'dao', 'rioja', 'ribera') || topo;
      const decantar: GuiaVinho['decantar'] = idade !== undefined && idade >= 15 ? 'sim' : encorpado && (idade ?? 99) <= 8 ? 'sim' : 'opcional';
      return {
        temperaturaMin: leve ? 14 : 16, temperaturaMax: leve ? 16 : 18,
        decantar,
        decantarMinutos: decantar === 'sim' ? (idade !== undefined && idade >= 15 ? 15 : topo ? 60 : 30) : undefined,
        decantarNota: idade !== undefined && idade >= 15
          ? 'Vinho com idade: decantar pouco tempo, sobretudo para separar o depósito.'
          : decantar === 'sim' ? 'Ainda jovem: o ar abre a fruta e suaviza os taninos.' : undefined,
        copo: leve ? 'Copo Borgonha' : 'Copo Bordéus',
        ...(topo ? j(3, 15, 6, 12) : leve ? j(1, 6, 2, 4) : j(1, 7, 2, 5)),
        harmonizacoes: leve
          ? [{ prato: 'Aves assadas' }, { prato: 'Bacalhau no forno' }, { prato: 'Cogumelos' }, { prato: 'Charcutaria' }]
          : [{ prato: 'Carne vermelha grelhada' }, { prato: 'Cabrito ou borrego assado' }, { prato: 'Caça' }, { prato: 'Queijo curado' }],
        evitar: ['Marisco', 'Sobremesas doces'],
        perfil: { corpo: leve ? 2 : encorpado ? 4 : 3, acidez: leve ? 4 : 3, taninos: leve ? 2 : encorpado ? 4 : 3, docura: 1 },
      };
    }
    case 'branco': {
      const madeira = topo || tem(nome, 'barrica', 'barrique', 'fermentado em', 'chardonnay');
      return {
        temperaturaMin: madeira ? 10 : 8, temperaturaMax: madeira ? 12 : 10,
        decantar: 'nao', copo: madeira ? 'Copo Borgonha (branco)' : 'Copo de branco',
        ...(madeira ? j(1, 8, 2, 5) : j(0, 4, 1, 2)),
        harmonizacoes: madeira
          ? [{ prato: 'Bacalhau com natas' }, { prato: 'Peixe no forno' }, { prato: 'Aves com molho cremoso' }, { prato: 'Queijo de pasta mole' }]
          : [{ prato: 'Marisco' }, { prato: 'Peixe grelhado' }, { prato: 'Saladas' }, { prato: 'Sushi' }],
        evitar: ['Carne vermelha', 'Pratos muito condimentados'],
        perfil: { corpo: madeira ? 4 : 2, acidez: 4, docura: 1 },
      };
    }
    case 'rose':
      return {
        temperaturaMin: 8, temperaturaMax: 10, decantar: 'nao', copo: 'Copo de branco',
        ...j(0, 2, 0, 1),
        harmonizacoes: [{ prato: 'Aperitivos' }, { prato: 'Saladas de verão' }, { prato: 'Comida asiática' }, { prato: 'Peixe grelhado' }],
        perfil: { corpo: 2, acidez: 4, docura: 1 },
      };
    case 'espumante':
      return {
        temperaturaMin: 6, temperaturaMax: 8, decantar: 'nao', copo: 'Copo tulipa',
        ...(ano ? j(1, topo ? 10 : 5) : {}),
        harmonizacoes: [{ prato: 'Aperitivos' }, { prato: 'Marisco' }, { prato: 'Leitão da Bairrada' }, { prato: 'Fritos' }],
        evitar: ['Sobremesas muito doces (se for bruto)'],
        perfil: { corpo: 2, acidez: 5, docura: tem(nome, 'meio seco', 'demi', 'doce') ? 3 : 1 },
      };
    case 'porto': {
      const vintage = tem(nome, 'vintage') && !tem(nome, 'late bottled', 'lbv');
      const lbv = tem(nome, 'lbv', 'late bottled');
      const tawny = tem(nome, 'tawny', 'anos', 'years', 'colheita', 'old');
      const branco = tem(nome, 'branco', 'white');
      if (branco) return {
        temperaturaMin: 6, temperaturaMax: 8, decantar: 'nao', copo: 'Copo de Porto',
        harmonizacoes: [{ prato: 'Aperitivo (Porto tónico)' }, { prato: 'Amêndoas e frutos secos' }],
        perfil: { corpo: 3, acidez: 3, docura: 4 },
      };
      if (vintage) return {
        temperaturaMin: 16, temperaturaMax: 18, decantar: 'sim', decantarMinutos: 60,
        decantarNota: 'Tem depósito: pôr a garrafa de pé na véspera e decantar com cuidado.',
        copo: 'Copo de Porto', ...j(10, 40, 15, 30),
        harmonizacoes: [{ prato: 'Queijo da Serra ou Stilton' }, { prato: 'Chocolate negro' }, { prato: 'Frutos secos' }],
        evitar: ['Sobremesas de fruta fresca'],
        perfil: { corpo: 5, acidez: 3, taninos: 4, docura: 4 },
      };
      if (lbv) return {
        temperaturaMin: 16, temperaturaMax: 18, decantar: tem(nome, 'unfiltered', 'nao filtrado') ? 'sim' : 'opcional', decantarMinutos: 20,
        copo: 'Copo de Porto', ...j(4, 15, 6, 12),
        harmonizacoes: [{ prato: 'Queijo curado' }, { prato: 'Chocolate negro' }, { prato: 'Bolo de frutos vermelhos' }],
        perfil: { corpo: 4, acidez: 3, taninos: 3, docura: 4 },
      };
      return {
        temperaturaMin: tawny ? 12 : 14, temperaturaMax: tawny ? 14 : 16, decantar: 'nao', copo: 'Copo de Porto',
        decantarNota: tawny ? 'Depois de aberto aguenta várias semanas.' : undefined,
        harmonizacoes: tawny
          ? [{ prato: 'Leite-creme ou pudim' }, { prato: 'Tarte de amêndoa' }, { prato: 'Queijo curado' }, { prato: 'Foie gras' }]
          : [{ prato: 'Chocolate' }, { prato: 'Queijo azul' }, { prato: 'Frutos vermelhos' }],
        perfil: { corpo: 3, acidez: 3, taninos: tawny ? 1 : 2, docura: 4 },
      };
    }
    case 'madeira':
      return {
        temperaturaMin: 12, temperaturaMax: 14, decantar: 'nao', copo: 'Copo pequeno de licoroso',
        decantarNota: 'Depois de aberto dura meses.',
        harmonizacoes: tem(nome, 'sercial', 'seco', 'dry')
          ? [{ prato: 'Aperitivo' }, { prato: 'Consommé' }, { prato: 'Frutos secos' }]
          : [{ prato: 'Bolo de mel' }, { prato: 'Pudim' }, { prato: 'Queijo curado' }],
        perfil: { corpo: 3, acidez: 5, docura: tem(nome, 'sercial', 'seco', 'dry') ? 2 : 4 },
      };
    case 'moscatel':
      return {
        temperaturaMin: 10, temperaturaMax: 12, decantar: 'nao', copo: 'Copo pequeno de licoroso',
        harmonizacoes: [{ prato: 'Sobremesas de laranja' }, { prato: 'Pastéis de nata' }, { prato: 'Queijo azul' }],
        perfil: { corpo: 3, acidez: 3, docura: 5 },
      };
    case 'sobremesa':
      return {
        temperaturaMin: 8, temperaturaMax: 10, decantar: 'nao', copo: 'Copo pequeno de licoroso',
        ...(ano ? j(2, 20) : {}),
        harmonizacoes: [{ prato: 'Foie gras' }, { prato: 'Queijo azul' }, { prato: 'Tarte de fruta' }],
        perfil: { corpo: 3, acidez: 4, docura: 5 },
      };
    case 'whisky':
      return {
        temperaturaMin: 16, temperaturaMax: 20, decantar: 'nao', copo: 'Copo Glencairn ou copita de prova',
        decantarNota: 'Não se decanta nem evolui na garrafa. Sem gelo; um pingo de água abre os aromas.',
        harmonizacoes: [{ prato: 'Chocolate negro' }, { prato: 'Frutos secos' }, { prato: 'Queijo azul curado' }],
        evitar: ['Gelo em excesso', 'Pratos picantes'],
        perfil: { corpo: 4, acidez: 2, docura: 2 },
      };
    case 'destilado':
      return {
        temperaturaMin: 12, temperaturaMax: 18, decantar: 'nao', copo: 'Copo de provar ou copo baixo',
        decantarNota: 'Aguardentes velhas, conhaque e rum escuro bebem-se sem gelo; gin e vodka podem ir bem frios.',
        harmonizacoes: [{ prato: 'Chocolate negro' }, { prato: 'Frutos secos' }, { prato: 'Queijo curado' }],
        perfil: { corpo: 4, acidez: 1, docura: 2 },
      };
    case 'licor':
      return {
        temperaturaMin: 8, temperaturaMax: 14, decantar: 'nao', copo: 'Cálice pequeno',
        decantarNota: 'Pode ir ao frio ou com gelo. Depois de aberto dura meses.',
        harmonizacoes: [{ prato: 'Sobremesas' }, { prato: 'Gelado de baunilha' }, { prato: 'Café' }],
        perfil: { corpo: 3, acidez: 1, docura: 5 },
      };
    case 'cerveja':
      return {
        temperaturaMin: 4, temperaturaMax: 8, decantar: 'nao', copo: 'Copo de cerveja',
        decantarNota: 'Servir fresca; as cervejas fortes e de abadia pedem 8 a 12 °C.',
        harmonizacoes: [{ prato: 'Petiscos' }, { prato: 'Hambúrguer' }, { prato: 'Marisco' }, { prato: 'Comida picante' }],
        perfil: { corpo: 2, acidez: 2, docura: 1 },
      };
    case 'sidra':
      return {
        temperaturaMin: 4, temperaturaMax: 8, decantar: 'nao', copo: 'Copo de sidra ou flute',
        harmonizacoes: [{ prato: 'Porco' }, { prato: 'Queijo' }, { prato: 'Tarte de maçã' }],
        perfil: { corpo: 2, acidez: 4, docura: 2 },
      };
    case 'sake':
      return {
        temperaturaMin: 8, temperaturaMax: 12, decantar: 'nao', copo: 'Copo pequeno de saquê',
        decantarNota: 'Os saquês finos (ginjo, daiginjo) servem-se frios; os de arroz mais encorpado podem ir mornos.',
        harmonizacoes: [{ prato: 'Sushi e sashimi' }, { prato: 'Tempura' }, { prato: 'Peixe grelhado' }],
        perfil: { corpo: 2, acidez: 2, docura: 2 },
      };
    default:
      return {
        temperaturaMin: 12, temperaturaMax: 16, decantar: 'opcional', copo: 'Copo universal',
        harmonizacoes: [],
      };
  }
}
