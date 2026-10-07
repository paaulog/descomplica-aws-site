# Tarefa 3.0: Lógica pura do S3, preços e ilhas interativas

## Visão geral

Implementar a lógica dos simuladores do S3 como funções TypeScript puras, sem DOM e sem I/O, junto com a tabela de preços conferida na documentação oficial. Em cima disso, construir as oito ilhas React da v1: quatro essenciais e quatro recomendadas. Cada ilha recebe só o que usa por props, roda dentro de um error boundary e funciona por teclado e toque. Nenhuma ilha chama a AWS (RF-08).

<skills>
### Conformidade com skills

A pasta `.claude/skills` não existe no projeto. Skills da sessão que se aplicam:

- `dataviz`: referência de design para os visuais do `StorageClassSlider` e do `CostCalculator`.
- `run`: conferir cada ilha no app real, no desktop e em 360 px.
- `code-review` e `simplify`: revisar a tarefa antes de fechar.
</skills>

<requirements>
- As funções `parseKey`, `toS3Object`, `recommendStorageClass`, `estimateMonthlyCost`, `versioningReducer`, `resolveAccess` e `lifecycleTimeline` são puras e seguem as assinaturas de techspec.md › Principais interfaces.
- Em `pricing.ts`, todos os valores foram conferidos na página oficial da AWS (us-east-1, USD), com `verifiedAt` e `sources`. `freePlan` reflete o Free Plan em vigor desde 15/07/2025.
- O build mostra um aviso quando `verifiedAt` tiver mais de 90 dias.
- Os cálculos de custo usam só `pricing.ts`.
- Essenciais: `UploadToBucket`, `KeyExplorer`, `StorageClassSlider` e `CostCalculator`. Recomendadas: `AccessLock`, `VersionTimeline`, `LifecycleAnimation` e `FlowDiagram`.
- As ilhas seguem o contrato `IslandProps<M>`, são hidratadas com `client:visible` e recebem só o recorte de mensagens do idioma.
- Cada ilha tem error boundary com um texto estático explicando o conceito, e o SSR mostra o estado inicial.
- O upload funciona sem arrastar: botão, `<input type=file>` e "usar arquivo de exemplo". O conteúdo do arquivo nunca é lido.
- O Motion entra só nas ilhas, com `LazyMotion`. Com `prefers-reduced-motion`, cada ilha segue por um caminho sem animação.
- O adaptador `track()` em modo no-op nunca lança erro.
</requirements>

## Subtarefas

- [ ] 3.1 Implementar `src/lib/s3/key.ts` e `object.ts` (`parseKey` e `toS3Object` com ETag fictício e determinístico).
- [ ] 3.2 Implementar `src/lib/s3/storage-class.ts` e `cost.ts` (`recommendStorageClass` com avisos de duração mínima e de recuperação, e `estimateMonthlyCost`).
- [ ] 3.3 Implementar `src/lib/s3/versioning.ts`, `access.ts` e `lifecycle.ts`.
- [ ] 3.4 Conferir os preços e os nomes de classes na documentação oficial, preencher `src/data/pricing.ts` e adicionar o aviso de `verifiedAt` vencido no build.
- [ ] 3.5 Criar a infraestrutura das ilhas: tipo `IslandProps`, `IslandErrorBoundary`, `src/lib/analytics.ts` (no-op) e o hook de movimento reduzido.
- [ ] 3.6 Criar as ilhas essenciais `KeyExplorer` e `UploadToBucket`.
- [ ] 3.7 Criar as ilhas essenciais `StorageClassSlider` (operável por setas) e `CostCalculator`.
- [ ] 3.8 Criar as ilhas recomendadas `AccessLock` e `VersionTimeline`.
- [ ] 3.9 Criar as ilhas recomendadas `LifecycleAnimation` e `FlowDiagram` (montado com `useScroll`).
- [ ] 3.10 Adicionar as mensagens das ilhas em `ui.ts` nos dois idiomas e encaixar cada ilha num MDX semente para os testes E2E. Depende da 2.0.
- [ ] 3.11 Escrever os testes unitários, de componentes e E2E desta tarefa.

## Detalhes de implementação

- Tabela de ilhas e funções puras: techspec.md › Visão dos componentes (Ilhas interativas, Lógica e dados).
- Modelos `KeyParseResult`, `S3ObjectPreview`, `VersionedObject`, `AccessMode`, `Actor`, `AccessDecision` e `LifecycleRule`: techspec.md › Modelos dos simuladores.
- Estrutura de `pricing.ts`: techspec.md › Modelos de dados (Tabela de preços).
- Error boundary e comportamento sem JS: techspec.md › Pontos de integração (Tratamento de erros).
- Eventos de `track()` e motivo do no-op: techspec.md › Monitoramento e observabilidade.
- O que cada interação ensina: prd.md › Cardápio de interações.
- Riscos de peso de JS, arrastar e soltar e Free Plan: techspec.md › Riscos conhecidos.
- Comportamento de `motion/react` com React 19 a confirmar na documentação (techspec.md › Riscos conhecidos).

## Critérios de sucesso

- Cobertura de testes de `src/lib/s3` ≥ 95% de linhas e 100% dos casos de borda listados na techspec.
- Todas as oito ilhas funcionam por teclado, por toque e com movimento reduzido, nos dois idiomas.
- Nenhuma requisição de rede sai das ilhas durante o uso.
- O bundle de cada ilha carrega as mensagens de um idioma só.
- Os preços batem com a fonte oficial na data de `verifiedAt`.

## Testes da tarefa

- [ ] Testes unitários (lógica pura)
  - `parseKey`: `fotos/2026/praia.jpg`, barra final, `a//b`, barra inicial, Unicode, chave acima de 1024 bytes em UTF-8 e chave vazia.
  - `toS3Object`: com e sem prefixo, ETag determinístico e `contentType` vazio.
  - `recommendStorageClass`: fronteiras entre as classes, perfil "não sei" (resultado Intelligent-Tiering) e avisos de duração mínima e de custo de recuperação.
  - `estimateMonthlyCost`: entradas zeradas, franquia de transferência, arredondamento e uso exclusivo da tabela recebida.
  - `versioningReducer`: com o versionamento desligado, apagar é definitivo; ligado, apagar cria um delete marker; restaurar volta a versão; o estado anterior continua imutável.
  - `resolveAccess`: matriz completa de modo × ator, incluindo URL pré-assinada expirada e no limite exato.
  - `lifecycleTimeline`: ordem das transições, expiração encerrando a linha e regras fora de ordem.
  - `pricing.ts`: o schema é válido e o aviso aparece quando `verifiedAt` passa de 90 dias.
  - `track()`: não lança erro com payload inválido.
- [ ] Testes de componentes (Testing Library + happy-dom)
  - Cada ilha renderiza com as mensagens de pt-BR e de en.
  - Cada ilha opera só por teclado: slider por setas; upload por `<input type=file>` e "usar arquivo de exemplo".
  - Com `prefers-reduced-motion`, cada ilha segue pelo caminho sem animação.
  - O error boundary mostra o texto alternativo quando a ilha lança erro.
- [ ] Testes de integração
  - O SSR de cada ilha mostra o estado inicial com conteúdo significativo.
- [ ] Testes E2E (desktop e mobile com 360 px)
  - Caminho feliz de cada uma das oito ilhas.
  - Um interceptador de rede confirma que nenhuma requisição vai para `*.amazonaws.com` nem para outros domínios externos durante o uso das ilhas.
  - Com movimento reduzido emulado, as animações ficam desativadas.

## Arquivos relevantes

- `src/lib/s3/key.ts`, `object.ts`, `storage-class.ts`, `cost.ts`, `versioning.ts`, `access.ts`, `lifecycle.ts`
- `src/data/pricing.ts`, `src/lib/analytics.ts`, `src/lib/i18n/ui.ts`
- `src/components/interactive/IslandErrorBoundary.tsx`, `src/components/interactive/types.ts`
- `src/components/interactive/s3/UploadToBucket.tsx`, `KeyExplorer.tsx`, `StorageClassSlider.tsx`, `CostCalculator.tsx`, `AccessLock.tsx`, `VersionTimeline.tsx`, `LifecycleAnimation.tsx`, `FlowDiagram.tsx`
- `tests/unit/s3/**`, `tests/unit/components/**`, `tests/e2e/interactions.spec.ts`
