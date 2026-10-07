export interface AnchoredSection {
  key: string;
  anchor: string;
}

export type AnchorMap = Record<string, string>;

// Sections are matched by their stable `key`, since anchors are translated.
export function mapAnchors(
  from: readonly AnchoredSection[],
  to: readonly AnchoredSection[],
): AnchorMap {
  const anchorByKey = new Map(to.map((section) => [section.key, section.anchor]));
  return Object.fromEntries(
    from.flatMap((section) => {
      const target = anchorByKey.get(section.key);
      return target === undefined ? [] : [[section.anchor, target]];
    }),
  );
}

export function parseAnchorMap(serialized: string | undefined): AnchorMap {
  if (!serialized) return {};
  try {
    const parsed: unknown = JSON.parse(serialized);
    if (typeof parsed !== 'object' || parsed === null) return {};
    return Object.fromEntries(
      Object.entries(parsed).filter(
        (entry): entry is [string, string] => typeof entry[1] === 'string',
      ),
    );
  } catch {
    return {};
  }
}

export function translateHref(href: string, currentAnchor: string, anchorMap: AnchorMap): string {
  const [path = href] = href.split('#');
  if (!Object.hasOwn(anchorMap, currentAnchor)) return path;
  return `${path}#${anchorMap[currentAnchor]}`;
}
