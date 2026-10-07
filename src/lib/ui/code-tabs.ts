import {
  isCodeLanguage,
  readStoredCodeLanguage,
  saveCodeLanguage,
  CODE_LANGUAGE_STORAGE_KEY,
  type CodeLanguage,
} from '../code/code-language';

const GROUP_SELECTOR = '[data-code-tabs]';

// Horizontal tablist: only left and right move between tabs, as in the WAI-ARIA Tabs pattern.
const tabStep: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 };

function getTabs(group: Element): HTMLButtonElement[] {
  return [...group.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
}

function selectInGroup(group: Element, language: CodeLanguage): void {
  const tabs = getTabs(group);
  if (!tabs.some((tab) => tab.dataset.codeLang === language)) return;
  for (const tab of tabs) {
    const selected = tab.dataset.codeLang === language;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    const panel = document.getElementById(tab.getAttribute('aria-controls') ?? '');
    panel?.removeAttribute('data-inactive');
    if (panel) panel.hidden = !selected;
  }
}

// Every block on the page follows the last choice, like the reader picked a language once.
function selectEverywhere(language: CodeLanguage): void {
  for (const group of document.querySelectorAll(GROUP_SELECTOR)) selectInGroup(group, language);
}

function chooseLanguage(language: CodeLanguage): void {
  selectEverywhere(language);
  saveCodeLanguage(language);
}

function findKeyboardTarget(
  tabs: HTMLButtonElement[],
  current: number,
  key: string,
): HTMLButtonElement | undefined {
  if (key === 'Home') return tabs[0];
  if (key === 'End') return tabs.at(-1);
  const step = Object.hasOwn(tabStep, key) ? tabStep[key] : undefined;
  if (step === undefined) return undefined;
  return tabs[(current + step + tabs.length) % tabs.length];
}

function bindGroup(group: Element): void {
  const tabs = getTabs(group);
  for (const [index, tab] of tabs.entries()) {
    tab.addEventListener('click', () => {
      if (isCodeLanguage(tab.dataset.codeLang)) chooseLanguage(tab.dataset.codeLang);
    });
    tab.addEventListener('keydown', (event) => {
      const target = findKeyboardTarget(tabs, index, event.key);
      if (!target) return;
      event.preventDefault();
      target.focus();
      target.click();
    });
  }
}

export function setupCodeTabs(): void {
  for (const group of document.querySelectorAll(GROUP_SELECTOR)) bindGroup(group);
  const stored = readStoredCodeLanguage();
  if (stored) selectEverywhere(stored);
  window.addEventListener('storage', (event) => {
    if (event.key === CODE_LANGUAGE_STORAGE_KEY && isCodeLanguage(event.newValue)) {
      selectEverywhere(event.newValue);
    }
  });
}
