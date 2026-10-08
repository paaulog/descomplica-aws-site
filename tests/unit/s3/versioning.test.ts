import { describe, expect, it } from 'vitest';
import {
  createVersionedObject,
  getCurrentVersion,
  NULL_VERSION_ID,
  versioningReducer,
  type VersionAction,
  type VersionedObject,
} from '@/lib/s3/versioning';

const at = (hour: number) => `2026-01-05T${String(hour).padStart(2, '0')}:00:00.000Z`;
const put = (label: string, hour: number): VersionAction => ({ type: 'put', label, now: at(hour) });
const remove = (hour: number): VersionAction => ({ type: 'delete', now: at(hour) });
const enable: VersionAction = { type: 'enableVersioning' };

const apply = (actions: VersionAction[], state = createVersionedObject('relatorio.txt')) =>
  actions.reduce(versioningReducer, state);

// Deep freeze, so any mutation inside the reducer throws in strict mode.
function freeze(state: VersionedObject): VersionedObject {
  state.versions.forEach((version) => Object.freeze(version));
  Object.freeze(state.versions);
  return Object.freeze(state);
}

describe('versioningReducer com o versionamento desligado', () => {
  it('sobrescreve a única versão, com id "null"', () => {
    const state = apply([put('v1', 9), put('v2', 10)]);
    expect(state.versions).toHaveLength(1);
    expect(state.versions[0]).toMatchObject({ versionId: NULL_VERSION_ID, label: 'v2' });
  });

  it('apaga para sempre, sem marcador de exclusão', () => {
    const state = apply([put('v1', 9), remove(10)]);
    expect(state.versions).toEqual([]);
    expect(getCurrentVersion(state)).toBeNull();
  });

  it('não restaura nada', () => {
    const state = apply([put('v1', 9)]);
    expect(versioningReducer(state, { type: 'restore', versionId: 'null', now: at(10) })).toBe(
      state,
    );
  });
});

describe('versioningReducer com o versionamento ligado', () => {
  it('guarda cada envio como uma versão nova, da mais nova para a mais antiga', () => {
    const state = apply([enable, put('v1', 9), put('v2', 10)]);
    expect(state.versions.map((version) => version.versionId)).toEqual(['v2', 'v1']);
    expect(getCurrentVersion(state)?.label).toBe('v2');
  });

  it('mantém a versão "null" de antes de ligar o versionamento', () => {
    const state = apply([put('original', 9), enable, put('nova', 10)]);
    expect(state.versions.map((version) => version.versionId)).toEqual(['v1', NULL_VERSION_ID]);
  });

  it('apagar cria um delete marker e preserva as versões', () => {
    const state = apply([enable, put('v1', 9), remove(10)]);
    expect(state.versions).toHaveLength(2);
    expect(state.versions[0]).toMatchObject({ isDeleteMarker: true, createdAt: at(10) });
    expect(getCurrentVersion(state)).toBeNull();
  });

  it('apagar de novo, sem versão atual, não faz nada', () => {
    const deleted = apply([enable, put('v1', 9), remove(10)]);
    expect(versioningReducer(deleted, remove(11))).toBe(deleted);
  });

  it('restaurar copia a versão escolhida para o topo', () => {
    const state = apply([
      enable,
      put('v1', 9),
      put('v2', 10),
      remove(11),
      { type: 'restore', versionId: 'v1', now: at(12) },
    ]);
    expect(getCurrentVersion(state)).toMatchObject({ label: 'v1', versionId: 'v4' });
    expect(state.versions).toHaveLength(4);
  });

  it('ignora restaurar um delete marker, uma versão inexistente ou a atual', () => {
    const state = apply([enable, put('v1', 9), put('v2', 10)]);
    const marker = apply([remove(11)], state);
    expect(versioningReducer(marker, { type: 'restore', versionId: 'v3', now: at(12) })).toBe(
      marker,
    );
    expect(versioningReducer(state, { type: 'restore', versionId: 'v9', now: at(12) })).toBe(state);
    expect(versioningReducer(state, { type: 'restore', versionId: 'v2', now: at(12) })).toBe(state);
  });

  it('ligar de novo não muda nada, porque não existe desligar', () => {
    const state = apply([enable]);
    expect(versioningReducer(state, enable)).toBe(state);
  });
});

describe('imutabilidade', () => {
  it('nunca altera o estado anterior', () => {
    const before = freeze(apply([enable, put('v1', 9)]));
    const snapshot = structuredClone(before);
    const actions: VersionAction[] = [
      put('v2', 10),
      remove(11),
      { type: 'restore', versionId: 'v1', now: at(12) },
    ];
    for (const action of actions) {
      expect(() => versioningReducer(before, action)).not.toThrow();
    }
    expect(before).toEqual(snapshot);
  });

  it('também não altera o estado com o versionamento desligado', () => {
    const before = freeze(apply([put('v1', 9)]));
    const snapshot = structuredClone(before);
    versioningReducer(before, put('v2', 10));
    versioningReducer(before, remove(10));
    versioningReducer(before, enable);
    expect(before).toEqual(snapshot);
  });
});
