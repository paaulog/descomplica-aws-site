import * as m from 'motion/react-m';
import { useId, useState } from 'react';
import { formatUsd } from '../../../lib/i18n/format';
import { fillTemplate } from '../../../lib/i18n/template';
import type { Locale, StorageClassSliderMessages } from '../../../lib/i18n/ui';
import { compareScenarioCosts } from '../../../lib/s3/scenario';
import {
  accessFrequencies,
  recommendStorageClass,
  retentionDaysOptions,
  type RetentionDays,
  type StorageClassRecommendation,
  type StorageClassWarning,
} from '../../../lib/s3/storage-class';
import { CostBars } from '../CostBars';
import { WarningIcon } from '../icons';
import { IslandFrame } from '../IslandFrame';
import { pickOption } from '../pick-option';
import { useEnterAnimation } from '../motion-presets';
import { hintClass, inputClass, labelClass } from '../styles';
import type { StorageClassSliderProps } from '../types';
import { useInteractionTracker } from '../use-interaction-tracker';

const INITIAL_FREQUENCY_INDEX = 0;
const INITIAL_RETENTION: RetentionDays = 365;
const MAX_FREQUENCY_INDEX = accessFrequencies.length - 1;

function describeWarning(
  warning: StorageClassWarning,
  locale: Locale,
  messages: StorageClassSliderMessages,
): string {
  const template = messages.warnings[warning.type];
  if (warning.type === 'minDuration') return fillTemplate(template, { days: warning.minDays });
  if (warning.type === 'retrievalFee')
    return fillTemplate(template, { price: formatUsd(warning.perGb, locale) });
  return template;
}

interface RecommendationProps {
  recommendation: StorageClassRecommendation;
  locale: Locale;
  messages: StorageClassSliderMessages;
}

function Recommendation({ recommendation, locale, messages }: RecommendationProps) {
  const enter = useEnterAnimation();
  const { storageClass, warnings } = recommendation;
  return (
    <div
      className="mt-5 rounded-xl bg-accent-soft p-4"
      aria-live="polite"
      data-testid="recommendation"
    >
      <p className={hintClass}>{messages.recommendationLabel}</p>
      <m.p
        key={storageClass}
        {...enter}
        className="mt-1 text-xl font-semibold"
        data-storage-class={storageClass}
      >
        {messages.classNames[storageClass]}
      </m.p>
      <p className="mt-1 text-sm">{messages.classDescriptions[storageClass]}</p>
      {warnings.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm">
          {warnings.map((warning) => (
            <li key={warning.type} className="flex items-start gap-2">
              <WarningIcon className="mt-0.5 size-4 shrink-0" />{' '}
              {describeWarning(warning, locale, messages)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface SliderState {
  frequencyIndex: number;
  isUnknown: boolean;
  retention: RetentionDays;
}

interface ControlsProps extends SliderState {
  messages: StorageClassSliderMessages;
  onChange: (change: Partial<SliderState>) => void;
}

function FrequencySlider({ messages, frequencyIndex, isUnknown, onChange }: ControlsProps) {
  const sliderId = useId();
  const frequencyLabel = messages.frequencies[accessFrequencies[frequencyIndex] ?? 'daily'];
  return (
    <div>
      <label htmlFor={sliderId} className={labelClass}>
        {messages.frequencyLabel}
      </label>
      <p className="mt-1 font-semibold" aria-hidden="true">
        {isUnknown ? messages.unknownLabel : frequencyLabel}
      </p>
      <input
        id={sliderId}
        type="range"
        min={0}
        max={MAX_FREQUENCY_INDEX}
        step={1}
        value={frequencyIndex}
        aria-valuetext={frequencyLabel}
        disabled={isUnknown}
        onChange={(event) => onChange({ frequencyIndex: Number(event.target.value) })}
        className="mt-2 h-11 w-full cursor-pointer accent-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
      />
      <div className="flex justify-between text-xs text-muted" aria-hidden="true">
        <span>{messages.frequencies.daily}</span>
        <span>{messages.frequencies.rarely}</span>
      </div>
    </div>
  );
}

function RetentionSelect({ messages, retention, onChange }: ControlsProps) {
  const selectId = useId();
  return (
    <div>
      <label htmlFor={selectId} className={labelClass}>
        {messages.retentionLabel}
      </label>
      <select
        id={selectId}
        value={retention}
        onChange={(event) =>
          onChange({
            retention: pickOption(retentionDaysOptions, event.target.value, INITIAL_RETENTION),
          })
        }
        className={`${inputClass} font-sans`}
      >
        {retentionDaysOptions.map((days) => (
          <option key={days} value={days}>
            {messages.retentionOptions[days]}
          </option>
        ))}
      </select>
    </div>
  );
}

function Controls(props: ControlsProps) {
  return (
    <div className="mt-4 space-y-4">
      <FrequencySlider {...props} />
      <label className="flex min-h-11 items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={props.isUnknown}
          onChange={(event) => props.onChange({ isUnknown: event.target.checked })}
          className="size-5 accent-[var(--accent)]"
        />
        {props.messages.unknownLabel}
      </label>
      <RetentionSelect {...props} />
    </div>
  );
}

function StorageClassSliderBody({ locale, messages, pricing }: StorageClassSliderProps) {
  const [state, setState] = useState<SliderState>({
    frequencyIndex: INITIAL_FREQUENCY_INDEX,
    isUnknown: false,
    retention: INITIAL_RETENTION,
  });
  const markUsed = useInteractionTracker('StorageClassSlider');
  const frequency = accessFrequencies[state.frequencyIndex] ?? 'daily';
  const recommendation = recommendStorageClass(
    { frequency: state.isUnknown ? 'unknown' : frequency, retentionDays: state.retention },
    pricing,
  );
  const bars = compareScenarioCosts(frequency, pricing).map(({ storageClass, cost }) => ({
    id: storageClass,
    label: messages.classNames[storageClass],
    value: cost.total,
    highlighted: storageClass === recommendation.storageClass,
    badge: storageClass === recommendation.storageClass ? messages.recommendedBadge : undefined,
  }));
  const handleChange: ControlsProps['onChange'] = (change) => {
    setState((current) => ({ ...current, ...change }));
    markUsed();
  };
  const caption = state.isUnknown
    ? fillTemplate(messages.unknownChartNote, { frequency: messages.frequencies[frequency] })
    : messages.chartCaption;
  return (
    <div>
      <Controls messages={messages} {...state} onChange={handleChange} />
      <Recommendation recommendation={recommendation} locale={locale} messages={messages} />
      <CostBars
        title={messages.chartTitle}
        bars={bars}
        formatValue={(value) => formatUsd(value, locale)}
      />
      <p className={`mt-3 ${hintClass}`}>{caption}</p>
      <p className={`mt-2 ${hintClass}`}>{messages.tradeoffNote}</p>
      <p className={`mt-2 ${hintClass}`}>{messages.intelligentTieringNote}</p>
    </div>
  );
}

export default function StorageClassSlider(props: StorageClassSliderProps) {
  return (
    <IslandFrame
      island="StorageClassSlider"
      title={props.messages.title}
      fallback={props.messages.fallback}
    >
      <StorageClassSliderBody {...props} />
    </IslandFrame>
  );
}
