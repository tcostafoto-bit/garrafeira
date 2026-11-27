# Decisões tomadas sem perguntar

Regra do Tiago (26/11/2026): avançar sem pedir confirmação, escolher a opção recomendada e registá-la aqui.
Só parar para gastar dinheiro, apagar dados ou publicar algo irreversível.

## Fase 1 · Inventário
- **Plano:** o PLANO-COWORK.md está no PC do Tiago; segui o visual já feito na Fase 0 (cores, letras, componentes).
- **Base de dados:** sem migração nova. A `001_inicial.sql` já tem vinhos, consumos e o bucket privado `rotulos`.
- **Fotos:** comprimidas no telemóvel (1200 px, JPEG 82 %) mais miniatura de 320 px. Caminho `{user_id}/{vinho_id}/{data}.jpg` e `-mini.jpg`.
- **Valor estimado:** usa o preço de compra quando não há estimativa.
- **Última garrafa:** o vinho não desaparece, passa para o filtro «Acabados».
- **Backup:** JSON com todos os dados; as fotos ficam na nuvem e não vão no ficheiro. Importar substitui os vinhos com o mesmo id e mantém os outros.
- **Sem Supabase** (pré-visualização), os dados ficam no browser, para se poder testar sem conta.

## Fase 3 · Ponte com o Claude (feita antes da 2, a pedido)
- **Formato:** `GARRAFEIRA v1` + JSON `{ "acao": "criar" | "atualizar", "vinhos": [...] }`. A 1.ª linha e as crases são opcionais; aceita vários blocos colados de uma vez, ou o ficheiro de fichas inteiro.
- **Mesmo vinho:** reconhecido pelo `id` ou por nome + ano (sem acentos nem maiúsculas).
- **«Somar garrafas»** (por omissão em `criar`): mantém os dados atuais, soma as garrafas e só preenche campos vazios.
- **«Substituir dados»** (por omissão em `atualizar`): os dados do Claude ganham; ficam a foto, o favorito e as etiquetas se o bloco não os trouxer.
- Também se pode escolher «Novo» (criar outra ficha) ou desmarcar um vinho.
- **Copiar inventário:** copia uma instrução curta e um bloco `GARRAFEIRA v1` com `acao: "inventario"` e os ids. Se esse bloco for colado de volta, conta como `atualizar`.
- **Código de barras:** fica para depois. O Safari do iPhone não lê códigos de barras sem uma biblioteca extra.

## Fase 2 · Guia offline
- Quando o vinho não tem guia do Claude, a app calcula um **guia aproximado por regras** (tipo, região, ano, palavras do nome como Reserva, Vintage, LBV, Tawny) e diz isso na ficha.
- **Semáforo:** usa a janela do guia; vinhos sem janela (tawny, Madeira, NV) contam como prontos a beber.
- **«O que abro hoje?»:** 14 categorias de prato ou texto livre. Pontua pelo tipo, pelos pratos do guia (o prato inteiro vale mais), pelo momento (pico, pronto, a passar) e penaliza o que está em «evitar» ou ainda jovem. Em empate, sugere o mais barato.

## Fase 4 · Diário
- **«Abrir uma garrafa»** na ficha regista no Diário (data, nota de 0,5 a 5, prato, ocasião, comentário) e tira uma garrafa.
- O Diário mostra por mês, com resumo do ano e nota média; a ficha mostra as garrafas abertas desse vinho.
- Apagar um vinho apaga também as entradas no Diário (já era assim na base de dados); o aviso de apagar diz isso.

## Publicação
- Um só pull request com as fases 1 a 4, testado no tamanho do iPhone, e merge para a `main` (o Vercel publica sozinho). É reversível com um revert.

## Revisão de preços (27/11/2026)
- **Estimativa:** manda o preço de uma garrafa, da mesma colheita, numa loja portuguesa com IVA. Lojas estrangeiras ficam como fonte, na moeda delas (€, £, US$), com uma nota.
- **«In bond»** (sem IVA, direitos nem portes) é assinalado na nota; a estimativa já conta com o IVA (La Chapelle 2016: 74 € in bond, cerca de 91 € com IVA, estimativa 90 €).
- **Preços de caixa ou de conjunto** deixam de aparecer como preço de garrafa.
- **Fontes de outra colheita ou esgotadas** saem do valor ou ficam com nota.
- **Vale Meão 2018:** retirada a ligação da Gloria Wines; ficam Garrafeira Soares e Hedonism (esgotado, sem IVA). Estimativa 230 €.
- **Ramos Pinto Cota Seiscentos / Duzentos:** os 145 € eram de um conjunto de 3; a estimativa de 60 € é minha, sem fonte de garrafa solta.
- **Aplicar:** ficheiro `correcoes-precos-2026-11-27.md` (14 vinhos, `atualizar`). Valores a `null` limpam mínimos e máximos antigos.
