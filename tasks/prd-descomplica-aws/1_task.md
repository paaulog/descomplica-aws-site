# Tarefa 1.0: Base do projeto, i18n e pipeline de conteúdo

## Visão geral

Criar o projeto Astro do zero, com toda a cadeia de ferramentas, CI e deploy de preview. Montar também a fundação bilíngue (pt-BR padrão, sem prefixo, e en em `/en`) e o pipeline de conteúdo validado por Zod. Ao final, existe um site estático publicado na Vercel com rotas vazias, mas tipadas e testadas. Qualquer conteúdo inválido ou fora de paridade entre os idiomas quebra o build.

<skills>
### Conformidade com skills

A pasta `.claude/skills` não existe no projeto. Skills da sessão que se aplicam:

- `run`: subir o `astro dev` e o `astro preview` e conferir as rotas.
- `code-review` e `simplify`: revisar a tarefa antes de fechar.
</skills>

<requirements>
- Node.js 22 LTS. Repositório Git iniciado e publicado no GitHub.
- Astro com `output: 'static'`, TypeScript estrito e as integrações listadas em techspec.md › Configuração e build.
- i18n nativo do Astro: `defaultLocale: 'pt-br'`, `locales: ['pt-br', 'en']`, `prefixDefaultLocale: false`.
- Coleções `sections` (MDX) e `glossary` (YAML) com os schemas de techspec.md › Modelos de dados.
- `services.ts` com S3 `active` e EC2, Lambda e VPC `soon`.
- Serviços "em breve" não geram rota.
- O build falha com schema inválido, paridade quebrada ou serviço ativo sem conteúdo.
- O CI roda lint, `astro check`, testes unitários, testes de integração, build e E2E de fumaça.
- Projeto ligado à Vercel, com preview por PR e produção na branch principal (RNF-06).
</requirements>

## Subtarefas

- [ ] 1.1 Iniciar o repositório Git, o `.gitignore` e o projeto Astro com TS estrito. Adicionar `@astrojs/react`, `@astrojs/mdx`, `@astrojs/sitemap`, `astro-expressive-code` e Tailwind v4 via `@tailwindcss/vite`.
- [ ] 1.2 Configurar ESLint e Prettier (com os plugins de Astro e Tailwind) e os scripts do `package.json`: `dev`, `build`, `preview`, `check`, `lint`, `test`, `test:e2e`.
- [ ] 1.3 Configurar o Vitest (projetos `unit` e `integration`, ambiente happy-dom para componentes) e o Playwright (projetos desktop Chromium e mobile com 360 px e toque, rodando contra `astro preview`).
- [ ] 1.4 Criar o workflow `.github/workflows/ci.yml` com lint, check, testes, build e E2E.
- [ ] 1.5 Implementar `src/lib/i18n/ui.ts`, `routes.ts` (`localizedPath` e alternates) e `format.ts` (moeda e bytes via `Intl`).
- [ ] 1.6 Implementar `src/data/services.ts` e `src/content.config.ts` com as coleções `sections` e `glossary`.
- [ ] 1.7 Implementar `src/lib/content/` com `getServiceSections` e `assertLocaleParity`. A paridade roda no build.
- [ ] 1.8 Criar as rotas finas: `index.astro`, `en/index.astro`, `[service].astro` e `en/[service].astro` (`getStaticPaths` só para os ativos). Criar conteúdo semente mínimo do S3 (uma seção por idioma) para validar o pipeline.
- [ ] 1.9 Ligar o repositório à Vercel e confirmar o deploy de preview.
- [ ] 1.10 Escrever os testes unitários e de integração desta tarefa e o E2E de fumaça.

## Detalhes de implementação

- Configuração, rotas e estrutura de pastas: techspec.md › Visão dos componentes (Configuração e build, Rotas).
- Assinaturas de `getServiceSections`, `assertLocaleParity` e `localizedPath`: techspec.md › Principais interfaces.
- Frontmatter de seção, serviço e glossário: techspec.md › Modelos de dados.
- Rotas geradas: techspec.md › Endpoints da API.
- Erros de build intencionais: techspec.md › Pontos de integração (Tratamento de erros).
- O `site` do `astro.config.mjs` usa o subdomínio da Vercel até a decisão de domínio, prevista na 4.0.
- A API do content layer na versão estável do Astro precisa ser confirmada (techspec.md › Riscos conhecidos).

## Critérios de sucesso

- `astro check`, `astro build` e todo o pipeline de CI passam sem erros nem avisos.
- `GET /`, `/en/`, `/s3/` e `/en/s3/` existem no build. `/ec2/` não existe.
- Remover uma seção de um idioma, duplicar um `order` ou violar o schema faz o build falhar com uma mensagem clara.
- O deploy de preview da Vercel abre as quatro rotas.

## Testes da tarefa

- [ ] Testes unitários
  - `ui.ts`: as chaves dos dois idiomas são idênticas.
  - `localizedPath`: pt-BR sem prefixo, en com `/en`, alternates corretos, barras finais.
  - `format.ts`: BRL em pt-BR, USD em en e bytes formatados em KB, MB e GB.
  - `services.ts`: ids únicos, `order` único e só os status permitidos.
- [ ] Testes de integração
  - A paridade passa com o conteúdo semente e falha com fixtures quebradas (seção faltando, `key` divergente, `order` duplicado, `anchor` repetida).
  - O schema Zod rejeita `navLabel` com mais de 28 caracteres, `block` inválido e `definition` com mais de 160 caracteres.
  - O build gera só as rotas dos serviços ativos.
- [ ] Testes E2E
  - Fumaça: `/` e `/en/` respondem 200 e o `<html lang>` está correto.

## Arquivos relevantes

- `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`, `.prettierrc`, `eslint.config.js`
- `vitest.config.ts`, `playwright.config.ts`, `.github/workflows/ci.yml`
- `src/content.config.ts`, `src/data/services.ts`
- `src/lib/i18n/ui.ts`, `src/lib/i18n/routes.ts`, `src/lib/i18n/format.ts`, `src/lib/content/*`
- `src/pages/index.astro`, `src/pages/en/index.astro`, `src/pages/[service].astro`, `src/pages/en/[service].astro`
- `src/content/sections/s3/{pt-br,en}/` (semente)
- `tests/unit/i18n/**`, `tests/integration/content/**`, `tests/e2e/smoke.spec.ts`
