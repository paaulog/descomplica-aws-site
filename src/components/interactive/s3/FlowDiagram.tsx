import { domAnimation, LazyMotion, useScroll, useTransform, type MotionValue } from 'motion/react';
import * as m from 'motion/react-m';
import { useRef, type ReactNode } from 'react';
import type { FlowDiagramMessages, FlowStep } from '../../../lib/i18n/ui';
import { AppIcon, BucketIcon, UserIcon } from '../icons';
import { IslandFrame } from '../IslandFrame';
import type { IslandProps } from '../types';
import { usePrefersReducedMotion } from '../use-reduced-motion';

type FlowDiagramProps = IslandProps<FlowDiagramMessages>;

type FlowPart =
  { kind: 'step'; step: FlowStep } | { kind: 'arrow'; arrow: keyof FlowDiagramMessages['arrows'] };

const FLOW_PARTS: readonly FlowPart[] = [
  { kind: 'step', step: 'user' },
  { kind: 'arrow', arrow: 'upload' },
  { kind: 'step', step: 'app' },
  { kind: 'arrow', arrow: 'store' },
  { kind: 'step', step: 'bucket' },
];
const STEP_ICONS: Record<FlowStep, typeof UserIcon> = {
  user: UserIcon,
  app: AppIcon,
  bucket: BucketIcon,
};
// The diagram is fully built when its center reaches the center of the viewport.
// Parts never fully vanish: the server-rendered diagram stays readable while hydrating at the top.
const HIDDEN_OPACITY = 0.2;
const RISE_PX = 16;
// Completes a little above the viewport middle, so a taller island frame never leaves the last step half-faded.
const SCROLL_OFFSET: ['start end', 'center 0.65'] = ['start end', 'center 0.65'];

function FlowPartContent({ part, messages }: { part: FlowPart; messages: FlowDiagramMessages }) {
  if (part.kind === 'arrow') {
    return (
      <span className="flex flex-col items-center justify-center gap-1 px-2 text-center font-mono text-xs text-muted">
        <span aria-hidden="true" className="text-lg text-accent">
          <span className="sm:hidden">↓</span>
          <span className="hidden sm:inline">→</span>
        </span>
        {messages.arrows[part.arrow]}
      </span>
    );
  }
  const Icon = STEP_ICONS[part.step];
  return (
    <span className="flex h-full flex-col items-center gap-2 rounded-xl border border-border bg-bg p-3 text-center">
      <Icon className="size-7 shrink-0 text-accent" />
      <span className="text-sm font-semibold">{messages.steps[part.step].name}</span>
      <span className="text-xs text-muted">{messages.steps[part.step].description}</span>
    </span>
  );
}

function ScrollPart({
  index,
  progress,
  children,
}: {
  index: number;
  progress: MotionValue<number>;
  children: ReactNode;
}) {
  const start = index / FLOW_PARTS.length;
  const end = (index + 1) / FLOW_PARTS.length;
  const opacity = useTransform(progress, [start, end], [HIDDEN_OPACITY, 1]);
  const y = useTransform(progress, [start, end], [RISE_PX, 0]);
  return (
    <m.li style={{ opacity, y }} className="sm:flex-1" data-flow-part>
      {children}
    </m.li>
  );
}

/*
 * Scroll-linked styles stop updating when the parts mount before lazily loaded features arrive,
 * so this island bundles the features up front instead of using the shared async load.
 */
function ScrollFlow({ messages }: { messages: FlowDiagramMessages }) {
  const target = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target, offset: SCROLL_OFFSET });
  return (
    <LazyMotion features={domAnimation} strict>
      <ol ref={target} className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-stretch">
        {FLOW_PARTS.map((part, index) => (
          <ScrollPart key={index} index={index} progress={scrollYProgress}>
            <FlowPartContent part={part} messages={messages} />
          </ScrollPart>
        ))}
      </ol>
    </LazyMotion>
  );
}

// Also what the server renders, so the diagram is complete without JavaScript.
function StaticFlow({ messages }: { messages: FlowDiagramMessages }) {
  return (
    <ol className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-stretch">
      {FLOW_PARTS.map((part, index) => (
        <li key={index} className="sm:flex-1" data-flow-part>
          <FlowPartContent part={part} messages={messages} />
        </li>
      ))}
    </ol>
  );
}

function FlowDiagramBody({ messages }: FlowDiagramProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  return prefersReducedMotion ? (
    <StaticFlow messages={messages} />
  ) : (
    <ScrollFlow messages={messages} />
  );
}

export default function FlowDiagram(props: FlowDiagramProps) {
  return (
    <IslandFrame
      island="FlowDiagram"
      title={props.messages.title}
      fallback={props.messages.fallback}
    >
      <FlowDiagramBody {...props} />
    </IslandFrame>
  );
}
