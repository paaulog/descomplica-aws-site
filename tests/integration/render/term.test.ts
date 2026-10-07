import { describe, expect, it } from 'vitest';
import Term from '@/components/ui/Term.astro';
import { GlossaryTermError } from '@/lib/content/glossary';
import { parseHtml, renderToHtml } from './render-page';

describe('Term', () => {
  it('liga o botão à definição do idioma da página', async () => {
    const document = parseHtml(
      await renderToHtml(Term, { url: '/en/s3/', props: { id: 'bucket' } }),
    );
    const trigger = document.querySelector('button[data-term-trigger]');
    const popoverId = trigger?.getAttribute('popovertarget') ?? '';
    const popover = document.getElementById(popoverId);
    expect(trigger?.textContent).toBe('bucket');
    expect(trigger?.getAttribute('aria-describedby')).toBe(popoverId);
    expect(popover?.getAttribute('popover')).toBe('auto');
    expect(popover?.textContent).toContain('globally unique name');
  });

  // The page build renders every Term, so this error is what stops `astro build`.
  it('quebra a renderização (e o build) com um id inexistente', async () => {
    await expect(
      renderToHtml(Term, { url: '/s3/', props: { id: 'termo-que-nao-existe' } }),
    ).rejects.toThrow(GlossaryTermError);
  });
});
