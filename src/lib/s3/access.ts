export const actors = ['owner', 'anonymous', 'linkHolder'] as const;
export type Actor = (typeof actors)[number];

export const accessModeTypes = ['private', 'public', 'presigned'] as const;
export type AccessModeType = (typeof accessModeTypes)[number];

// A presigned URL carries its own expiration, so that mode needs the date.
export type AccessMode =
  { type: 'private' } | { type: 'public' } | { type: 'presigned'; expiresAt: string };

export type AccessReason =
  | 'ownerCredentials'
  | 'privateByDefault'
  | 'publicRead'
  | 'missingSignature'
  | 'validSignature'
  | 'expiredSignature';

export interface AccessDecision {
  allowed: boolean;
  reason: AccessReason;
  expiresAt?: string;
}

// Literal values, not products, so PresignedExpiration stays a union of exact numbers.
const FIFTEEN_MINUTES_S = 900;
const ONE_HOUR_S = 3600;
const SEVEN_DAYS_S = 604_800;
const MS_PER_SECOND = 1000;
// SigV4 presigned URLs last at most 7 days.
export const MAX_PRESIGNED_SECONDS = SEVEN_DAYS_S;

export const presignedExpirations = [FIFTEEN_MINUTES_S, ONE_HOUR_S, SEVEN_DAYS_S] as const;
export type PresignedExpiration = (typeof presignedExpirations)[number];

export function createPresignedMode(now: Date, expiresInSeconds: number): AccessMode {
  const seconds = Math.min(Math.max(expiresInSeconds, 1), MAX_PRESIGNED_SECONDS);
  return {
    type: 'presigned',
    expiresAt: new Date(now.getTime() + seconds * MS_PER_SECOND).toISOString(),
  };
}

// The URL stops working at the expiration instant itself, not one tick later.
function resolvePresignedLink(expiresAt: string, now: Date): AccessDecision {
  const allowed = now.getTime() < Date.parse(expiresAt);
  return { allowed, reason: allowed ? 'validSignature' : 'expiredSignature', expiresAt };
}

export function resolveAccess(mode: AccessMode, actor: Actor, now: Date): AccessDecision {
  if (actor === 'owner') return { allowed: true, reason: 'ownerCredentials' };
  if (mode.type === 'public') return { allowed: true, reason: 'publicRead' };
  if (mode.type === 'private') return { allowed: false, reason: 'privateByDefault' };
  if (actor === 'anonymous') return { allowed: false, reason: 'missingSignature' };
  return resolvePresignedLink(mode.expiresAt, now);
}
