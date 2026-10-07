import { z } from 'astro/zod';
import { serviceIds } from '../../data/services';

// Upper bound for `order` in any service; S3 uses all 18 slots.
export const MAX_SECTION_ORDER = 18;
export const NAV_LABEL_MAX = 28;
export const DEFINITION_MAX = 160;

// Single hyphens only, so `--` stays free as a separator for derived ids (`<anchor>--heading`).
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const createSlugSchema = (field: string) =>
  z
    .string()
    .regex(
      SLUG_PATTERN,
      `${field} deve ser slug: só minúsculas, números e hífens (ex.: "meu-slug")`,
    );

export const sectionBlocks = ['what', 'why', 'how', 'wrap'] as const;

export const sectionSchema = z.object({
  service: z.enum(serviceIds),
  key: createSlugSchema('key'),
  order: z.number().int().min(1).max(MAX_SECTION_ORDER),
  block: z.enum(sectionBlocks),
  anchor: createSlugSchema('anchor'),
  title: z.string().min(1),
  navLabel: z.string().min(1).max(NAV_LABEL_MAX),
  summary: z.string().min(1),
});

export type SectionData = z.infer<typeof sectionSchema>;

export const glossarySchema = z.record(
  createSlugSchema('glossary key'),
  z.object({
    term: z.string().min(1),
    definition: z.string().min(1).max(DEFINITION_MAX),
  }),
);

export type GlossaryData = z.infer<typeof glossarySchema>;
