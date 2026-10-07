import { useSyncExternalStore } from 'react';

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function subscribeToMotionPreference(onChange: () => void): () => void {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

const readMotionPreference = (): boolean => window.matchMedia(REDUCED_MOTION_QUERY).matches;

// The server renders the still version, the safe one when the preference is unknown.
const readServerMotionPreference = (): boolean => true;

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToMotionPreference,
    readMotionPreference,
    readServerMotionPreference,
  );
}
