# Tarefa 4.0: Conteúdo bilíngue, distribuição e lançamento

## Visão geral

Escrever as 18 seções da página do S3 em pt-BR e em en, com os glossários dos dois idiomas, encaixando as ilhas e os moldes nos pontos certos. Depois, preparar a distribuição (imagens OG, sitemap, `robots.txt`, analytics) e endurecer a qualidade com axe e Lighthouse CI. Por fim, documentar o projeto no README e publicar em produção. Ao final, a v1 está no ar e pronta para o post no LinkedIn.

<skills>
### Conformidade com skills

A pasta `.claude/skills` não existe no projeto. Skills da sessão que se aplicam:

- `run`: ler a página inteira no app real, nos dois idiomas, e validar o critério de saída da fase.
- `code-review` e `simplify`: revisar a tarefa antes de fechar.
</skills>

<requirements>
- RF-02: 18 seções por idioma, na ordem e nos blocos definidos em prd.md › Estrutura de conteúdo do S3.
- Cada seção segue a estrutura de dor ou pergunta, explicação, analogia ou exemplo e visual ou interação. Termina com um gancho (`NextHook`) e, quando fizer sentido, com uma pequena vitória (`SmallWin`).
- Tom de voz e legibilidade: parágrafos de até 3 frases e no máximo 3 parágrafos seguidos (prd.md › Tom de voz).
- Regra de exatidão: preços, limites e nomes de classes conferidos na fonte oficial, com a data de verificação visível. A seção 16 reflete o Free Plan.
- Exemplos de empresas só com fonte pública citada.
- RF-06: termos técnicos marcados com `<Term>` na primeira aparição, com a definição nos dois glossários.
- RF-09: o resumo visual final linka para o próximo serviço ("em breve") e para o LinkedIn e o GitHub do autor.
- RF-10: imagem OG de 1200×630 por página e idioma, gerada no build.
- Sitemap, `robots.txt`, `hreflang` e Vercel Web Analytics ativos.
- RNF-02: Lighthouse ≥ 0,9 em performance, acessibilidade e SEO, no mobile e no desktop.
- RNF-03: axe sem violações serious ou critical.
- RNF-07: README com propósito, stack, como rodar, como testar e como adicionar um serviço.
</requirements>

## Subtarefas

- [ ] 4.1 Escrever as seções 1–5 em pt-BR (Bloco 1: O que é), com `UploadToBucket` e `KeyExplorer`.
- [ ] 4.2 Escrever as seções 6–8 em pt-BR (Bloco 2: Para que serve), com `FlowDiagram`.
- [ ] 4.3 Escrever as seções 9–15 em pt-BR (Bloco 3: Como utilizar), com `AccessLock`, `StorageClassSlider`, `VersionTimeline`, `LifecycleAnimation` e `CodeTabs` (JS e Python).
- [ ] 4.4 Escrever as seções 16–18 em pt-BR (Bloco 4: Fechamento), com `CostCalculator`, a data de verificação e o `Summary`.
- [ ] 4.5 Escrever o glossário em pt-BR e marcar os `<Term>` nas seções.
- [ ] 4.6 Traduzir as 18 seções e o glossário para en, com `anchor` localizada e a mesma `key` e `order`. Revisar o texto em inglês.
- [ ] 4.7 Implementar `src/lib/og/render.ts` (Satori + resvg, com fontes TTF só para o OG) e o endpoint `og/[locale]/[service].png.ts`. Apontar as metatags do `BaseLayout` para o PNG.
- [ ] 4.8 Configurar o sitemap e o `robots.txt` e adicionar `<Analytics />` no `BaseLayout`.
- [ ] 4.9 Adicionar `@axe-core/playwright` e o Lighthouse CI (`lighthouserc.json`) ao CI e corrigir o que reprovar.
- [ ] 4.10 Escrever o README.
- [ ] 4.11 Definir o domínio (ou manter o subdomínio da Vercel), atualizar o `site` e fazer o deploy de produção.
- [ ] 4.12 Fazer a leitura final completa nos dois idiomas, confrontando o texto com a documentação oficial (teste do autor do PRD).

## Detalhes de implementação

- Roteiro das 18 seções e regra de exatidão: prd.md › Estrutura de conteúdo do S3.
- Tom, legibilidade e princípios de experiência: prd.md › Tom de voz e Experiência, navegação e design.
- Frontmatter e glossário: techspec.md › Modelos de dados.
- OG, sitemap e analytics: techspec.md › Visão dos componentes (Rotas, Lógica e dados) e Pontos de integração.
- Alerta sobre o Free Plan e sobre a incompatibilidade do Satori com woff2: techspec.md › Riscos conhecidos.
- Lighthouse CI e axe: techspec.md › Testes E2E.

## Critérios de sucesso

- As 18 seções existem nos dois idiomas, passam na paridade e respeitam o tom e os limites de legibilidade.
- Todos os conceitos importantes têm pelo menos um visual ou interação.
- `/og/pt-br/s3.png` e `/og/en/s3.png` existem, medem 1200×630 e aparecem certos no Post Inspector do LinkedIn.
- O Lighthouse fica ≥ 0,9 em performance, acessibilidade e SEO, no mobile e no desktop, para a home e o S3, nos dois idiomas.
- O axe não encontra violações serious ou critical na home e no S3, nos dois idiomas e nos dois temas.
- O site está no ar em produção. O autor lê a página do começo ao fim, entende tudo sem outra fonte e sente vontade de testar o S3.

## Testes da tarefa

- [ ] Testes unitários
  - `og/render`: gera um buffer PNG com as dimensões corretas para cada idioma e usa o `title` e o `summary` da página.
- [ ] Testes de integração
  - Paridade completa: 18 seções por idioma, mesmo conjunto de `key` e `order` e `anchor` únicas.
  - Todo `<Term id>` existe no glossário do idioma e não há termo do glossário sem uso (aviso).
  - Limites: `navLabel` com até 28 caracteres e `definition` com até 160.
  - Container API: metatags OG e Twitter apontam para o PNG do idioma, e o `hreflang` é recíproco.
  - Build: os PNGs de OG existem e medem 1200×630. O sitemap inclui as quatro rotas e exclui as dos serviços "em breve".
- [ ] Testes E2E
  - Com o conteúdo final, refazer a navegação completa pelas 18 seções, no desktop e em 360 px.
  - A seção 16 mostra a data de verificação dos preços.
  - O resumo final tem links válidos para LinkedIn, GitHub e o próximo serviço.
  - axe: home e S3 × pt-BR e en × tema claro e escuro, sem violações serious ou critical.
  - Lighthouse CI ≥ 0,9 em performance, acessibilidade e SEO, no mobile e no desktop.

## Arquivos relevantes

- `src/content/sections/s3/pt-br/01-*.mdx` … `18-*.mdx`
- `src/content/sections/s3/en/01-*.mdx` … `18-*.mdx`
- `src/content/glossary/pt-br.yaml`, `src/content/glossary/en.yaml`
- `src/lib/og/render.ts`, `src/pages/og/[locale]/[service].png.ts`, `public/robots.txt`
- `src/components/layout/BaseLayout.astro`, `astro.config.mjs`
- `lighthouserc.json`, `.github/workflows/ci.yml`
- `README.md`
- `tests/integration/content/**`, `tests/integration/og/**`, `tests/e2e/a11y.spec.ts`, `tests/e2e/full-page.spec.ts`
