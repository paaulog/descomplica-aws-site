# PRD — Descomplica AWS

Oct 7, 2026 · @Paulo

## Visão geral e problema

Descomplica AWS é uma documentação interativa, em formato de site, que explica os serviços principais da AWS de um jeito visual, amigável e prático. A primeira entrega cobre só o Amazon S3; EC2, Lambda e VPC entram em fases seguintes.

O problema: a documentação oficial da AWS é extensa, técnica e intimidadora para quem está começando. Ela parte do pressuposto de que o leitor já entende o vocabulário, e a sensação de quem chega é de que a AWS é complexa demais para usar.

O projeto tem dois papéis ao mesmo tempo:

- **Material de aprendizado** para o autor e para outras pessoas no mesmo ponto da jornada.
- **Peça de portfólio** que demonstra conhecimento de AWS e capacidade de construir uma experiência web moderna, divulgada em posts no LinkedIn a cada novo serviço.

## Missão, princípio-guia e objetivos

**Princípio-guia:** reduzir a intimidação percebida da AWS, provando que ela é menos complicada do que parece e que dá para começar a usar. Toda decisão de conteúdo e de design é medida contra essa frase.

O sentimento que o leitor deve levar ao fim da página: "entendi, não é tão difícil, quero testar".

### Objetivos

1. O leitor sai sabendo **o que é**, **para que serve** e **como utilizar** cada serviço.
2. O conteúdo vai do nível básico ao início do intermediário, sem saltos.
3. Cada conceito importante tem pelo menos um elemento visual ou interativo.
4. O site serve como portfólio: visual moderno, acabamento cuidadoso, código organizado.
5. A estrutura aceita novos serviços sem retrabalho na base.

### Fora do escopo

- Ensinar certificação AWS ou cobrir todas as opções de cada serviço.
- Conectar a uma conta AWS real ou executar operações de verdade.
- Contas de usuário, login ou comentários no site.

## Público-alvo e persona

O público principal é quem nunca usou a AWS ou já tentou e se sentiu perdido. O autor do projeto é o próprio público-alvo, então ele serve de medidor: se uma seção deixa o autor mais confiante, ela funcionou.

**Persona: o dev curioso e intimidado**

- Sabe programar ou está aprendendo, mas nunca configurou nada na AWS.
- Já ouviu falar de S3 e EC2, mas não sabe dizer o que cada um faz.
- Abriu o console da AWS uma vez e fechou com a sensação de que era complexo demais.
- Quer exemplos reais, não definições abstratas.

**Público secundário:** recrutadores e colegas que veem o projeto no LinkedIn e avaliam o autor pelo resultado.

## Escopo e fases

A versão 1 entrega a fundação completa do site com um único serviço dentro: o S3. Cada fase seguinte adiciona um serviço e vira um novo post no LinkedIn.

### Versão 1 — Fundação + S3

- Página inicial (home) apresentando o projeto e os serviços, com S3 ativo e os demais marcados como "em breve".
- Página do S3 completa, em scroll único, com todas as seções de conteúdo e as interações escolhidas.
- Sistema de design reutilizável: cores, tipografia, componentes de seção, componentes interativos.
- Indicador de progresso em traços, funcionando em desktop e mobile.
- Deploy público com URL própria.

### Fases seguintes

| Fase | Serviço | Foco do conteúdo |
| --- | --- | --- |
| 2 | EC2 | Servidores virtuais, tipos de instância, auto scaling |
| 3 | Lambda | Serverless, eventos, cobrança por execução |
| 4 | VPC | Redes, sub-redes públicas e privadas, segurança |
| 5 | Integração | Como os quatro serviços trabalham juntos numa aplicação real |

**Critério para sair de uma fase:** o autor lê a página do início ao fim, entende tudo sem consultar outra fonte e sente vontade de testar o serviço.

## Estrutura de conteúdo do S3

A página segue a tríade **o que é → para que serve → como utilizar**, subindo do básico ao intermediário. Cada seção abre com a dor ou a pergunta, depois a explicação, depois uma analogia ou exemplo real, e fecha com um elemento visual ou interativo.

### Bloco 1 — O que é (básico)

1. **Abertura (hero):** uma frase de impacto e a promessa da página, por exemplo "Em 10 minutos você vai entender o S3 e perceber que ele é mais simples do que parece".
2. **O problema:** guardar arquivos em servidor próprio é caro, limitado e arriscado (espaço acaba, disco quebra, site cai com muitos acessos).
3. **A definição:** S3 é um serviço de armazenamento de objetos na nuvem; você envia arquivos e a AWS cuida de espaço, durabilidade e acesso.
4. **A analogia:** um guarda-volumes gigante e infinito. O bucket é o compartimento, o objeto é o que você guarda, a chave é a etiqueta que identifica cada item.
5. **Conceitos-base:** bucket, objeto, chave, região. Explicar que não existem pastas de verdade, só prefixos na chave que parecem pastas.

### Bloco 2 — Para que serve (básico)

6. **Casos de uso reais:** fotos de perfil de um app, backups, arquivos de um site estático, vídeos de uma plataforma de cursos, dados para análise.
7. **Exemplos conhecidos:** como empresas e aplicações do dia a dia usam armazenamento de objetos (citar só exemplos com fonte pública).
8. **Por que não usar só um HD ou servidor:** durabilidade, escala sob demanda, pagar só pelo que usa.

### Bloco 3 — Como utilizar (básico ao intermediário)

9. **Primeiros passos:** criar um bucket, enviar um arquivo, acessar pelo link. Mostrar o caminho no console de forma visual.
10. **Permissões e acesso:** privado por padrão, acesso público, políticas de bucket e URLs pré-assinadas, explicados com a analogia do guarda-volumes (quem tem a chave).
11. **Classes de armazenamento:** Standard, Intelligent-Tiering, Standard-IA, Glacier. Relação entre frequência de acesso e custo.
12. **Versionamento:** guardar versões anteriores e recuperar um arquivo apagado por engano.
13. **Ciclo de vida:** regras que movem ou apagam arquivos automaticamente com o tempo.
14. **Hospedagem de site estático:** colocar um site no ar usando só o S3.
15. **Usando via código:** um exemplo curto com SDK (JavaScript ou Python) para enviar e listar arquivos.

### Bloco 4 — Fechamento

16. **Custos sem susto:** o que é cobrado (armazenamento, requisições, transferência) e o nível gratuito.
17. **Boas práticas e erros comuns:** bucket público por engano, falta de versionamento, região errada.
18. **Resumo e próximo passo:** recapitulação visual em uma tela e convite para testar e para ler o próximo serviço.

**Regra de exatidão:** valores de preço, limites e nomes de classes são conferidos na documentação oficial da AWS antes da publicação, com data de verificação na página.

## Tom de voz

O tom é de um amigo que manja do assunto te explicando: amigável e próximo, com profissionalismo suficiente para o leitor confiar. Equilibrado, pendendo para o amigável.

| Fazer | Evitar |
| --- | --- |
| Falar com "você" e usar frases curtas | Voz passiva e frases longas com vários termos técnicos |
| Explicar o termo técnico na primeira vez que aparece | Jargão sem explicação ou siglas soltas |
| Usar analogias do cotidiano | Gírias pesadas, memes ou piadas que envelhecem rápido |
| Antecipar a dúvida ("talvez você esteja pensando...") | Tom de manual ou de professor que dá bronca |
| Mostrar que errar é normal e como resolver | Exagerar ("é facílimo!") ou subestimar o leitor |

**Exemplo de frase no tom certo:** "Pensa no bucket como uma gaveta com nome único no mundo inteiro. Dentro dela você joga quantos arquivos quiser, e a AWS nunca vai dizer que a gaveta encheu."

**Regras de legibilidade:** parágrafos de até 3 frases, nenhum bloco de texto sem um respiro visual, termos-chave em destaque na primeira aparição.

## Experiência, navegação e design

Cada serviço é uma página única de scroll, contada como uma jornada do começo ao fim, com um menu minimalista em traços para pular entre seções.

### Navegação

- **Scroll único (scrollytelling):** o conteúdo se revela conforme o leitor desce; nada de paginação.
- **Indicador de progresso em traços:** uma coluna discreta de traços na lateral direita, um por seção. O traço da seção atual fica maior e destacado; ao passar o mouse aparece o nome da seção; ao clicar, a página rola suavemente até ela.
- **No mobile:** os traços viram uma barra fina horizontal no topo, com toque para abrir a lista de seções.
- **Barra de progresso de leitura** opcional no topo, mostrando quanto da página já foi lido.
- **Links âncora** por seção, para compartilhar um trecho específico.

### Princípios de experiência

1. Todo conceito importante tem pelo menos um visual ou interação.
2. Nenhum bloco longo de texto sem respiro: no máximo 3 parágrafos seguidos.
3. A interação explica, não enfeita. Se não ajuda a entender, sai.
4. Cada seção cria um gancho para a próxima (uma pergunta, um "mas e se...").
5. O leitor tem pequenas vitórias ao longo da página ("pronto, você já sabe o que é um bucket").
6. Animações respeitam a preferência de movimento reduzido do sistema.

### Identidade visual

- **Minimalista e moderna:** muito espaço em branco, tipografia forte, poucos elementos por tela.
- **Tema escuro e claro**, com alternância manual.
- **Paleta:** base neutra com uma cor de destaque por serviço (por exemplo, verde para S3), para dar identidade a cada página.
- **Tipografia:** uma fonte sans-serif moderna para texto e uma monoespaçada para código e nomes técnicos.
- **Ilustrações:** próprias e consistentes entre si (ícones, diagramas, personagens simples se fizer sentido), sem usar o logotipo ou a identidade visual oficial da AWS como se fosse um site da Amazon.
- **Referências de inspiração:** a definir pelo autor; sugestão de pesquisar sites de documentação moderna e explicações interativas (scrollytelling).

## Cardápio de interações

Esta lista é um cardápio aberto, não uma obrigação: o autor escolhe o que implementar conforme constrói e pode trocar itens por ideias vindas de skills e ferramentas que encontrar. A prioridade indica o mínimo sugerido para a versão 1.

| Interação | Seção | O que ensina | Prioridade |
| --- | --- | --- | --- |
| Arrastar um arquivo e vê-lo virar objeto dentro do bucket, com chave e metadados aparecendo | Conceitos-base | Bucket, objeto e chave | Essencial |
| Simulador de chave: digitar `fotos/2026/praia.jpg` e ver o "caminho" virar pastas visuais | Conceitos-base | Prefixos não são pastas reais | Essencial |
| Slider de frequência de acesso que recomenda a classe de armazenamento e mostra o custo mudando | Classes de armazenamento | Relação entre acesso e custo | Essencial |
| Calculadora de custo simples (GB guardados, requisições, transferência) | Custos sem susto | O que é cobrado | Essencial |
| Linha do tempo de versões: apagar um arquivo e restaurar uma versão anterior | Versionamento | Recuperação de arquivos | Recomendada |
| Cadeado interativo: alternar privado, público e URL pré-assinada e ver quem consegue acessar | Permissões | Controle de acesso | Recomendada |
| Animação de ciclo de vida: arquivo "envelhece" e desce de classe com o tempo | Ciclo de vida | Regras automáticas | Recomendada |
| Mini site estático montado ao vivo a partir de arquivos no bucket | Site estático | Hospedagem com S3 | Opcional |
| Bloco de código com abas (JavaScript e Python) e botão de copiar | Usando via código | Uso via SDK | Essencial |
| Diagrama que se monta conforme o scroll (usuário → app → S3) | Casos de uso | Onde o S3 entra numa aplicação | Recomendada |
| Quiz rápido de 3 perguntas ao fim de cada bloco | Fim de cada bloco | Fixação | Opcional |
| Cartões "mito ou verdade" sobre a AWS | Abertura | Quebra da intimidação | Opcional |
| Micro-interações em termos técnicos: passar o mouse mostra uma definição curta | Todas | Vocabulário | Essencial |

**Regra:** nenhuma simulação chama a AWS de verdade; tudo roda no navegador, com dados de exemplo.

## Requisitos funcionais e não funcionais

### Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | A home lista os serviços em cartões; S3 é clicável, os demais aparecem como "em breve". |
| RF-02 | A página do S3 apresenta as 18 seções na ordem definida em Estrutura de conteúdo. |
| RF-03 | O indicador em traços mostra a seção atual, exibe o nome ao passar o mouse e rola até a seção ao clicar. |
| RF-04 | Cada seção tem uma URL âncora compartilhável. |
| RF-05 | O usuário alterna entre tema claro e escuro; a escolha respeita o tema do sistema por padrão. |
| RF-06 | Termos técnicos marcados exibem uma definição curta ao passar o mouse ou tocar. |
| RF-07 | Blocos de código têm abas por linguagem e botão de copiar. |
| RF-08 | As interações essenciais do cardápio funcionam sem conexão com a AWS. |
| RF-09 | O fim da página tem um resumo visual e links para o próximo serviço e para o perfil do autor (LinkedIn, GitHub). |
| RF-10 | Cada página gera uma imagem de pré-visualização (Open Graph) para compartilhar no LinkedIn. |

### Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | Responsivo de 360 px a telas largas; interações utilizáveis com toque. |
| RNF-02 | Lighthouse com nota mínima de 90 em performance, acessibilidade e SEO. |
| RNF-03 | Acessibilidade: navegação por teclado, contraste adequado, textos alternativos, respeito a movimento reduzido. |
| RNF-04 | Conteúdo separado do código (arquivos MDX ou JSON por serviço) para adicionar serviços sem mexer na base. |
| RNF-05 | Animações a 60 fps em computadores comuns e sem travar o scroll no mobile. |
| RNF-06 | Site estático, sem backend, com custo de hospedagem próximo de zero. |
| RNF-07 | Código organizado e documentado (README com propósito, stack e como rodar), pois faz parte do portfólio. |

## Arquitetura técnica sugerida

A sugestão é um site estático em React com Vite, que o autor já domina, com o conteúdo de cada serviço em MDX. É uma sugestão, não uma imposição: a escolha final fica com o autor na fase de design técnico.

| Camada | Sugestão | Motivo |
| --- | --- | --- |
| Base | React + Vite + TypeScript | Stack conhecida, build rápido, site estático |
| Conteúdo | MDX (texto com componentes React dentro) | Escrever o texto e encaixar as interações no mesmo arquivo |
| Estilo | Tailwind CSS com tokens de design | Consistência visual e temas claro/escuro |
| Animações | Framer Motion | Revelação no scroll, transições e micro-interações |
| Diagramas e gráficos | SVG próprio; D3 se precisar de algo mais complexo | Controle total do visual |
| Código | Shiki ou Prism para realce de sintaxe | Blocos de código legíveis |
| Deploy | Vercel | Já usado pelo autor, deploy automático a cada push |
| Alternativa | Astro com componentes React | Avaliar se o foco em conteúdo estático pesar mais |

### Estrutura de pastas sugerida

```
src/
  content/
    s3/            # MDX das seções do S3
    ec2/           # fases futuras
  components/
    layout/        # header, indicador em traços, tema
    sections/      # moldes de seção (hero, conceito, exemplo, resumo)
    interactive/   # simuladores, calculadora, sliders
    ui/            # botões, cartões, tooltips de termos
  data/
    services.ts    # lista de serviços e status (ativo, em breve)
    pricing.ts     # valores de exemplo com data de verificação
  styles/          # tokens de cor por serviço
```

Adicionar um serviço novo significa criar uma pasta em `content/`, registrar em `services.ts` e escrever os componentes interativos específicos dele.

## Métricas de sucesso, riscos e decisões em aberto

### Métricas de sucesso

- **Teste do autor:** depois de ler a página, o autor cria um bucket real, envia um arquivo e configura acesso sem consultar outra fonte.
- **Teste com 3 pessoas** do público-alvo: cada uma explica com as próprias palavras o que é o S3 e para que serve.
- **Engajamento:** tempo médio na página e profundidade de scroll (ferramenta de analytics leve e sem cookies invasivos).
- **LinkedIn:** alcance, comentários e mensagens geradas pelo post de lançamento.

### Riscos

| Risco | Mitigação |
| --- | --- |
| Excesso de interações deixa a página pesada ou distrai do conteúdo | Princípio "a interação explica, não enfeita" e meta de Lighthouse |
| Preços e detalhes da AWS mudam | Valores centralizados em um arquivo, com data de verificação visível |
| Escopo cresce e a versão 1 nunca fica pronta | Prioridade "Essencial" do cardápio como mínimo para lançar |
| Confusão com site oficial da Amazon | Nome e visual próprios, aviso de que é um projeto independente |
| Conteúdo técnico com erro | Revisão contra a documentação oficial antes de publicar cada seção |

### Decisões em aberto

- [ ] Nome definitivo do projeto (provisório: Descomplica AWS).
- [ ] Idioma: só português na versão 1 ou português e inglês desde o início.
- [ ] Referências visuais de inspiração.
- [ ] Quais itens "Recomendados" do cardápio entram na versão 1.
- [ ] React + Vite ou Astro como base.
- [ ] Domínio próprio ou subdomínio da Vercel.
