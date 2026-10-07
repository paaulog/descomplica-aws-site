# Descomplica AWS

Documentação interativa e bilíngue (português e inglês) que explica os serviços principais da AWS de um jeito visual, amigável e prático. A v1 cobre o **Amazon S3**; EC2, Lambda e VPC vêm nas próximas fases.

**No ar:** <https://paaulog.github.io/descomplica-aws-site/> · [English](https://paaulog.github.io/descomplica-aws-site/en/)

> Projeto independente, sem vínculo com a Amazon Web Services.

## Por que existe

A documentação oficial da AWS é completa, mas intimida quem está começando. Aqui cada serviço vira uma página única de scroll que vai do "o que é" ao "como usar": analogias do dia a dia, um conceito por vez e simulações que rodam no navegador. Nenhuma simulação chama a AWS de verdade.

O projeto também é peça de portfólio: o código, os testes e o acabamento fazem parte da entrega.

## Stack

| Camada     | Escolha                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------- |
| Site       | [Astro 7](https://astro.build) estático, com ilhas React 19 hidratadas só quando aparecem na tela |
| Conteúdo   | MDX, um arquivo por seção e por idioma, validado por content collections com Zod                  |
| Estilo     | Tailwind CSS v4 com tokens em CSS, tema claro e escuro                                            |
| Animação   | Motion (`motion/react`) só dentro das ilhas; revelação no scroll em CSS                           |
| Código     | Expressive Code, com abas JS/Python e botão de copiar                                             |
| Imagens OG | Satori + resvg, geradas no build (1200×630, por página e idioma)                                  |
| Testes     | Vitest (unitário e integração), Playwright (E2E), axe e Lighthouse CI                             |
| Deploy     | GitHub Pages (via GitHub Actions); também roda na Vercel, com Vercel Web Analytics (sem cookies)  |

A lógica dos simuladores (chaves, classes de armazenamento, custo, versões, acesso e ciclo de vida) mora em `src/lib/s3`, em TypeScript puro e sem DOM. As ilhas só cuidam de apresentação. Os preços ficam em `src/data/pricing.ts`, com a data de verificação na fonte oficial.

## Como rodar

Precisa de **Node.js 22** (veja `.nvmrc`) e npm.

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # gera o site estático em dist/
npm run preview    # serve o dist/
```

## Como testar

```bash
npm run lint              # ESLint + Prettier
npm run check             # astro check (tipos)
npm test                  # unitários e integração (inclui um astro build real)
npm run test:e2e:full     # build + Playwright: desktop e mobile de 360 px, com axe
npm run test:lighthouse   # Lighthouse CI no mobile e no desktop (precisa do build)
```

A CI do GitHub Actions roda tudo isso a cada push e pull request. Localmente, o Lighthouse precisa do Chrome; dá para usar o do Playwright com `CHROME_PATH`.

## Estrutura

```
src/
  content/sections/<serviço>/<idioma>/NN-<key>.mdx   # uma seção por arquivo
  content/glossary/<idioma>.yaml                     # termos do <Term id>
  components/
    layout/        # cabeçalho, rodapé, tema, idioma e nav em traços
    sections/      # moldes usados no MDX (Hero, Analogy, Card, Steps, Summary...)
    interactive/   # ilhas React de cada serviço
    ui/            # Term (tooltip), CodeTabs, ServiceCard
  data/            # services.ts, pricing.ts, author.ts
  lib/             # lógica pura: s3, i18n, conteúdo, nav, OG, analytics
  pages/           # rotas finas: home, serviço, OG, robots.txt e 404
tests/             # unit, integration e e2e
```

## Como adicionar um serviço

1. Crie as seções em `src/content/sections/<serviço>/pt-br/` e `.../en/`, com a mesma `key` e `order` nos dois idiomas e uma `anchor` localizada. O build falha se os idiomas divergirem.
2. Adicione os termos novos aos dois glossários e marque a primeira aparição com `<Term id="...">`.
3. Em `src/data/services.ts`, mude o `status` do serviço para `active`. A rota, o sitemap e a imagem OG passam a existir sozinhos.
4. Se o serviço tiver simuladores, coloque a lógica em `src/lib/<serviço>/`, as ilhas em `src/components/interactive/<serviço>/` e as mensagens em `src/lib/i18n/ui.ts`. Depois crie um wrapper como o `S3Island.astro` e registre-o em `src/components/mdx-components.ts`.
5. Se tiver preços, guarde os valores conferidos na fonte oficial em `src/data/`, com a data de verificação.

## Autor

Feito por Paulo Gomes · [LinkedIn](https://www.linkedin.com/in/paulogomesff/) · [GitHub](https://github.com/paaulog)
