import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { glossarySchema, sectionSchema } from './lib/content/schemas';

const sections = defineCollection({
  loader: glob({
    // Only `<service>/<locale>/<file>.mdx`: deeper folders (drafts etc.) are ignored.
    pattern: '*/*/*.mdx',
    base: './src/content/sections',
    generateId: ({ entry }) => entry.replace(/\.mdx$/, ''),
  }),
  schema: sectionSchema,
});

const glossary = defineCollection({
  loader: glob({
    pattern: '*.yaml',
    base: './src/content/glossary',
    generateId: ({ entry }) => entry.replace(/\.yaml$/, ''),
  }),
  schema: glossarySchema,
});

export const collections = { sections, glossary };
