import * as m from 'motion/react-m';
import { useId, useState } from 'react';
import { formatDateTime } from '../../../lib/i18n/format';
import { fillTemplate } from '../../../lib/i18n/template';
import type { AccessLockMessages, Locale } from '../../../lib/i18n/ui';
import {
  accessModeTypes,
  actors,
  createPresignedMode,
  presignedExpirations,
  resolveAccess,
  type AccessDecision,
  type AccessMode,
  type AccessModeType,
  type PresignedExpiration,
} from '../../../lib/s3/access';
import { LockIcon, UnlockIcon } from '../icons';
import { IslandFrame } from '../IslandFrame';
import { pickOption } from '../pick-option';
import { useEnterAnimation } from '../motion-presets';
import { hintClass, inputClass, labelClass, secondaryButtonClass } from '../styles';
import type { IslandProps } from '../types';
import { useInteractionTracker } from '../use-interaction-tracker';

type AccessLockProps = IslandProps<AccessLockMessages>;

// A fixed starting instant keeps the server and the browser rendering the same clock.
const SIMULATION_START_MS = Date.parse('2026-01-05T09:00:00Z');
const MS_PER_SECOND = 1000;
const SECONDS_PER_HOUR = 3600;
const HOURS_PER_DAY = 24;
const TIME_FORMAT: Intl.DateTimeFormatOptions = {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'UTC',
};

interface AccessState {
  modeType: AccessModeType;
  expiration: PresignedExpiration;
  elapsedSeconds: number;
}

const INITIAL_STATE: AccessState = {
  modeType: 'private',
  expiration: SECONDS_PER_HOUR,
  elapsedSeconds: 0,
};

function buildMode({ modeType, expiration }: AccessState): AccessMode {
  if (modeType !== 'presigned') return { type: modeType };
  return createPresignedMode(new Date(SIMULATION_START_MS), expiration);
}

function DecisionCard({
  actorLabel,
  decision,
  locale,
  messages,
}: {
  actorLabel: string;
  decision: AccessDecision;
  locale: Locale;
  messages: AccessLockMessages;
}) {
  const enter = useEnterAnimation();
  const time = decision.expiresAt ? formatDateTime(decision.expiresAt, locale, TIME_FORMAT) : '';
  const Icon = decision.allowed ? UnlockIcon : LockIcon;
  return (
    <li
      className={`rounded-xl border p-3 ${decision.allowed ? 'border-accent bg-accent-soft' : 'border-border'}`}
      data-allowed={decision.allowed}
    >
      <p className="text-sm font-medium">{actorLabel}</p>
      <m.p
        key={String(decision.allowed)}
        {...enter}
        className="mt-1 flex items-center gap-2 font-semibold"
      >
        <Icon className="size-5 shrink-0" /> {decision.allowed ? messages.allowed : messages.denied}
      </m.p>
      <p className={`mt-1 ${hintClass}`}>
        {fillTemplate(messages.reasons[decision.reason], { time })}
      </p>
    </li>
  );
}

function ModePicker({
  state,
  messages,
  onChange,
}: {
  state: AccessState;
  messages: AccessLockMessages;
  onChange: (change: Partial<AccessState>) => void;
}) {
  const name = useId();
  return (
    <fieldset className="mt-4">
      <legend className={labelClass}>{messages.modeLabel}</legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {accessModeTypes.map((modeType) => (
          <label
            key={modeType}
            className="flex min-h-11 cursor-pointer items-start gap-2 rounded-lg border border-border p-3 has-[:checked]:border-accent has-[:checked]:bg-accent-soft"
          >
            <input
              type="radio"
              name={name}
              value={modeType}
              checked={state.modeType === modeType}
              onChange={() => onChange({ modeType, elapsedSeconds: 0 })}
              className="mt-1 accent-[var(--accent)]"
            />
            <span>
              <span className="block text-sm font-semibold">{messages.modes[modeType]}</span>
              <span className="block text-xs text-muted">{messages.modeHints[modeType]}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

interface ClockProps {
  state: AccessState;
  messages: AccessLockMessages;
  onChange: (change: Partial<AccessState>) => void;
}

function ExpirationSelect({ state, messages, onChange }: ClockProps) {
  const selectId = useId();
  const changeExpiration = (value: string) => {
    const expiration = pickOption(presignedExpirations, value, INITIAL_STATE.expiration);
    onChange({ expiration, elapsedSeconds: 0 });
  };
  return (
    <div>
      <label htmlFor={selectId} className={labelClass}>
        {messages.expirationLabel}
      </label>
      <select
        id={selectId}
        value={state.expiration}
        onChange={(event) => changeExpiration(event.target.value)}
        className={`${inputClass} font-sans`}
      >
        {presignedExpirations.map((seconds) => (
          <option key={seconds} value={seconds}>
            {messages.expirationOptions[seconds]}
          </option>
        ))}
      </select>
    </div>
  );
}

function ClockButtons({ state, messages, onChange }: ClockProps) {
  const buttons: [string, number][] = [
    [messages.advanceHour, state.elapsedSeconds + SECONDS_PER_HOUR],
    [messages.advanceDay, state.elapsedSeconds + SECONDS_PER_HOUR * HOURS_PER_DAY],
    [messages.resetClock, 0],
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {buttons.map(([label, elapsedSeconds]) => (
        <button
          key={label}
          type="button"
          className={secondaryButtonClass}
          onClick={() => onChange({ elapsedSeconds })}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function PresignedClock({ now, locale, ...props }: ClockProps & { now: Date; locale: Locale }) {
  return (
    <div className="mt-4 space-y-3">
      <ExpirationSelect {...props} />
      <p className="font-mono text-sm" aria-live="polite">
        {fillTemplate(props.messages.clockLabel, {
          time: formatDateTime(now.toISOString(), locale, TIME_FORMAT),
        })}
      </p>
      <ClockButtons {...props} />
    </div>
  );
}

function AccessLockBody({ locale, messages }: AccessLockProps) {
  const [state, setState] = useState(INITIAL_STATE);
  const markUsed = useInteractionTracker('AccessLock');
  const mode = buildMode(state);
  const now = new Date(SIMULATION_START_MS + state.elapsedSeconds * MS_PER_SECOND);
  const update = (change: Partial<AccessState>) => {
    setState((current) => ({ ...current, ...change }));
    markUsed();
  };
  return (
    <div>
      <ModePicker state={state} messages={messages} onChange={update} />
      {state.modeType === 'presigned' && (
        <PresignedClock
          state={state}
          now={now}
          locale={locale}
          messages={messages}
          onChange={update}
        />
      )}
      <ul className="mt-5 grid gap-3 sm:grid-cols-3" aria-live="polite">
        {actors.map((actor) => (
          <DecisionCard
            key={actor}
            actorLabel={messages.actors[actor]}
            decision={resolveAccess(mode, actor, now)}
            locale={locale}
            messages={messages}
          />
        ))}
      </ul>
    </div>
  );
}

export default function AccessLock(props: AccessLockProps) {
  return (
    <IslandFrame
      island="AccessLock"
      title={props.messages.title}
      fallback={props.messages.fallback}
    >
      <AccessLockBody {...props} />
    </IslandFrame>
  );
}
