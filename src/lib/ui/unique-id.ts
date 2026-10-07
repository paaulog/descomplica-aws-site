let counter = 0;

// Ids only need to be unique within a page; a build-wide counter guarantees that.
export function generateUniqueId(prefix: string): string {
  counter += 1;
  return `${prefix}-${counter}`;
}
