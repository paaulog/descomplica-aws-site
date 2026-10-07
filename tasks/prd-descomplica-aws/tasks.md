# Resumo das tarefas de implementação de Descomplica AWS (v1: Fundação + S3)

Fontes: [prd.md](prd.md) e [techspec.md](techspec.md).

## Tarefas

- [ ] 1.0 Base do projeto, i18n e pipeline de conteúdo
- [ ] 2.0 Design system, layout e navegação
- [ ] 3.0 Lógica pura do S3, preços e ilhas interativas
- [ ] 4.0 Conteúdo bilíngue, distribuição e lançamento

## Dependências

```
1.0 ──► 2.0 ──► 4.0
  └───► 3.0 ──┘
```

- A 3.0 pode começar logo depois da 1.0, em paralelo com a 2.0. Para encaixar as ilhas nas páginas (subtarefa 3.10), a 2.0 precisa estar pronta.
- A 4.0 depende da 2.0 (moldes, `Term`, `CodeTabs`) e da 3.0 (ilhas usadas no MDX).
