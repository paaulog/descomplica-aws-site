export type FileInfo = Pick<File, 'name' | 'size' | 'type'>;

export interface S3ObjectPreview {
  key: string;
  size: number;
  contentType: string;
  lastModified: string;
  etag: string;
}

// Content-Type S3 stores when the upload does not send one.
export const DEFAULT_CONTENT_TYPE = 'binary/octet-stream';

const FNV_OFFSET = 0x811c9dc5;
const FNV_PRIME = 0x01000193;
const HEX_RADIX = 16;
const HASH_HEX_LENGTH = 8;
// Four 32-bit words give the 32 hex characters of a real MD5-style ETag.
const ETAG_SEEDS = [0, 1, 2, 3] as const;

function hashFnv1a(text: string, seed: number): string {
  let hash = (FNV_OFFSET ^ seed) >>> 0;
  for (const char of text) {
    hash = Math.imul(hash ^ (char.codePointAt(0) ?? 0), FNV_PRIME) >>> 0;
  }
  return hash.toString(HEX_RADIX).padStart(HASH_HEX_LENGTH, '0');
}

// Fictitious but stable: derived from the metadata only, because the file content is never read.
export function createFakeEtag(key: string, file: FileInfo): string {
  const source = `${key}:${file.size}:${file.type}`;
  return `"${ETAG_SEEDS.map((seed) => hashFnv1a(source, seed)).join('')}"`;
}

export function normalizePrefix(prefix: string): string {
  const trimmed = prefix.trim();
  if (trimmed === '' || trimmed.endsWith('/')) return trimmed;
  return `${trimmed}/`;
}

export function toS3Object(file: FileInfo, prefix = '', now = new Date()): S3ObjectPreview {
  const key = `${normalizePrefix(prefix)}${file.name}`;
  return {
    key,
    size: file.size,
    contentType: file.type || DEFAULT_CONTENT_TYPE,
    lastModified: now.toISOString(),
    etag: createFakeEtag(key, file),
  };
}
