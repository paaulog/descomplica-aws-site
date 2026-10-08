// A thin horizontal line 30% down the viewport: the section crossing it is the one being read.
const ACTIVE_LINE_MARGIN = '-30% 0px -69% 0px';

export function pickActiveSection(
  ids: readonly string[],
  intersecting: ReadonlySet<string>,
): string | undefined {
  return ids.find((id) => intersecting.has(id));
}

export function createSectionObserver(
  ids: string[],
  onChange: (activeId: string) => void,
): () => void {
  const elements = ids
    .map((id) => document.getElementById(id))
    .filter((element): element is HTMLElement => element !== null);
  if (elements.length === 0) return () => {};
  const intersecting = new Set<string>();
  let activeId: string | undefined;
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) intersecting.add(entry.target.id);
        else intersecting.delete(entry.target.id);
      }
      const nextId = pickActiveSection(ids, intersecting);
      if (nextId === undefined || nextId === activeId) return;
      activeId = nextId;
      onChange(nextId);
    },
    { rootMargin: ACTIVE_LINE_MARGIN },
  );
  for (const element of elements) observer.observe(element);
  return () => observer.disconnect();
}
