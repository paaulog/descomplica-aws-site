// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createSectionObserver, pickActiveSection } from '@/lib/nav/section-observer';

class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  readonly observed: Element[] = [];
  readonly disconnect = vi.fn();

  constructor(readonly callback: IntersectionObserverCallback) {
    FakeIntersectionObserver.instances.push(this);
  }

  observe(element: Element): void {
    this.observed.push(element);
  }

  report(changes: Record<string, boolean>): void {
    const entries = Object.entries(changes).map(([id, isIntersecting]) => ({
      target: document.getElementById(id),
      isIntersecting,
    }));
    this.callback(entries as unknown as IntersectionObserverEntry[], this as never);
  }
}

const ids = ['abertura', 'o-problema', 'analogia'];

function getLatestObserver(): FakeIntersectionObserver {
  const observer = FakeIntersectionObserver.instances.at(-1);
  if (!observer) throw new Error('nenhum observer criado');
  return observer;
}

describe('createSectionObserver', () => {
  beforeEach(() => {
    FakeIntersectionObserver.instances = [];
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
    document.body.innerHTML = ids.map((id) => `<section id="${id}"></section>`).join('');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('observa todas as seções existentes', () => {
    createSectionObserver(ids, () => {});
    expect(getLatestObserver().observed.map((element) => element.id)).toEqual(ids);
  });

  it('escolhe a primeira seção na ordem quando várias estão visíveis', () => {
    const onChange = vi.fn();
    createSectionObserver(ids, onChange);
    getLatestObserver().report({ analogia: true, 'o-problema': true });
    expect(onChange).toHaveBeenLastCalledWith('o-problema');
  });

  it('só avisa quando a seção ativa muda', () => {
    const onChange = vi.fn();
    createSectionObserver(ids, onChange);
    const observer = getLatestObserver();
    observer.report({ abertura: true });
    observer.report({ analogia: true });
    observer.report({ analogia: false });
    expect(onChange.mock.calls).toEqual([['abertura']]);
  });

  it('mantém a última seção ativa quando nenhuma cruza a linha', () => {
    const onChange = vi.fn();
    createSectionObserver(ids, onChange);
    const observer = getLatestObserver();
    observer.report({ abertura: true });
    observer.report({ abertura: false });
    expect(onChange.mock.calls).toEqual([['abertura']]);
    observer.report({ analogia: true });
    expect(onChange).toHaveBeenLastCalledWith('analogia');
  });

  it('ignora ids sem elemento na página', () => {
    createSectionObserver(['abertura', 'nao-existe'], () => {});
    expect(getLatestObserver().observed.map((element) => element.id)).toEqual(['abertura']);
  });

  it('desconecta o observer na limpeza', () => {
    const cleanup = createSectionObserver(ids, () => {});
    cleanup();
    expect(getLatestObserver().disconnect).toHaveBeenCalledOnce();
  });

  it('lida com a lista vazia sem criar observer', () => {
    const cleanup = createSectionObserver([], () => {});
    expect(FakeIntersectionObserver.instances).toHaveLength(0);
    expect(() => cleanup()).not.toThrow();
  });
});

describe('pickActiveSection', () => {
  it('segue a ordem dos ids, não a ordem de chegada', () => {
    expect(pickActiveSection(ids, new Set(['analogia', 'abertura']))).toBe('abertura');
  });

  it('não escolhe nada quando nada está visível', () => {
    expect(pickActiveSection(ids, new Set())).toBeUndefined();
  });
});
