# Tarefa 2.0: Design system, layout e navegação

## Visão geral

Construir a identidade visual e toda a casca do site. Isso inclui os tokens e o tema claro e escuro, o layout base com cabeçalho e rodapé, a home com os cartões de serviço e a página de serviço que monta as seções. Inclui também os componentes de conteúdo usados no MDX (moldes, `Term`, `CodeTabs`) e a navegação em traços com a barra de progresso. Ao final, a página `/s3/` funciona de ponta a ponta com o conteúdo semente, nos dois idiomas, no desktop e no mobile.

<skills>
### Conformidade com skills

A pasta `.claude/skills` não existe no projeto. Skills da sessão que se aplicam:

- `run`: ver o layout, o tema e a navegação no app real, no desktop e em 360 px.
- `code-review` e `simplify`: revisar a tarefa antes de fechar.
</skills>

<requirements>
- RF-01: a home lista os serviços em cartões. O S3 é link; os cartões "em breve" não são links.
- RF-02: `ServicePage` renderiza as seções na ordem de `order`, cada uma dentro de `SectionShell`.
- RF-03: o indicador em traços mostra a seção atual, exibe o nome ao passar o mouse e rola até a seção ao clicar. No mobile, vira uma barra fina com lista expansível.
- RF-04: cada seção tem um `id` igual à `anchor` e um link âncora copiável.
- RF-05: tema claro e escuro, que segue o sistema por padrão, com alternância manual persistida em `da:theme` e sem piscar o tema errado.
- RF-06: `Term` abre a definição por hover, foco e toque e fecha com Esc.
- RF-07: `CodeTabs` com abas JS/Python no padrão WAI-ARIA, botão de copiar e a linguagem escolhida salva e sincronizada (`da:code-lang`).
- A troca de idioma leva para a mesma seção no outro idioma (mapeamento pela `key`).
- Rodapé com o aviso de projeto independente, sem a identidade visual oficial da AWS.
- RNF-01, RNF-03 e RNF-05: responsivo a partir de 360 px, navegação por teclado, contraste adequado, `prefers-reduced-motion` respeitado e animações só com `transform` e `opacity`.
</requirements>

## Subtarefas

- [ ] 2.1 Criar os tokens em `src/styles/global.css` (base neutra, destaque por serviço em `[data-service]`, `@custom-variant dark` sobre `[data-theme="dark"]`) e as fontes auto-hospedadas via Fontsource (sans variável e mono).
- [ ] 2.2 Criar o `BaseLayout.astro` com o `<head>` (canonical, `hreflang`, metatags OG e Twitter preparadas para a 4.0), o script inline de tema, o link "pular para o conteúdo", o cabeçalho e o rodapé.
- [ ] 2.3 Criar `SiteHeader`, `ThemeToggle` e `LanguageSwitcher`, este com o mapeamento de âncora pela `key`.
- [ ] 2.4 Criar `ServiceCard`, `HomePage` (pt-BR e en) e o `404.astro` bilíngue.
- [ ] 2.5 Criar `ServicePage`, `SectionShell` (com `scroll-margin-top`, link âncora copiável e classe de revelação via CSS e `IntersectionObserver`) e os moldes `Hero`, `Analogy`, `SmallWin`, `NextHook` e `Summary`.
- [ ] 2.6 Criar `Term.astro` com a Popover API e `@floating-ui/dom`, num script compartilhado. Um `<Term id>` inexistente quebra o build.
- [ ] 2.7 Criar `CodeTabs.astro` sobre o Expressive Code, com abas acessíveis e sincronização da linguagem.
- [ ] 2.8 Criar `src/lib/nav/section-observer.ts` e `SectionNav.astro` (traços no desktop, barra e lista no mobile, progresso de leitura).
- [ ] 2.9 Escrever os testes unitários, de integração e E2E desta tarefa.

## Detalhes de implementação

- Componentes de layout, seções e UI: techspec.md › Visão dos componentes (Layout, Seções, UI).
- Assinatura de `createSectionObserver`: techspec.md › Principais interfaces.
- Preferências em `localStorage` (`da:theme`, `da:code-lang`): techspec.md › Fluxo de dados.
- Decisões sobre a Popover API, o nav em TS puro, a revelação por CSS e o Tailwind v4: techspec.md › Principais decisões.
- Identidade visual, tom e navegação: prd.md › Experiência, navegação e design.
- Riscos de cabeçalho fixo cobrindo âncoras e de animação travando no mobile: techspec.md › Riscos conhecidos.

## Critérios de sucesso

- `/s3/` e `/en/s3/` renderizam todas as seções semente na ordem, com o nav em traços funcionando no desktop e em 360 px.
- Não há piscada de tema errado ao recarregar com o tema escuro salvo.
- O site inteiro é operável só pelo teclado, com foco visível.
- Com JavaScript desativado, o texto continua legível e a navegação por âncoras continua funcionando.
- O nav e o `Term` não hidratam React: zero JS de framework nas páginas sem ilhas.

## Testes da tarefa

- [ ] Testes unitários
  - `section-observer`: escolhe a seção ativa com várias visíveis ao mesmo tempo, faz a limpeza (função de retorno) e lida com a lista vazia. Usa mock de `IntersectionObserver`.
  - Lógica de tema: lê `da:theme`, cai no `matchMedia` quando não há valor salvo e grava ao alternar. Usa mock de `matchMedia`.
  - Mapeamento da troca de idioma: `anchor` de pt-BR → `key` → `anchor` de en, e de volta.
- [ ] Testes de integração (Container API)
  - `ServicePage`: as `<section>` aparecem na ordem, os `id` são iguais às âncoras e cada uma tem `aria-labelledby`.
  - `BaseLayout`: `<html lang>` correto, `hreflang` recíprocos e canonical.
  - `HomePage`: o cartão S3 é `<a>` e os cartões "em breve" não são links.
  - O build falha com um `<Term id>` inexistente.
- [ ] Testes E2E (desktop e mobile com 360 px)
  - Da home, o cartão S3 leva à página. Os cartões "em breve" não navegam.
  - Clicar num traço rola até a seção e atualiza o hash. O traço ativo muda com o scroll. No mobile, a barra abre a lista de seções.
  - Um link direto com âncora cai na seção certa, sem ficar escondida pelo cabeçalho.
  - O tema respeita o `colorScheme` emulado e a escolha manual persiste após recarregar.
  - A troca de idioma mantém a seção atual.
  - O `Term` abre por hover, toque e foco e fecha com Esc.
  - As abas de código trocam de linguagem, sincronizam entre blocos, e o botão de copiar coloca o texto na área de transferência.
  - Com movimento reduzido emulado, não há animação de revelação.

## Arquivos relevantes

- `src/styles/global.css`
- `src/components/layout/BaseLayout.astro`, `SiteHeader.astro`, `ThemeToggle.astro`, `LanguageSwitcher.astro`, `SectionNav.astro`
- `src/components/sections/ServicePage.astro`, `SectionShell.astro`, `Hero.astro`, `Analogy.astro`, `SmallWin.astro`, `NextHook.astro`, `Summary.astro`
- `src/components/ui/Term.astro`, `CodeTabs.astro`, `ServiceCard.astro`
- `src/components/HomePage.astro`, `src/pages/404.astro`
- `src/lib/nav/section-observer.ts`
- `tests/unit/nav/**`, `tests/unit/theme/**`, `tests/integration/render/**`, `tests/e2e/navigation.spec.ts`, `tests/e2e/preferences.spec.ts`, `tests/e2e/terms-code.spec.ts`
