// The id S3 gives to objects written while versioning was never enabled.
export const NULL_VERSION_ID = 'null';

export interface ObjectVersion {
  versionId: string;
  createdAt: string;
  label: string;
  isDeleteMarker: boolean;
}

export interface VersionedObject {
  key: string;
  versioningEnabled: boolean;
  // Newest first, like the "Show versions" list in the console.
  versions: readonly ObjectVersion[];
}

// Versioning cannot be turned off once enabled (only suspended), so the action is one-way.
export type VersionAction =
  | { type: 'put'; label: string; now: string }
  | { type: 'delete'; now: string }
  | { type: 'restore'; versionId: string; now: string }
  | { type: 'enableVersioning' };

export function createVersionedObject(key: string): VersionedObject {
  return { key, versioningEnabled: false, versions: [] };
}

export function getCurrentVersion(state: VersionedObject): ObjectVersion | null {
  const latest = state.versions[0];
  return latest && !latest.isDeleteMarker ? latest : null;
}

function createVersionId(state: VersionedObject): string {
  const versionedCount = state.versions.filter((version) => version.versionId !== NULL_VERSION_ID);
  return `v${versionedCount.length + 1}`;
}

function addVersion(
  state: VersionedObject,
  version: Omit<ObjectVersion, 'versionId'>,
): VersionedObject {
  if (!state.versioningEnabled) {
    return { ...state, versions: [{ ...version, versionId: NULL_VERSION_ID }] };
  }
  return {
    ...state,
    versions: [{ ...version, versionId: createVersionId(state) }, ...state.versions],
  };
}

function deleteObject(state: VersionedObject, now: string): VersionedObject {
  const current = getCurrentVersion(state);
  if (!current) return state;
  if (!state.versioningEnabled) return { ...state, versions: [] };
  return addVersion(state, { createdAt: now, label: current.label, isDeleteMarker: true });
}

// Restoring copies the old version on top, the way AWS recommends, so no history is lost.
function restoreVersion(state: VersionedObject, versionId: string, now: string): VersionedObject {
  const target = state.versions.find((version) => version.versionId === versionId);
  if (!state.versioningEnabled || !target || target.isDeleteMarker) return state;
  if (target === getCurrentVersion(state)) return state;
  return addVersion(state, { createdAt: now, label: target.label, isDeleteMarker: false });
}

export function versioningReducer(state: VersionedObject, action: VersionAction): VersionedObject {
  switch (action.type) {
    case 'put':
      return addVersion(state, {
        createdAt: action.now,
        label: action.label,
        isDeleteMarker: false,
      });
    case 'delete':
      return deleteObject(state, action.now);
    case 'restore':
      return restoreVersion(state, action.versionId, action.now);
    case 'enableVersioning':
      return state.versioningEnabled ? state : { ...state, versioningEnabled: true };
  }
}
