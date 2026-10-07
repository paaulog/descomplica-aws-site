import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { glossarySchema, sectionSchema } from './lib/content/schemas';

const sections = defineCollection({
  // id = caminho sem extensão (`s3/pt-br/01-hero`); serviço e idioma vêm das pastas.
  loader: glob({
    // Só `<service>/<locale>/<arquivo>.mdx`: subpastas (rascunhos etc.) ficam fora.
    pattern: '*/*/*.mdx',
    base: './src/content/sections',
    generateId: ({ entry }) => entry.replace(/\.mdx$/, ''),
  }),
  schema: sectionSchema,
});

const glossary = defineCollection({
  // Um arquivo por idioma; o id é o idioma (`pt-br`, `en`).
  loader: glob({
    pattern: '*.yaml',
    base: './src/content/glossary',
    generateId: ({ entry }) => entry.replace(/\.yaml$/, ''),
  }),
  schema: glossarySchema,
});

export const collections = { sections, glossary };
