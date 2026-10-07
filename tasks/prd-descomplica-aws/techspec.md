# Especificação técnica

## Resumo executivo

O Descomplica AWS é um site estático em **Astro com ilhas React**, bilíngue desde a v1: **pt-BR** como idioma padrão, sem prefixo na URL, e **en** sob `/en`. O conteúdo de cada serviço fica em **MDX**, um arquivo por seção e por idioma, validado por *content collections* com schema Zod. A página do serviço junta as seções em ordem e gera HTML puro. Só as interações viram ilhas React, hidratadas com `client:visible`. Toda a lógica dos simuladores (chaves, classes, custo, versões, acesso, ciclo de vida) fica em módulos TypeScript puros em `src/lib`, sem DOM, e as ilhas cuidam só de apresentação e estado local. Assim, a regra "nada chama a AWS" fica fácil de garantir e de testar.

O visual usa **Tailwind CSS v4** com tokens em CSS e tema controlado por `data-theme`. As animações das ilhas usam **Motion** (`motion/react`); a revelação no scroll fora delas usa CSS e `IntersectionObserver`. Os blocos de código usam **Expressive Code**, envolvido num componente próprio de abas. As imagens Open Graph são geradas no build com Satori. O deploy é estático na Vercel, com Vercel Web Analytics. A ordem de construção é: fundação (projeto, i18n, pipeline de conteúdo, design system e navegação em traços), depois lógica pura e ilhas, depois conteúdo nos dois idiomas, e por fim SEO, OG e endurecimento de qualidade.

## Arquitetura do sistema

### Visão dos componentes

Projeto novo: todos os componentes abaixo são **novos**.

**Configuração e build**

- `astro.config.mjs`: `output: 'static'`; integrações `@astrojs/react`, `@astrojs/mdx`, `@astrojs/sitemap` e `astro-expressive-code`; Tailwind via `@tailwindcss/vite`; `i18n: { defaultLocale: 'pt-br', locales: ['pt-br', 'en'], routing: { prefixDefaultLocale: false } }`.
- `src/content.config.ts`: coleções `sections` (MDX, loader `glob`) e `glossary` (YAML por idioma), com schemas Zod.

**Rotas (finas, sem lógica)**

- `src/pages/index.astro` e `src/pages/en/index.astro`: renderizam `HomePage`.
- `src/pages/[service].astro` e `src/pages/en/[service].astro`: `getStaticPaths` gera só os serviços com `status: 'active'` e renderiza `ServicePage`.
- `src/pages/og/[locale]/[service].png.ts`: endpoint pré-renderizado que gera o PNG de OG.
- `src/pages/404.astro`: página de erro bilíngue.

**Layout (`src/components/layout/`)**

- `BaseLayout.astro`: `<head>` com canonical, `hreflang`, metatags OG/Twitter e script inline de tema (evita piscar o tema errado); fontes auto-hospedadas pré-carregadas; link "pular para o conteúdo"; cabeçalho, rodapé (com aviso de projeto independente) e `<Analytics />`.
- `SiteHeader.astro`, `ThemeToggle.astro` e `LanguageSwitcher.astro`. A troca de idioma leva para a mesma seção no outro idioma, mapeando a âncora pela `key` estável da seção.
- `SectionNav.astro`: traços laterais no desktop, barra fina com lista expansível no mobile e barra de progresso de leitura. A lógica fica em `src/lib/nav/section-observer.ts`, em TS puro e sem React, porque roda em toda página.

**Seções (`src/components/sections/`)**

- `ServicePage.astro`: busca as seções por serviço e idioma, ordena por `order` e envolve cada uma em `SectionShell`.
- `SectionShell.astro`: `<section id={anchor} aria-labelledby>`, título com link âncora copiável, rótulo do bloco e classe de revelação.
- Moldes usados no MDX: `Hero`, `Analogy`, `SmallWin` ("pronto, você já sabe..."), `NextHook` e `Summary`.

**UI (`src/components/ui/`)**

- `Term.astro`: termo técnico com definição curta. Usa um `<button>` com a Popover API nativa e posicionamento por `@floating-ui/dom`, num script compartilhado. Abre por hover, foco e toque, e fecha com Esc.
- `CodeTabs.astro`: abas JS/Python sobre blocos do Expressive Code, no padrão WAI-ARIA Tabs. A linguagem escolhida fica salva e sincronizada entre os blocos.
- `ServiceCard.astro`: cartão da home; o estado "em breve" não é link.

**Ilhas interativas (`src/components/interactive/s3/`, React)**

| Ilha | Prioridade | Lógica pura usada |
| --- | --- | --- |
| `UploadToBucket` | Essencial | `toS3Object` |
| `KeyExplorer` | Essencial | `parseKey` |
| `StorageClassSlider` | Essencial | `recommendStorageClass`, `estimateMonthlyCost` |
| `CostCalculator` | Essencial | `estimateMonthlyCost` |
| `AccessLock` | Recomendada | `resolveAccess` |
| `VersionTimeline` | Recomendada | `versioningReducer` |
| `LifecycleAnimation` | Recomendada | `lifecycleTimeline` |
| `FlowDiagram` (montado no scroll) | Recomendada | — (só animação, `useScroll`) |

As opcionais do cardápio (mini site estático, quiz e mito ou verdade) ficam fora da v1.

**Lógica e dados**

- `src/lib/s3/`: `key.ts`, `object.ts`, `storage-class.ts`, `cost.ts`, `versioning.ts`, `access.ts` e `lifecycle.ts`.
- `src/lib/i18n/`: `ui.ts` (dicionário de textos de interface por idioma), `routes.ts` (caminhos localizados e alternates) e `format.ts` (moeda e bytes via `Intl`).
- `src/lib/content/`: consultas às coleções e verificação de paridade entre idiomas.
- `src/lib/analytics.ts`: adaptador de eventos (ver Monitoramento).
- `src/lib/og/render.ts`: template Satori → PNG via `@resvg/resvg-js`.
- `src/data/services.ts` e `src/data/pricing.ts`.
- `src/styles/global.css`: tokens base e tokens de destaque por serviço (`[data-service="s3"]`).

**Fluxo de dados**

MDX e YAML passam pela validação Zod no build e viram páginas Astro, que geram o HTML estático. Cada ilha recebe por props apenas o que usa: `locale`, o recorte de mensagens dela e, quando precisa, `pricing`. Assim, o bundle não carrega os dois idiomas. O estado das ilhas vive só em memória. O `localStorage` guarda apenas preferências: `da:theme` e `da:code-lang`.

## Design de implementação

### Principais interfaces

Funções puras consumidas pelas ilhas (sem DOM, sem I/O):

```ts
// src/lib/s3/*.ts
export function parseKey(key: string): KeyParseResult;
export function toS3Object(file: Pick<File, 'name' | 'size' | 'type'>, prefix?: string): S3ObjectPreview;
export function recommendStorageClass(profile: AccessProfile): StorageClassRecommendation;
export function estimateMonthlyCost(input: CostInput, table: PricingTable): CostBreakdown;
export function versioningReducer(state: VersionedObject, action: VersionAction): VersionedObject;
export function resolveAccess(mode: AccessMode, actor: Actor, now: Date): AccessDecision;
export function lifecycleTimeline(rules: LifecycleRule[], days: number): LifecycleStep[];
```

Infraestrutura do site:

```ts
// src/lib/content, src/lib/i18n, src/lib/nav, src/lib/analytics
export function getServiceSections(service: ServiceId, locale: Locale): Promise<SectionEntry[]>;
export function assertLocaleParity(service: ServiceId): Promise<void>; // lança erro no build
export function localizedPath(locale: Locale, path: string): string;
export function createSectionObserver(ids: string[], onChange: (activeId: string) => void): () => void;
export function track(event: AnalyticsEvent): void; // nunca lança erro

// Contrato comum das ilhas
export interface IslandProps<M> { locale: Locale; messages: M }
export interface CostCalculatorProps extends IslandProps<CostMessages> { pricing: PricingTable }
```

### Modelos de dados

**Frontmatter de seção** (`src/content/sections/s3/{pt-br,en}/NN-<key>.mdx`). O idioma vem da pasta.

| Campo | Tipo | Regra |
| --- | --- | --- |
| `service` | `ServiceId` | igual à pasta |
| `key` | string | id estável, igual nos dois idiomas (ex.: `storage-classes`) |
| `order` | 1–18 | único por serviço e idioma |
| `block` | `'what' \| 'why' \| 'how' \| 'wrap'` | agrupa no nav e no resumo |
| `anchor` | string (slug) | localizado, único na página (ex.: `classes-de-armazenamento`) |
| `title`, `navLabel` | string | `navLabel` com no máximo 28 caracteres, para caber no tooltip do traço |
| `summary` | string | usado no resumo final e na descrição de OG |

**Serviço** (`services.ts`): `{ id, status: 'active' | 'soon', phase, accent, order, title: Record<Locale,string>, tagline: Record<Locale,string> }`.

**Glossário** (`src/content/glossary/{pt-br,en}.yaml`): `{ key, term, definition }`, com `definition` de no máximo 160 caracteres. `<Term id>` no MDX referencia a `key`.

**Tabela de preços** (`pricing.ts`): `{ region: 'us-east-1', currency: 'USD', verifiedAt, sources: string[], storage: Record<StorageClass, {perGbMonth, minDays?, minObjectKb?, retrievalPerGb?}>, requests: Record<StorageClass, {putPer1k, getPer1k}>, transferOut: {freeGb, perGb}, freePlan: {creditsUsd, extraCreditsUsd, months} }`. Os valores entram depois de conferidos na página oficial, e `verifiedAt` aparece na página.

**Modelos dos simuladores**

- `KeyParseResult`: `{ valid, errors[], segments[], prefixes[], fileName }`. Valida o limite de 1024 bytes em UTF-8 e sinaliza barra inicial ou dupla.
- `S3ObjectPreview`: `{ key, size, contentType, lastModified, etag }`. O ETag é fictício e determinístico; o conteúdo do arquivo nunca é lido nem enviado.
- `VersionedObject`: `{ key, versioningEnabled, versions: {versionId, createdAt, label, isDeleteMarker}[] }`. `VersionAction` pode ser `put`, `delete`, `restore` ou `toggleVersioning`.
- `AccessMode`: `'private' | 'public' | 'presigned'`. `Actor`: `'owner' | 'anonymous' | 'linkHolder'`. `AccessDecision`: `{ allowed, reason, expiresAt? }`.
- `LifecycleRule`: `{ afterDays, action: {type:'transition', to: StorageClass} | {type:'expire'} }`.

Não há banco de dados nem persistência fora das preferências em `localStorage`.

### Endpoints da API

Não há backend nem API. As rotas estáticas geradas são:

- `GET /` e `GET /en/`: home.
- `GET /s3/` e `GET /en/s3/`: página do serviço. As seções têm âncoras localizadas (`/s3/#classes-de-armazenamento`, `/en/s3/#storage-classes`).
- `GET /og/{locale}/{service}.png`: imagem OG gerada no build.
- `GET /sitemap-index.xml`, `GET /robots.txt` e `404.html`.

Serviços "em breve" não geram rota.

## Pontos de integração

- **AWS:** nenhuma chamada, em nenhum momento (RF-08). Os preços são estáticos em `pricing.ts`. A Price List API foi descartada porque exige credenciais e backend.
- **Vercel (deploy):** projeto ligado ao repositório GitHub, com preview por PR e produção na branch principal. Não precisa de adapter, porque a saída é estática.
- **Vercel Web Analytics:** `@vercel/analytics/astro` no `BaseLayout`. Não usa cookies. Falhas de rede do script não afetam a página.
- **Fontes:** auto-hospedadas via Fontsource (licença OFL), uma sans variável e uma mono. Não há requisição a terceiros em tempo de execução.
- **Tratamento de erros:** cada ilha fica dentro de um *error boundary* que mostra um texto estático explicando o conceito. O conteúdo textual funciona sem JavaScript, e a ilha renderizada no servidor mostra o estado inicial. Os erros de build são intencionais: schema inválido, paridade quebrada, `<Term>` inexistente ou serviço ativo sem conteúdo.

## Abordagem de testes

### Testes unitários

Usam **Vitest**. A prioridade é `src/lib`, onde mora o risco de ensinar algo errado. Mocks só para `matchMedia`, `IntersectionObserver`, `clipboard` e `track`.

- `parseKey`: `fotos/2026/praia.jpg`, barra final, `a//b`, barra inicial, Unicode, chave acima de 1024 bytes e chave vazia.
- `recommendStorageClass`: fronteiras entre as classes, perfil "não sei" (resultado Intelligent-Tiering) e avisos de duração mínima e de custo de recuperação.
- `estimateMonthlyCost`: entradas zeradas, franquia de transferência, arredondamento, formatação em BRL/USD por idioma e uso exclusivo de `pricing.ts`.
- `versioningReducer`: com o versionamento desligado, apagar é definitivo; ligado, apagar cria um *delete marker*; restaurar volta a versão; e a imutabilidade do estado.
- `resolveAccess`: matriz completa de modo × ator, incluindo URL pré-assinada expirada.
- `lifecycleTimeline`: ordem das transições e expiração encerrando a linha.
- `i18n`: as chaves de `ui.ts` são idênticas nos dois idiomas; `localizedPath` e alternates estão corretos.
- `section-observer`: escolha da seção ativa com várias seções visíveis ao mesmo tempo.
- **Componentes** (Testing Library com happy-dom): cada ilha renderiza com as mensagens dos dois idiomas, opera só por teclado (slider por setas, upload por `<input type=file>` e "usar arquivo de exemplo") e, com `prefers-reduced-motion`, cai num caminho sem animação.

### Testes de integração

- **Paridade de conteúdo:** cada idioma tem 18 seções com o mesmo conjunto de `key` e `order`, e as `anchor` são únicas. Todo `<Term id>` existe no glossário do idioma, e todo serviço `active` tem conteúdo.
- **Renderização:** a Astro Container API renderiza `ServicePage` e verifica as 18 `<section>` na ordem, os ids iguais às âncoras, os `hreflang` recíprocos, as metatags OG apontando para o PNG e o `lang` correto no `<html>`.
- **Build:** `astro check` e `astro build` rodam sem erros na CI. O build verifica a existência dos PNGs de OG e o tamanho de 1200×630.

### Testes E2E

Usam **Playwright** contra `astro preview`. Como não há backend, o E2E cobre só o frontend. Há dois projetos de navegador: desktop Chromium e mobile com 360 px de largura e toque.

- **Navegação:** da home, o cartão S3 leva à página; os cartões "em breve" não são clicáveis. Clicar num traço rola até a seção e atualiza o hash. O traço ativo muda conforme o scroll. No mobile, a barra abre a lista de seções. Um link direto com âncora cai na seção certa, sem ficar escondida pelo cabeçalho.
- **Preferências:** o tema respeita o `colorScheme` emulado e persiste a escolha manual após recarregar. A troca de idioma mantém a seção atual.
- **Termos e código:** a definição abre por hover, toque e foco, e fecha com Esc. As abas de código trocam de linguagem, e o botão de copiar coloca o texto na área de transferência.
- **Interações:** o caminho feliz de cada ilha da v1 funciona. Com movimento reduzido emulado, as animações ficam desativadas.
- **Acessibilidade:** `@axe-core/playwright` roda na home e no S3, nos dois idiomas e nos dois temas, e não pode haver violações *serious* ou *critical*.
- **Qualidade:** Lighthouse CI (`@lhci/cli`) roda no preview, com nota mínima de 0,9 em performance, acessibilidade e SEO, nas versões mobile e desktop.

## Sequenciamento do desenvolvimento

### Ordem de construção

1. **Base do projeto:** Astro com TS estrito, integrações, Tailwind v4, ESLint e Prettier, Vitest, Playwright, CI (GitHub Actions) e projeto Vercel. Vem primeiro porque tudo depende dele.
2. **i18n e pipeline de conteúdo:** schemas das coleções, `services.ts`, `ui.ts`, rotas e teste de paridade. Libera o trabalho de conteúdo em paralelo.
3. **Layout e design system:** tokens, temas, `BaseLayout`, cabeçalho, rodapé, `SectionShell`, moldes, `Term`, `CodeTabs` e home com cartões.
4. **Navegação:** `SectionNav` (traços, barra mobile e progresso) e âncoras compartilháveis.
5. **Lógica pura e preços:** `src/lib/s3` com testes e `pricing.ts` conferido na fonte oficial.
6. **Ilhas essenciais:** `KeyExplorer`, `UploadToBucket`, `StorageClassSlider` e `CostCalculator`.
7. **Ilhas recomendadas:** `AccessLock`, `VersionTimeline`, `LifecycleAnimation` e `FlowDiagram`.
8. **Conteúdo:** as 18 seções em pt-BR, depois a tradução e revisão em en, e o glossário nos dois idiomas.
9. **Distribuição:** OG no build, sitemap, `robots.txt`, `hreflang` e analytics.
10. **Endurecimento:** E2E completo, axe, Lighthouse, ajustes de performance, README, domínio e deploy de produção.

### Dependências técnicas

- Node.js 22 LTS e pnpm (ou npm).
- Repositório Git e GitHub. A pasta ainda não é um repositório.
- Conta Vercel no plano Hobby. A integração MCP da Vercel nesta sessão precisa ser autorizada, mas não é necessária para o projeto.
- Decisão de domínio (em aberto no PRD), que afeta `site` no `astro.config.mjs`, o canonical e o OG.
- Conferência de preços e nomes de classes na documentação oficial antes de publicar.
- Revisão do texto em inglês.

## Monitoramento e observabilidade

O site não tem backend, então não há métricas Prometheus nem dashboards Grafana. Essa infraestrutura não existe no projeto. A observabilidade fica assim:

- **Vercel Web Analytics:** page views por rota e idioma, referência (LinkedIn) e país. É a base da métrica de engajamento.
- **Eventos customizados** pelo adaptador `track()`: `section_view {section, locale}`, `interaction_used {island}`, `code_copied {lang}` e `theme_changed`. **No plano Hobby, a Vercel não aceita eventos customizados (só no Pro)**. Por isso, na v1 o adaptador fica em modo no-op, sem quebrar nada. Para medir a profundidade de scroll, há duas saídas: migrar para o Pro ou trocar o destino do adaptador (por exemplo, Umami Cloud), mexendo em um único arquivo.
- **Vercel Speed Insights** (opcional, limitado no Hobby): Core Web Vitals de usuários reais.
- **Lighthouse CI:** relatório por PR guardado como artefato da CI.
- **Logs de build:** aviso quando `pricing.verifiedAt` tiver mais de 90 dias e erro para schema, paridade ou glossário inválidos.
- **Erros no cliente:** o *error boundary* registra `console.error` só em desenvolvimento. Não há serviço de rastreamento de erros na v1.

## Considerações técnicas

### Principais decisões

- **Astro com ilhas React, em vez de SPA com Vite:** o HTML sai estático e só as interações carregam JS, o que facilita o Lighthouse ≥ 90 e o SEO. O MDX e as coleções tipadas já vêm nativos. O custo é aprender Astro; os componentes interativos continuam em React.
- **Lógica pura separada das ilhas:** permite testar sem DOM, reaproveitar entre ilhas (slider e calculadora usam o mesmo cálculo) e garante que nenhuma chamada externa entre por acidente.
- **Um MDX por seção:** facilita gerar o nav, verificar a paridade e revisar diffs menores. O custo é ter mais arquivos. Um MDX único por página foi descartado porque dificulta validar as 18 seções.
- **`key` estável com `anchor` localizada:** as URLs ficam legíveis em cada idioma, e a troca de idioma mantém a posição.
- **i18n nativo do Astro, sem biblioteca:** as rotas e os helpers do framework bastam. As ilhas recebem apenas as mensagens de que precisam.
- **Tooltips com a Popover API em vez de ilhas React:** evita hidratar dezenas de componentes por página. Radix e Floating UI React foram descartados por esse peso.
- **Nav em TS puro:** roda em toda página e precisa ser mínimo.
- **Motion só dentro das ilhas:** a revelação simples usa CSS e `IntersectionObserver`, e as animações usam apenas `transform` e `opacity`. GSAP foi descartado por não haver necessidade.
- **Expressive Code em vez de rehype-pretty-code:** já traz botão de copiar e temas claro e escuro. As abas ficam num componente próprio.
- **Tailwind v4 com `@custom-variant dark` sobre `[data-theme="dark"]`:** o tema padrão segue o sistema, e o script inline aplica o tema antes da primeira pintura.
- **OG com Satori e resvg no build:** um template único, e cada serviço novo ganha a imagem automaticamente. `astro-og-canvas` fica como alternativa.

### Riscos conhecidos

- **Nível gratuito desatualizado no PRD:** desde 15/07/2025, contas novas não têm mais 5 GB de S3 por 12 meses. Elas recebem o Free Plan, com créditos de US$ 100 a US$ 200 válidos por 6 meses. A seção 16 precisa refletir isso, e `pricing.freePlan` modela o dado.
- **Métrica de profundidade de scroll indisponível no Hobby:** mitigada pelo adaptador de analytics.
- **Divergência entre idiomas:** mitigada pelo teste de paridade e pela revisão do texto em inglês. O bilinguismo dobra o esforço de conteúdo, o maior risco de prazo da v1.
- **Peso de JS** com oito ilhas e Motion: `client:visible`, `LazyMotion` e meta de JS inicial pequeno, verificada pelo Lighthouse CI.
- **Arrastar e soltar não funciona com toque nem teclado:** sempre oferecer botão, `<input type=file>` e arquivo de exemplo.
- **Animações ligadas ao scroll travando no mobile:** só `transform` e `opacity`, e respeito ao movimento reduzido.
- **Satori não aceita woff2:** manter cópias TTF das fontes só para o OG.
- **Cabeçalho fixo cobrindo âncoras:** `scroll-margin-top` nas seções.
- **Pontos a confirmar na documentação:** a API atual do *content layer* e da Container API na versão estável do Astro, e as especificidades de `motion/react` com React 19. Consultar via Context7 quando estiver disponível.

### Conformidade com rules

A pasta `.claude/rules` não existe no projeto nem no diretório global do usuário, então não há rules a aplicar. Sugestão: depois do scaffold, criar rules para o padrão de ilhas (lógica em `src/lib`, mensagens por props) e para a escrita de conteúdo (tom de voz e limite de 3 frases por parágrafo do PRD).

### Conformidade com skills

A pasta `.claude/skills` não existe no projeto. As skills globais (`maestri*`) não se aplicam. Skills disponíveis na sessão que servem a esta spec:

- `run`: subir o site e verificar mudanças no app real.
- `code-review` e `simplify`: revisão de cada tarefa.
- `artifact-design` e `dataviz`: só como referência de design para os gráficos de custo e de classes.

### Arquivos relevantes e dependentes

- `tasks/prd-descomplica-aws/prd.md`: requisitos de origem.
- `astro.config.mjs`, `tsconfig.json`, `package.json`, `vitest.config.ts`, `playwright.config.ts`, `lighthouserc.json` e `.github/workflows/ci.yml`.
- `src/content.config.ts`, `src/content/sections/s3/{pt-br,en}/*.mdx` e `src/content/glossary/{pt-br,en}.yaml`.
- `src/data/services.ts` e `src/data/pricing.ts`.
- `src/pages/index.astro`, `src/pages/en/index.astro`, `src/pages/[service].astro`, `src/pages/en/[service].astro`, `src/pages/og/[locale]/[service].png.ts` e `src/pages/404.astro`.
- `src/components/layout/*`, `src/components/sections/*`, `src/components/ui/*` e `src/components/interactive/s3/*`.
- `src/lib/s3/*`, `src/lib/i18n/*`, `src/lib/content/*`, `src/lib/nav/section-observer.ts`, `src/lib/analytics.ts` e `src/lib/og/render.ts`.
- `src/styles/global.css`.
- `tests/unit/**`, `tests/integration/**` e `tests/e2e/**`.
- `README.md`: propósito, stack e como rodar (RNF-07).
