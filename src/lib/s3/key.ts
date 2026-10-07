export const MAX_KEY_BYTES = 1024;
const DELIMITER = '/';

export type KeyError = 'empty' | 'tooLong';
export type KeyWarning = 'leadingSlash' | 'doubleSlash' | 'trailingSlash';

export interface KeyParseResult {
  valid: boolean;
  errors: KeyError[];
  warnings: KeyWarning[];
  byteLength: number;
  segments: string[];
  prefixes: string[];
  fileName: string;
}

const encoder = new TextEncoder();

function collectErrors(key: string, byteLength: number): KeyError[] {
  const errors: KeyError[] = [];
  if (key.length === 0) errors.push('empty');
  if (byteLength > MAX_KEY_BYTES) errors.push('tooLong');
  return errors;
}

// S3 accepts these keys, but the console shows them as empty "folders", which confuses beginners.
function collectWarnings(key: string): KeyWarning[] {
  const warnings: KeyWarning[] = [];
  if (key.startsWith(DELIMITER)) warnings.push('leadingSlash');
  if (key.includes(`${DELIMITER}${DELIMITER}`)) warnings.push('doubleSlash');
  if (key.length > 1 && key.endsWith(DELIMITER)) warnings.push('trailingSlash');
  return warnings;
}

function buildPrefixes(segments: readonly string[]): string[] {
  return segments
    .slice(0, -1)
    .map((_, index) => segments.slice(0, index + 1).join(DELIMITER) + DELIMITER);
}

// The key is one flat string: "folders" are only the prefixes before each delimiter.
export function parseKey(key: string): KeyParseResult {
  const byteLength = encoder.encode(key).length;
  const errors = collectErrors(key, byteLength);
  const segments = key.length === 0 ? [] : key.split(DELIMITER);
  return {
    valid: errors.length === 0,
    errors,
    warnings: collectWarnings(key),
    byteLength,
    segments,
    prefixes: buildPrefixes(segments),
    fileName: segments.at(-1) ?? '',
  };
}
