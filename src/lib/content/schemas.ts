import { z } from 'astro/zod';
import { serviceIds } from '../../data/services';

export const MAX_SECTIONS = 18;
export const NAV_LABEL_MAX = 28;
export const DEFINITION_MAX = 160;

const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'use só minúsculas, números e hífens (ex.: "meu-slug")');

export const sectionBlocks = ['what', 'why', 'how', 'wrap'] as const;

/** Frontmatter de `src/content/sections/<service>/<locale>/NN-<key>.mdx`. O idioma vem da pasta. */
export const sectionSchema = z.object({
  service: z.enum(serviceIds),
  key: slug,
  order: z.number().int().min(1).max(MAX_SECTIONS),
  block: z.enum(sectionBlocks),
  anchor: slug,
  title: z.string().min(1),
  navLabel: z.string().min(1).max(NAV_LABEL_MAX),
  summary: z.string().min(1),
});

export type SectionData = z.infer<typeof sectionSchema>;

/** `src/content/glossary/<locale>.yaml`: mapa `key → { term, definition }`. */
export const glossarySchema = z.record(
  slug,
  z.object({
    term: z.string().min(1),
    definition: z.string().min(1).max(DEFINITION_MAX),
  }),
);
