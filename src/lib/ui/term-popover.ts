import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';

export type ClickAction = 'show' | 'hide';

const POPOVER_GAP_PX = 8;
const VIEWPORT_PADDING_PX = 8;
// Lets the pointer travel from the term to the popover without closing it.
const HIDE_DELAY_MS = 150;

// Mouse users already opened it by hovering, so a click keeps it open; touch and keyboard toggle.
export function resolveClickAction(pointerType: string, wasOpen: boolean): ClickAction {
  if (pointerType === 'mouse') return 'show';
  return wasOpen ? 'hide' : 'show';
}

async function positionPopover(trigger: HTMLElement, popover: HTMLElement): Promise<void> {
  const { x, y } = await computePosition(trigger, popover, {
    strategy: 'fixed',
    placement: 'top',
    middleware: [offset(POPOVER_GAP_PX), flip(), shift({ padding: VIEWPORT_PADDING_PX })],
  });
  popover.style.left = `${x}px`;
  popover.style.top = `${y}px`;
}

function bindTerm(trigger: HTMLButtonElement, popover: HTMLElement): void {
  let hideTimer: number | undefined;
  let stopAutoUpdate = (): void => {};
  let pointerType = '';
  let wasOpenOnPointerDown = false;
  const isOpen = () => popover.matches(':popover-open');
  const show = () => {
    window.clearTimeout(hideTimer);
    if (!isOpen()) popover.showPopover();
  };
  const hide = () => {
    if (isOpen()) popover.hidePopover();
  };
  const scheduleHide = () => {
    window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(hide, HIDE_DELAY_MS);
  };
  const cancelHide = () => window.clearTimeout(hideTimer);
  popover.addEventListener('toggle', (event) => {
    stopAutoUpdate();
    if (event.newState !== 'open') return;
    stopAutoUpdate = autoUpdate(trigger, popover, () => void positionPopover(trigger, popover));
  });
  trigger.addEventListener('pointerenter', (event) => event.pointerType === 'mouse' && show());
  trigger.addEventListener(
    'pointerleave',
    (event) => event.pointerType === 'mouse' && scheduleHide(),
  );
  popover.addEventListener('pointerenter', cancelHide);
  popover.addEventListener('pointerleave', scheduleHide);
  trigger.addEventListener('focus', show);
  trigger.addEventListener('blur', scheduleHide);
  trigger.addEventListener('pointerdown', (event) => {
    pointerType = event.pointerType;
    wasOpenOnPointerDown = isOpen();
  });
  trigger.addEventListener('click', (event) => {
    // Replaces the native popovertarget toggle, which would close a popover that focus just opened.
    event.preventDefault();
    const action = resolveClickAction(pointerType, pointerType ? wasOpenOnPointerDown : isOpen());
    pointerType = '';
    if (action === 'show') show();
    else hide();
  });
}

export function setupTermPopovers(): void {
  for (const trigger of document.querySelectorAll<HTMLButtonElement>('[data-term-trigger]')) {
    const popover = trigger.popoverTargetElement;
    if (popover instanceof HTMLElement) bindTerm(trigger, popover);
  }
}
