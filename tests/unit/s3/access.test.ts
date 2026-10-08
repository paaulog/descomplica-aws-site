import { describe, expect, it } from 'vitest';
import {
  createPresignedMode,
  MAX_PRESIGNED_SECONDS,
  resolveAccess,
  type AccessDecision,
  type AccessMode,
  type Actor,
} from '@/lib/s3/access';

const now = new Date('2026-01-05T09:00:00.000Z');
const expiresAt = '2026-01-05T10:00:00.000Z';
const presigned: AccessMode = { type: 'presigned', expiresAt };

describe('resolveAccess: matriz modo × ator', () => {
  it.each<[AccessMode, Actor, AccessDecision]>([
    [{ type: 'private' }, 'owner', { allowed: true, reason: 'ownerCredentials' }],
    [{ type: 'private' }, 'anonymous', { allowed: false, reason: 'privateByDefault' }],
    [{ type: 'private' }, 'linkHolder', { allowed: false, reason: 'privateByDefault' }],
    [{ type: 'public' }, 'owner', { allowed: true, reason: 'ownerCredentials' }],
    [{ type: 'public' }, 'anonymous', { allowed: true, reason: 'publicRead' }],
    [{ type: 'public' }, 'linkHolder', { allowed: true, reason: 'publicRead' }],
    [presigned, 'owner', { allowed: true, reason: 'ownerCredentials' }],
    [presigned, 'anonymous', { allowed: false, reason: 'missingSignature' }],
    [presigned, 'linkHolder', { allowed: true, reason: 'validSignature', expiresAt }],
  ])('%o + %s', (mode, actor, expected) => {
    expect(resolveAccess(mode, actor, now)).toEqual(expected);
  });
});

describe('resolveAccess: URL pré-assinada', () => {
  it('ainda vale um milissegundo antes de expirar', () => {
    const almost = new Date(Date.parse(expiresAt) - 1);
    expect(resolveAccess(presigned, 'linkHolder', almost).allowed).toBe(true);
  });

  it('para de valer no instante exato da expiração', () => {
    expect(resolveAccess(presigned, 'linkHolder', new Date(expiresAt))).toEqual({
      allowed: false,
      reason: 'expiredSignature',
      expiresAt,
    });
  });

  it('continua negada depois de expirada', () => {
    const later = new Date('2026-01-06T09:00:00.000Z');
    expect(resolveAccess(presigned, 'linkHolder', later).reason).toBe('expiredSignature');
  });
});

describe('createPresignedMode', () => {
  it('soma a validade ao instante de criação', () => {
    expect(createPresignedMode(now, 3600)).toEqual(presigned);
  });

  it('limita a validade a 7 dias, como a assinatura SigV4', () => {
    const mode = createPresignedMode(now, MAX_PRESIGNED_SECONDS * 2);
    expect(mode).toEqual({
      type: 'presigned',
      expiresAt: new Date(now.getTime() + MAX_PRESIGNED_SECONDS * 1000).toISOString(),
    });
  });

  it('usa pelo menos 1 segundo de validade', () => {
    expect(createPresignedMode(now, 0)).toEqual({
      type: 'presigned',
      expiresAt: '2026-01-05T09:00:01.000Z',
    });
  });
});
