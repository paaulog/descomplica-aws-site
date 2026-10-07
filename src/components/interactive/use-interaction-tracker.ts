import { useCallback, useRef } from 'react';
import { track } from '../../lib/analytics';

// Reports only the first interaction, which is what "the island was used" means.
export function useInteractionTracker(island: string): () => void {
  const reported = useRef(false);
  return useCallback(() => {
    if (reported.current) return;
    reported.current = true;
    track({ name: 'interaction_used', island });
  }, [island]);
}
