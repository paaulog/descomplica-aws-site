import type { MotionProps } from 'motion/react';
import { usePrefersReducedMotion } from './use-reduced-motion';

type EnterProps = Pick<MotionProps, 'initial' | 'animate' | 'transition'>;

const ENTER_DURATION_S = 0.3;
// New content rises into place from just below.
const ENTER_OFFSET_PX = 8;

// With reduced motion, `initial: false` renders the final state directly: no animation at all.
export function useEnterAnimation(): EnterProps {
  const prefersReducedMotion = usePrefersReducedMotion();
  if (prefersReducedMotion) return { initial: false };
  return {
    initial: { opacity: 0, y: ENTER_OFFSET_PX },
    animate: { opacity: 1, y: 0 },
    transition: { duration: ENTER_DURATION_S, ease: 'easeOut' },
  };
}
