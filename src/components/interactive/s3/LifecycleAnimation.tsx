import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { useEffect, useId, useState } from 'react';
import { fillTemplate } from '../../../lib/i18n/template';
import type { LifecycleAnimationMessages } from '../../../lib/i18n/ui';
import {
  lifecycleTimeline,
  type LifecycleRule,
  type LifecycleStep,
} from '../../../lib/s3/lifecycle';
import type { StorageClass } from '../../../lib/s3/storage-class';
import { FileIcon } from '../icons';
import { IslandFrame } from '../IslandFrame';
import { hintClass, labelClass, primaryButtonClass, secondaryButtonClass } from '../styles';
import type { IslandProps } from '../types';
import { useInteractionTracker } from '../use-interaction-tracker';
import { usePrefersReducedMotion } from '../use-reduced-motion';

type LifecycleAnimationProps = IslandProps<LifecycleAnimationMessages>;
type Stage = StorageClass | 'expired';

// The classic log-retention example from the AWS lifecycle documentation.
const LIFECYCLE_RULES: readonly LifecycleRule[] = [
  { afterDays: 30, action: { type: 'transition', to: 'STANDARD_IA' } },
  { afterDays: 90, action: { type: 'transition', to: 'GLACIER' } },
  { afterDays: 365, action: { type: 'expire' } },
];
const STAGES: readonly Stage[] = ['STANDARD', 'STANDARD_IA', 'GLACIER', 'expired'];
const MAX_DAY = 400;
const PLAY_STEP_DAYS = 5;
const PLAY_INTERVAL_MS = 80;
// The file drops into its new class from slightly above.
const FILE_DROP_OFFSET_PX = -12;

function getStage(step: LifecycleStep | undefined): Stage {
  if (!step) return 'STANDARD';
  return step.storageClass ?? 'expired';
}

function findNextRuleDay(day: number): number | null {
  return LIFECYCLE_RULES.find((rule) => rule.afterDays > day)?.afterDays ?? null;
}

// Playback never runs under reduced motion, even if the preference changes mid-play.
function useLifecycleClock(markUsed: () => void) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [day, setDay] = useState(0);
  const [wantsPlay, setWantsPlay] = useState(false);
  const isPlaying = wantsPlay && !prefersReducedMotion && day < MAX_DAY;
  // Turning reduced motion off again must not resume a playback the user never restarted.
  useEffect(() => {
    if (prefersReducedMotion) setWantsPlay(false);
  }, [prefersReducedMotion]);
  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      setDay((current) => Math.min(current + PLAY_STEP_DAYS, MAX_DAY));
    }, PLAY_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [isPlaying]);
  const changeDay = (next: number) => {
    setDay(next);
    setWantsPlay(false);
    markUsed();
  };
  const togglePlay = () => {
    if (!isPlaying && day >= MAX_DAY) setDay(0);
    setWantsPlay(!isPlaying);
    markUsed();
  };
  return { day, isPlaying, prefersReducedMotion, changeDay, togglePlay };
}

function RuleList({ messages }: { messages: LifecycleAnimationMessages }) {
  return (
    <>
      <p className={labelClass}>{messages.rulesHeading}</p>
      <ul className={`mt-1 list-disc pl-5 ${hintClass}`}>
        {LIFECYCLE_RULES.map(({ afterDays, action }) => (
          <li key={afterDays}>
            {action.type === 'expire'
              ? fillTemplate(messages.ruleExpire, { days: afterDays })
              : fillTemplate(messages.ruleTransition, {
                  days: afterDays,
                  class: messages.classNames[action.to],
                })}
          </li>
        ))}
      </ul>
    </>
  );
}

function StageBoard({ stage, messages }: { stage: Stage; messages: LifecycleAnimationMessages }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  return (
    <ol className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-hidden="true">
      {STAGES.map((candidate) => (
        <li
          key={candidate}
          className={`flex min-h-24 flex-col gap-2 rounded-xl border p-2 text-xs ${candidate === stage ? 'border-accent bg-accent-soft' : 'border-border'}`}
          data-stage={candidate}
          data-current={candidate === stage ? '' : undefined}
        >
          <span className="font-medium">
            {candidate === 'expired' ? messages.expired : messages.classNames[candidate]}
          </span>
          <AnimatePresence initial={false}>
            {candidate === stage && candidate !== 'expired' && (
              <m.span
                initial={prefersReducedMotion ? false : { opacity: 0, y: FILE_DROP_OFFSET_PX }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                className="flex items-center gap-1 font-mono"
              >
                <FileIcon className="size-4 shrink-0" /> {messages.fileName}
              </m.span>
            )}
          </AnimatePresence>
        </li>
      ))}
    </ol>
  );
}

function DaySlider({
  day,
  messages,
  onChange,
}: {
  day: number;
  messages: LifecycleAnimationMessages;
  onChange: (day: number) => void;
}) {
  const sliderId = useId();
  const dayText = fillTemplate(messages.dayValue, { day });
  return (
    <div className="mt-4">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={sliderId} className={labelClass}>
          {messages.dayLabel}
        </label>
        <span className="font-mono text-sm" aria-hidden="true">
          {dayText}
        </span>
      </div>
      <input
        id={sliderId}
        type="range"
        min={0}
        max={MAX_DAY}
        step={1}
        value={day}
        aria-valuetext={dayText}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 h-11 w-full cursor-pointer accent-[var(--accent)]"
      />
    </div>
  );
}

// Under reduced motion there is no autoplay: the button jumps straight to the next rule.
function PlaybackButton({
  clock,
  messages,
}: {
  clock: ReturnType<typeof useLifecycleClock>;
  messages: LifecycleAnimationMessages;
}) {
  if (clock.prefersReducedMotion) {
    const nextDay = findNextRuleDay(clock.day);
    return (
      <button
        type="button"
        className={secondaryButtonClass}
        disabled={nextDay === null}
        onClick={() => nextDay !== null && clock.changeDay(nextDay)}
      >
        {messages.nextRule}
      </button>
    );
  }
  return (
    <button type="button" className={primaryButtonClass} onClick={clock.togglePlay}>
      {clock.isPlaying ? messages.pause : messages.play}
    </button>
  );
}

function LifecycleAnimationBody({ messages }: LifecycleAnimationProps) {
  const markUsed = useInteractionTracker('LifecycleAnimation');
  const clock = useLifecycleClock(markUsed);
  const { day } = clock;
  const stage = getStage(lifecycleTimeline(LIFECYCLE_RULES, day).at(-1));
  const status =
    stage === 'expired'
      ? fillTemplate(messages.expiredStatus, { day })
      : fillTemplate(messages.currentStatus, { day, class: messages.classNames[stage] });
  return (
    <div className="mt-4">
      <RuleList messages={messages} />
      <StageBoard stage={stage} messages={messages} />
      <p
        className="mt-3 text-sm font-medium"
        aria-live={clock.isPlaying ? 'off' : 'polite'}
        data-testid="lifecycle-status"
      >
        {status}
      </p>
      <DaySlider day={day} messages={messages} onChange={clock.changeDay} />
      <div className="mt-2 flex flex-wrap gap-2">
        <PlaybackButton clock={clock} messages={messages} />
      </div>
    </div>
  );
}

export default function LifecycleAnimation(props: LifecycleAnimationProps) {
  return (
    <IslandFrame
      island="LifecycleAnimation"
      title={props.messages.title}
      fallback={props.messages.fallback}
    >
      <LifecycleAnimationBody {...props} />
    </IslandFrame>
  );
}
