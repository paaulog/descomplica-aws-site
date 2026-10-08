import { LazyMotion, MotionConfig } from 'motion/react';
import { useId, type ReactNode } from 'react';
import { IslandErrorBoundary } from './IslandErrorBoundary';
import { usePrefersReducedMotion } from './use-reduced-motion';

const loadMotionFeatures = () => import('./motion-features').then((module) => module.default);

interface IslandFrameProps {
  island: string;
  title: string;
  fallback: string;
  children: ReactNode;
}

// `strict` makes a stray full `motion.*` component throw, which keeps the bundle on `m.*`.
export function IslandFrame({ island, title, fallback, children }: IslandFrameProps) {
  const titleId = useId();
  const prefersReducedMotion = usePrefersReducedMotion();
  return (
    <div
      role="group"
      aria-labelledby={titleId}
      className="glass glass-spot my-10 rounded-3xl p-5 sm:p-7"
      data-island={island}
      data-spot
      data-motion={prefersReducedMotion ? 'reduced' : 'full'}
    >
      <h3 id={titleId} className="font-display text-xl font-bold tracking-tight">
        {title}
      </h3>
      <IslandErrorBoundary fallback={fallback}>
        <LazyMotion features={loadMotionFeatures} strict>
          <MotionConfig reducedMotion="user">{children}</MotionConfig>
        </LazyMotion>
      </IslandErrorBoundary>
    </div>
  );
}
