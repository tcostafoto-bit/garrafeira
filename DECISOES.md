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

## Fotos novas e formatos (27/11/2026)
- **Formatos (indicados pelo Tiago):** Palato do Côa 2022 e CV Curriculum Vitae 2019 tinto são magnum de 1,5 L; o CV Branco 2019 é garrafa normal de 75 cl; o Poças Reserva 2018 é de 5 L. O valor estimado é sempre por garrafa **do formato** (magnum e 5 L valem mais que 75 cl).
- **Valores:** CV magnum 210 € (loja Garrafinhas, magnum de outra colheita, 209,85 €); CV Branco 70 € (lojas com 69,28 € e 74,85 €, outras colheitas); Palato magnum 22 € e Poças 5 L 150 € **calculados** a partir do preço de 75 cl (8,40 € e cerca de 14 €), porque não encontrei esses formatos à venda; Aldeia de Cima 14 € (13,49 €) e branco 15 € (estimativa sem fonte).
- **Herdade Aldeia de Cima Reserva:** duas colheitas, 2022 (cápsula salmão) e 2024 (cápsula verde). «2 caixas» lido como **2 garrafas de cada ano, 4 no total** (a caixa da foto leva 2 garrafas, uma de cada ano). O 2024 ficou como **branco** (um tinto Reserva de 2024 ainda não estaria à venda e a cápsula verde é a dos brancos); fica marcado «a confirmar» nas notas.
- **Fotos do Tiago:** não as usei como foto do vinho, porque mostram a garrafa dentro de caixa de madeira, com película ou deitada, sem fundo limpo. Ficam com o rótulo desenhado (nome, produtor e ano reais). O Tiago pode juntar a foto dele na ficha (Editar → Foto) quando quiser.
- Importação por blocos «GARRAFEIRA v1» entregues no chat; o CV 2019 é atualizado (não duplicado) porque coincide nome e ano. Fichas guardadas em `fichas/fichas-2026-11-27-*.json` na pasta do projeto.

## Fotos de loja para os vinhos novos (27/11/2026, v0.11)
- **Regra do Tiago:** para todos os vinhos novos vou sempre à net buscar a foto da garrafa e guardo só o endereço da imagem (da loja ou do produtor) em `src/lib/imagens.ts`; a app mostra-a a partir do site de origem. Se a imagem falhar, fica o rótulo desenhado.
- **Juntei:** CV tinto 2019 (agora a foto do magnum), CV Branco, Poças Reserva, Aldeia de Cima Reserva 2022 e Palato do Côa. Duas são «imagem ilustrativa» do site (Poças e Aldeia de Cima) e a do Palato é de outra colheita (mesmo rótulo de gama); não consegui abrir as imagens daqui para as ver, por isso o Tiago deve avisar se alguma estiver errada.
- **Sem foto:** Aldeia de Cima 2024 (branco), porque não encontrei imagem do mesmo vinho.
- **Bloco único:** o Tiago pediu um só código com os 6 vinhos. Vai como `"acao":"atualizar"`: se o CV 2019 já existir, é atualizado (formato e valor, sem somar garrafas); se não existir, é criado com todos os dados; os restantes são criados. Testado nos dois casos.

## Aldeia de Cima 2024 é tinto (27/11/2026, v0.12)
- O Tiago acha que o Reserva 2024 (cápsula verde) é **tinto**, por isso passa a tinto, com guia, valor (14 €) e foto do Reserva tinto. Decisão dele; a minha dedução anterior (branco) assentava só na cápsula.
- **Whisky:** não encontrei nenhuma garrafa de whisky nas fotos nem nas fichas (as 13 fotos de 26/11, as 5 de 27/11 e as capturas de ecrã). Pedi-lhe a foto. O esquema da app só tem tipos de vinho; um destilado ficaria como «Outro».

## Bowmore 30 Anos Sea Dragon (27/11/2026, v0.12)
- A «de whisky» do Tiago é o **Bowmore 30 anos, série Sea Dragon**, garrafa de cerâmica, 70 cl, 43 %, em caixa preta com cetim vermelho (edição dos anos 1990). Entra como tipo **«Outro»**, porque a app só tem tipos de vinho, com guia próprio (sem decantar, sem gelo, copo Glencairn).
- **Valor 1.700 €** (entre 1.550 e 2.500 €): leilões de 70 cl/43 % acabados a 1.350 £ e 1.450 £ em 2024 (um com caixa) e 2.200 £ em 2021; uma loja pede 3.500 £ (preço pedido, não vendido). Convertido a cerca de 1,15 €/£. As ofertas de 75 cl ficaram de fora.
- Foto: a de um leilão da mesma edição (cerâmica). Não consegui abri-la daqui.

## v0.13 — Todas as bebidas (2026-11-27)
- Novos tipos: whisky, destilado, licor, cerveja, sidra, saquê (além de "outro"), com cor, forma de garrafa própria, filtros e formulário agrupado (Vinhos / Outras bebidas). Castas escondidas e "Ano (se tiver)" para bebidas; volumes 330/700/1000 ml adicionados.
- Guia de serviço por tipo (copo, temperatura, sem decantar); bebidas não têm janela de consumo nem contam em "prontos a beber".
- Importação aceita sinónimos (cognac, gin, rum, beer, etc.).
- Migração 003 (alarga a restrição do tipo; não apaga dados; idempotente; testada em Postgres local). Tem de ser corrida pelo Tiago no Supabase.
- Bowmore 30 Anos Sea Dragon passa a tipo whisky.

## SQL corrido no Supabase (2026-11-27)
- A pedido do Tiago, corri eu as migrações 002 (partilhas) e 003 (bebidas) no SQL Editor, no Chrome (Browser 2, o mais recente, já com sessão). Confirmado: tabela partilhas e função ver_partilha existem, restrição do tipo aceita whisky, 47 vinhos intactos. O aviso de "operações destrutivas" do Supabase era só dos drop policy/constraint idempotentes.

## v0.14 — Filtros na página partilhada (2026-11-27)
- Os amigos podem filtrar por tipo de bebida (chips), país, região (depende do país), década do ano e casta (folha "Filtros"), pesquisar por nome/produtor/região/país/casta e ordenar por nome, ano ou valor (valor só se o preço estiver visível). Contagem de resultados e "Limpar".
- Tudo no cliente com os campos que a função ver_partilha já devolve; nada de privado exposto. "Localização" = país/região do vinho, não onde está guardado. Sem SQL novo.

## v0.15 — Valor nas linhas, Abrir hoje completo, valor por tipo (2026-11-27)
- Cada cartão da lista mostra o valor por garrafa e, com mais de uma, "cada · total". Cartão de resumo ganha "Valor por tipo" (garrafas e valor por tipo + total geral).
- Abrir hoje: antes só mostrava 3 sugestões e as restantes nunca apareciam (ex.: CV Branco). Agora há "Mostrar todas" e só entram os vinhos cujo tipo ou pratos do guia combinam com a categoria. Novas ocasiões para bebidas sem janela: Digestivo, Brinde ou festa, Cerveja e convívio, Provar a solo; whisky/licor/cerveja/sidra/saquê também entram em pratos adequados.
- Teste com 50 itens (65 garrafas) das fichas: todos aparecem em pelo menos uma ocasião.
