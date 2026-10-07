import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import type { SectionLike } from '../../../src/lib/content/parity';
import { sectionSchema } from '../../../src/lib/content/schemas';

/**
 * Lê as seções MDX de uma pasta como o loader `glob` do content.config.ts faz:
 * só `<service>/<locale>/<arquivo>.mdx`, id = caminho relativo sem extensão e frontmatter
 * validado pelo mesmo schema Zod.
 */
export function loadSections(base: string): SectionLike[] {
  const files = readdirSync(base, { recursive: true, encoding: 'utf8' }).filter(
    (file) => file.endsWith('.mdx') && file.split(/[\\/]/).length === 3,
  );
  return files.map((file) => {
    const source = readFileSync(join(base, file), 'utf8');
    const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source)?.[1];
    if (frontmatter === undefined) throw new Error(`${file}: sem frontmatter`);
    return {
      id: file.replaceAll('\\', '/').replace(/\.mdx$/, ''),
      data: sectionSchema.parse(parse(frontmatter)),
    };
  });
}
