import { cleanup, render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { afterEach, beforeAll, beforeEach } from 'vitest';

export function mockReducedMotion(prefersReduced: boolean): void {
  const matchMedia = (query: string) => ({
    matches: prefersReduced && query.includes('reduce'),
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  });
  Object.defineProperty(window, 'matchMedia', { value: matchMedia, configurable: true });
}

/*
 * happy-dom rejects Animation.finished on cancel without marking it handled, as browsers do,
 * which floods the run with unhandled rejections. Without WAAPI, Motion animates in JS instead.
 */
function disableWebAnimations(): void {
  Reflect.deleteProperty(Element.prototype, 'animate');
}

// Every suite starts with motion allowed and a clean DOM.
export function setupIslandTests(): void {
  beforeAll(disableWebAnimations);
  beforeEach(() => mockReducedMotion(false));
  afterEach(cleanup);
}

export function renderIsland(element: ReactElement): RenderResult & { user: UserEvent } {
  return { user: userEvent.setup(), ...render(element) };
}

export function getIslandRoot(container: HTMLElement): HTMLElement {
  const root = container.querySelector<HTMLElement>('[data-island]');
  if (!root) throw new Error('ilha não renderizada');
  return root;
}

// An entering Motion element always carries an inline opacity; the still path never writes one.
export function countAnimatedElements(container: HTMLElement): number {
  return [...container.querySelectorAll<HTMLElement>('[style]')].filter(
    (element) => element.style.opacity !== '',
  ).length;
}
