/**
 * Fotos de garrafa de lojas e produtores (Fase 5). Só os endereços ficam guardados: a app mostra a imagem
 * a partir do site de origem, não a copia. A foto do próprio Tiago tem sempre prioridade.
 * Se um endereço deixar de funcionar, a ficha volta ao desenho da garrafa com o rótulo.
 */
import { chaveVinho } from './ponte';
import { caminhoMini } from './vinhos';
import type { Vinho } from '../types';

const LISTA: [string, number | undefined, string][] = [
  ["Quinta do Vale Meão", 2018, "https://www.garrafeirasoares.pt/temp/JPG_e4735985168a821e708abdf5fed7ec80.png"],
  ["CV Curriculum Vitae", 2019, "https://media.radar.wine/media/wines/ee570dc3-2e3c-48fe-b8a6-8171b28082a8.jpg"],
  ["CV Curriculum Vitae Branco", 2019, "https://media.radar.wine/media/wines/e923197d-99e0-41dc-a581-75d0217f895f.png"],
  ["Poças Reserva", 2018, "https://media.radar.wine/media/wines/00aef554-99ad-43a5-a32b-ed1cdee51cfb.jpg"],
  ["Herdade Aldeia de Cima Reserva", 2022, "https://media.radar.wine/media/wines/8099dec9-bb1d-4e4c-9cb8-1cf984433f34.jpg"],
  ["Herdade Aldeia de Cima Reserva", 2024, "https://media.radar.wine/media/wines/8099dec9-bb1d-4e4c-9cb8-1cf984433f34.jpg"],
  ["Bowmore 30 Anos Sea Dragon", undefined, "https://media.whisky.auction/600/106117_0.jpg?id=230985"],
  ["Palato do Côa", 2022, "https://winehouseportugal.com/14316-large_default/palato-do-coa-2019-red-wine.jpg"],
  ["Quinta do Noval Touriga Nacional", 2020, "https://www.garrafeiranacional.com/media/catalog/product/cache/fb03a175f41adaae5cd7bd727048b47c/6/0/6063588-0.jpg"],
  ["Quinta do Noval Reserva", 2020, "https://winehouseportugal.com/14810-large_default/quinta-do-noval-reserva-2017-red-wine-in-the-90s-one-hundred-hectares-of-quinta-do-noval-were-replanted-adapting-the-pruning-met.jpg"],
  ["Quinta do Noval Reserva", 2019, "https://winehouseportugal.com/14810-large_default/quinta-do-noval-reserva-2017-red-wine-in-the-90s-one-hundred-hectares-of-quinta-do-noval-were-replanted-adapting-the-pruning-met.jpg"],
  ["Cedro do Noval", 2021, "https://www.garrafeiranacional.com/media/catalog/product/cache/fb03a175f41adaae5cd7bd727048b47c/6/0/6063957-0.jpg"],
  ["Alcunha", 2020, "https://www.vinhosdoalentejo.pt/media/produtores/miguel-louro-wines/Alcunha_Tinto_2018.jpg"],
  ["Quinta do Mouro", 2019, "https://winehouseportugal.com/14538-large_default/quinta-do-mouro-2019-tinto.jpg"],
  ["Palácio da Bacalhôa", 2016, "https://fernandoswinehouse.pt/media/catalog/product/cache/e354c77637f8feaf54df1cc2cc8d57ce/4/8/48.10029-01-palacio-da-bacalhoa-tinto-2016.png"],
  ["Diálogo", 2021, "https://winehouseportugal.com/14000-large_default/dialogo-2019-red-wine.jpg"],
  ["Comboio do Vesuvio Unoaked", 2019, "https://portugalgetwine.com/3349-large_default/comboio-do-vesuvio-red-wine.jpg"],
  ["Grainha Reserva", 2023, "https://www.garrafeirasoares.pt/temp/JPG_fde170c70c90ebe7087faf425f59e906.png"],
  ["Copo Alegre Vinhas Velhas", 2020, "https://winehouseportugal.com/18408-large_default/copo-alegre-vinhas-velhas-2020-white-wine.jpg"],
  ["Adega Mayor Seleção", 2018, "https://media.radar.wine/media/wines/a7db6a85-01f4-42d7-9ba6-96393adbcdab.jpg"],
  ["Mionetto Prosecco Prestige Collection Brut", undefined, "https://usa.mionetto.com/uploads/4/product/prestige-prosecco-brut-750ml-2018.png"],
  ["Freixenet Gran Cuvée", undefined, "https://garrafeiradailha.com/cdn/shop/files/freixenet-gran-cuvee_f74e9590-1ffe-4519-8ba0-31ef1e4cd696.jpg?v=1788390240"],
  ["Mateus Sparkling Rosé Baga & Shiraz Brut", undefined, "https://portugalgetwine.com/1539-large_default/mateus-rose-brut-sparkling-wine.jpg"],
  ["Niepoort Vintage", 2022, "https://fernandoswinehouse.pt/media/catalog/product/cache/5970251792703050f1e38d1c1c28a474/5/8/58.07843-01-porto-niepoort-vintage-2022.png"],
  ["Niepoort Vintage", 2015, "https://www.idealwine.com/media/b2/82/d721dd30f6aaa4cc08fd117c9ab2.jpg"],
  ["Niepoort The Senior Tawny", undefined, "https://fernandoswinehouse.pt/media/catalog/product/cache/5970251792703050f1e38d1c1c28a474/5/8/58.02487-01-porto-niepoort-the-senior-tawny.png"],
  ["Ferreira Vintage", 2016, "https://fernandoswinehouse.pt/media/catalog/product/cache/5970251792703050f1e38d1c1c28a474/5/8/58.01455-01-porto-ferreira-vintage-2016.png"],
  ["Vasques de Carvalho Vintage", 2013, "https://prestigewinesportugal.com/12811-large_default/vasques-de-carvalho-vintage-2013-port-wine-the-history-of-the-family-vasques-de-carvalho-has-roots-as-strong-as-a-vine-and-is-co.jpg"],
  ["Dow's Fine Tawny", undefined, "https://winehouseportugal.com/6587-large_default/dows-fine-tawny-port-wine-the-story-of-dows-is-unusual-amongst-all-the-great-port-houses-it-began-in-1798-when-bruno-da-silva-a-.jpg"],
  ["Graham's 10 Years Old Tawny", undefined, "https://assets.wine.com/winecom/image/upload/5972fbs.jpg"],
  ["Graham's 10 Anos Tawny", undefined, "https://assets.wine.com/winecom/image/upload/5972fbs.jpg"],
  ["Poças 10 Anos Tawny", undefined, "https://winehouseportugal.com/11465-large_default/pocas-10-years-old-port-wine-it-all-began-in-1918-when-on-15-august-a-few-months-before-the-armistice-manoel-domingues-pocas-jun.jpg"],
  ["Caves Santa Marta Tawny", undefined, "https://media.radar.wine/media/wines/9708e2ae-2506-44b5-bf9b-9ba1f8aeab5b.jpg"],
  ["La Chapelle de La Mission Haut-Brion", 2016, "https://www.mission-haut-brion.com/wp-content/uploads/sites/4/2022/04/LCR-Bouteille-sans-mill%C3%A9sime-min-377x1024.png"],
  ["Quinta da Extrema Edição I", undefined, "https://winehouseportugal.com/14399-large_default/quinta-da-extrema-edicao-i-2016-vinho-branco.jpg"],
  ["Herdade do Sobroso Reserva Barrique Select", 2018, "https://portugalgetwine.com/3092-large_default/herdade-do-sobroso-reserva-barrique-select-white-wine.jpg"],
  ["Cedro do Noval Branco", 2022, "https://www.quintadonoval.com/image/millesime/178/cedro-do-noval-blanc-bouteille-site.png"],
  ["Niepoort LBV Unfiltered", 2018, "https://assets.wine.com/winecom/image/upload/si4ciw4re0stigpscjm3.jpg"],
  ["Blackett 10 Anos Tawny", undefined, "https://fernandoswinehouse.pt/media/catalog/product/cache/5970251792703050f1e38d1c1c28a474/5/8/58.02478-01-porto-blackett-10-anos.png"],
  ["DoDa", 2007, "https://media.radar.wine/media/wines/4108b0f1-5303-4456-aa8f-b464324479b6.jpg"],
];

const IMAGENS = new Map(LISTA.map(([nome, ano, url]) => [chaveVinho(nome, ano), url]));

/** O endereço guardado na própria ficha (fotoUrl) ganha à lista de reserva acima. */
export const imagemExterna = (v: Pick<Vinho, 'nome' | 'ano'> & { fotoUrl?: string }) => v.fotoUrl || IMAGENS.get(chaveVinho(v.nome, v.ano));

/** Foto a mostrar: a do Tiago (privada) ou, na falta dela, a da loja. */
export function fotoProps(v: Vinho, urls: Record<string, string>, mini: boolean): { url?: string; externa?: boolean } {
  if (v.fotoPath) {
    const url = mini ? urls[caminhoMini(v.fotoPath)] : urls[v.fotoPath] ?? urls[caminhoMini(v.fotoPath)];
    if (url) return { url };
  }
  const externa = imagemExterna(v);
  return externa ? { url: externa, externa: true } : {};
}
