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
      className="my-8 rounded-2xl border border-border bg-surface p-4 sm:p-6"
      data-island={island}
      data-motion={prefersReducedMotion ? 'reduced' : 'full'}
    >
      <h3 id={titleId} className="text-lg font-semibold tracking-tight">
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
