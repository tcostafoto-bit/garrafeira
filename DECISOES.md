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

## Ordem, alertas e rótulos (27/11/2026)
- **A minha ordem:** nova opção de ordenação com «Arrumar» (setas ↑↓ por vinho). A ordem e a ordenação escolhida ficam guardadas **neste telemóvel** (não vão para a base de dados), porque guardar na nuvem pedia uma migração SQL nova e arriscava partir a app se faltasse a coluna. Vinhos novos entram no fim.
- **Alertas:** cartão «a pedir atenção» no topo da Garrafeira, filtro «A pedir atenção» e aviso em cada linha. «Passou da janela» quando o ano é depois do fim da janela; «breve» no último ano da janela e no anterior. Só vinhos com janela e com garrafas.
- **Rótulos:** a garrafa sem foto traz o rótulo desenhado com produtor, nome e ano. Se houver foto, mostra-se a foto.

## Fotos reais das garrafas (27/11/2026)
- **Origem:** fotos de garrafa das páginas de lojas e produtores já usadas nas fontes de preço (Garrafeira Soares, Garrafeira Nacional, Wine House Portugal, Fernando's Wine House, Vinhos do Alentejo, etc.). Cobre 28 dos 41 vinhos.
- **Direitos:** são imagens de terceiros. Por isso só guardo o **endereço**, a app mostra-as a partir do site de origem e não as copia nem as põe no repositório. Uso pessoal, numa app privada. Se um site as bloquear ou apagar, a ficha volta ao desenho da garrafa com o rótulo.
- **Prioridade:** a foto do Tiago ganha sempre. Sem foto dele, usa a da loja. Nada é escrito na base de dados (sem migração, sem passo para o Tiago).
- **Sem foto da loja** (ficam com o desenho): La Chapelle (a página é de caixa), Ramos Pinto (só imagem de conjunto), Extrema, Foral de Meda, Encostas do Côa, Marquês de Borba, Sobroso, Cedro Branco, Niepoort LBV, Vasques LBV, DoDa (a foto era de outra colheita e ilustrativa), Blackett, Lourentim (a página era do branco), Porto DHL.
- **Aproximações:** Alcunha usa a foto da colheita 2018; Noval Reserva 2019 usa a foto da Reserva de outra colheita; Quinta do Mouro, Diálogo e Mionetto também podem ser de outra colheita.
- **Não verificado:** não consegui ver as imagens nem testar os endereços a partir do ambiente de trabalho (proxy). Os endereços vêm do HTML das páginas. Os da Garrafeira Soares (pasta «temp») podem deixar de funcionar.

## Fotos em falta (27/11/2026, 2.ª ronda)
- **Juntei 7 fotos:** La Chapelle (site do château, garrafa sem colheita), Extrema Edição I, Sobroso Reserva, Cedro Branco, Niepoort LBV, Blackett 10 e DoDa (a foto é do DoDa tinto, outra colheita). Já são 35 dos 41.
- **Ramos Pinto Cota Seiscentos e Duzentos:** só existe imagem do conjunto de 3 garrafas, e não consegui descarregá-la para recortar (o ambiente bloqueia o site). Não pus a do Duas Quintas Reserva, porque é outro vinho. Ficam com o rótulo desenhado.
- **Continuam sem foto:** Foral de Meda, Marquês de Borba Colheita, Encostas do Côa Branco, Vasques LBV, Lourentim e o Porto da DHL (não encontrei imagem do mesmo vinho).

## Número da versão (27/11/2026)
- O «versão 0.5» das Definições estava escrito à mão e ficou parado. Passa a **0.6** e mostra também a data e o código da versão publicada (o do Vercel), para o Tiago confirmar que tem a última. O número sobe à mão em `vite.config.ts` quando há novidades; a data e o código mudam sozinhos em cada publicação.

## Enquadramento das fotos (27/11/2026)
- Fotos de loja ficam num cartão **branco** que enche o espaço, com `mix-blend-mode: multiply`, para o fundo branco da foto se fundir com o cartão (sem caixa branca dentro de caixa creme). Fotos largas (1200×630) ampliam-se a toda a altura e cortam as laterais, para a garrafa aparecer grande; fotos altas mostram-se inteiras. Vale para a ficha, a lista, «Abrir hoje» e o Diário. Versão 0.7.

## Enquadramento das fotos, correção (27/11/2026, v0.8)
- A v0.7 ampliava fotos quase quadradas (Alcunha) e cortava a garrafa. Agora a foto **cabe sempre inteira** (contain, com margem de 10 px em cima e em baixo na ficha). Só fotos bem largas (largura maior que 1,5× a altura, como as de 1200×630) enchem a altura do cartão e perdem as laterais, que são só fundo branco; nunca se corta em cima nem em baixo.
- Verificado por captura e medição de píxeis com cinco formas de imagem (quadrada, larga 1200×630, alta e estreita, quase quadrada, 4:5): a garrafa aparece inteira em todas. Foram imagens simuladas com as mesmas proporções, porque o ambiente de trabalho não consegue descarregar as fotos reais das lojas.

## Partilhar com amigos, só para ver (27/11/2026, v0.9)
- **Ligação secreta e revogável:** `…/#/v/<código>`, com 64 caracteres aleatórios (impossível de adivinhar). Há uma ligação por vinho (botão de partilhar na ficha) e uma para a garrafeira toda (Definições → Amigos). Quem a abre não precisa de conta. A página tem `noindex`.
- **O que se vê:** nome, produtor, ano, tipo, país, região, castas, álcool, volume, janela de consumo e dicas de servir. A foto é a de loja ou o rótulo desenhado. **Preços desligados por defeito**; há um interruptor «Mostrar o valor estimado».
- **O que nunca sai:** preço de compra, local, notas, as tuas fotos, favoritos, etiquetas, quantidades, Diário e fontes de preço. Na garrafeira inteira só entram vinhos com garrafas em stock.
- **Segurança:** os amigos nunca leem as tabelas; só chamam a função `ver_partilha(código)`, que devolve uma lista fixa de campos. Só o dono cria, altera e apaga ligações (RLS). «Parar de partilhar» apaga a ligação e deixa logo de funcionar; «Criar ligação nova» troca o código. Testei o SQL numa base Postgres local, incluindo as regras de privacidade.
- **A fazer pelo Tiago (uma vez):** correr `002_partilhas.sql` no SQL Editor do Supabase. Sem isso a app avisa que falta ativar.
- **Pré-visualização (sem Supabase):** a ligação só abre no mesmo browser.
- Corrigido de caminho: as folhas (BottomSheet) passam a renderizar no `body`, porque nas Definições ficavam fora do ecrã.

## Partilha: valor visível por defeito (27/11/2026, v0.10)
- A pedido do Tiago, o **valor estimado aparece por defeito** na partilha (interruptor ligado; coluna `mostrar_precos` passa a `default true`). Pode desligar-se por ligação. O preço de compra continua a nunca sair, tal como notas, locais e as fotos do próprio Tiago.
- A foto partilhada é a de loja ou, na falta dela, o rótulo desenhado na garrafa.
- Os passos para o Tiago vão sempre escritos na conversa (com o SQL dentro da mensagem), não em ficheiros ou ligações.
