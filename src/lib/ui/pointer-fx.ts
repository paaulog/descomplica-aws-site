const FINE_POINTER_QUERY = '(hover: hover) and (pointer: fine)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const MAX_TILT_DEGREES = 6;
const PERCENT = 100;
const CENTER = 0.5;

interface Point {
  x: number;
  y: number;
}

interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface PointerFx {
  /** Pointer position inside the box, in percent. */
  x: number;
  y: number;
  /** Tilt that leans the surface toward the pointer. */
  tiltX: number;
  tiltY: number;
}

export function computePointerFx(point: Point, box: Box, maxTilt = MAX_TILT_DEGREES): PointerFx {
  const x = ((point.x - box.left) / box.width) * PERCENT;
  const y = ((point.y - box.top) / box.height) * PERCENT;
  return {
    x,
    y,
    tiltX: (CENTER - y / PERCENT) * 2 * maxTilt,
    tiltY: (x / PERCENT - CENTER) * 2 * maxTilt,
  };
}

function applyFx(element: HTMLElement, fx: PointerFx): void {
  element.style.setProperty('--mx', `${fx.x}%`);
  element.style.setProperty('--my', `${fx.y}%`);
  if (element.hasAttribute('data-tilt')) {
    element.style.setProperty('--rx', `${fx.tiltX}deg`);
    element.style.setProperty('--ry', `${fx.tiltY}deg`);
  }
}

function resetFx(element: HTMLElement): void {
  for (const name of ['--mx', '--my', '--rx', '--ry']) element.style.removeProperty(name);
}

/** Cursor light and tilt for `[data-spot]` / `[data-tilt]` surfaces; skipped on touch and reduced motion. */
export function setupPointerFx(): void {
  const canHover = window.matchMedia(FINE_POINTER_QUERY).matches;
  if (!canHover || window.matchMedia(REDUCED_MOTION_QUERY).matches) return;
  let active: HTMLElement | null = null;
  document.addEventListener(
    'pointermove',
    (event) => {
      const target = (event.target as Element).closest<HTMLElement>('[data-spot]');
      if (active && active !== target) resetFx(active);
      active = target;
      if (target) applyFx(target, computePointerFx(event, target.getBoundingClientRect()));
    },
    { passive: true },
  );
}
