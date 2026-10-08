// typescript-eslint runs plain TypeScript, which cannot read .astro files; astro check keeps the real types.
declare module '*.astro' {
  import type { AstroComponentFactory } from 'astro/runtime/server/index.js';

  const component: AstroComponentFactory;
  export default component;
}
