// Shared Tailwind class lists, so the eight islands look like one system.
export const primaryButtonClass =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-bg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50';

export const secondaryButtonClass =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-medium transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50';

export const inputClass =
  'mt-1 block min-h-11 w-full rounded-lg border border-border bg-bg px-3 font-mono text-sm';

export const labelClass = 'block text-sm font-medium';

export const hintClass = 'text-sm text-muted';

// For a visually hidden input inside a label: the label shows the keyboard focus instead.
export const focusWithinClass =
  'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--focus-ring)]';
