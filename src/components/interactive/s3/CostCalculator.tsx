import * as m from 'motion/react-m';
import { useId, useState } from 'react';
import { formatDateTime, formatUsd } from '../../../lib/i18n/format';
import { fillTemplate } from '../../../lib/i18n/template';
import type { CostCalculatorMessages } from '../../../lib/i18n/ui';
import { estimateMonthlyCost, type CostBreakdown } from '../../../lib/s3/cost';
import {
  costFields,
  costPresetNames,
  costPresets,
  toStandardCostInput,
  type CostField,
  type CostFieldValues,
  type CostPresetName,
} from '../../../lib/s3/cost-presets';
import { CostBars } from '../CostBars';
import { IslandFrame } from '../IslandFrame';
import { useEnterAnimation } from '../motion-presets';
import { hintClass, inputClass, labelClass, secondaryButtonClass } from '../styles';
import type { CostCalculatorProps } from '../types';
import { useInteractionTracker } from '../use-interaction-tracker';

const INITIAL_PRESET: CostPresetName = 'photoApp';
const BREAKDOWN_LINES = ['storage', 'requests', 'transfer'] as const;

function isSamePreset(values: CostFieldValues, preset: CostPresetName): boolean {
  return costFields.every((field) => values[field] === costPresets[preset][field]);
}

interface FieldsProps {
  messages: CostCalculatorMessages;
  values: CostFieldValues;
  onChange: (field: CostField, value: number) => void;
}

function CostFields({ messages, values, onChange }: FieldsProps) {
  const idPrefix = useId();
  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      {costFields.map((field) => (
        <div key={field}>
          <label htmlFor={`${idPrefix}-${field}`} className={labelClass}>
            {messages.inputs[field]}
          </label>
          <input
            id={`${idPrefix}-${field}`}
            type="number"
            inputMode="decimal"
            min={0}
            value={Number.isNaN(values[field]) ? '' : values[field]}
            onChange={(event) => onChange(field, event.target.valueAsNumber)}
            className={inputClass}
          />
        </div>
      ))}
    </div>
  );
}

function CostTotal({
  cost,
  messages,
  locale,
}: { cost: CostBreakdown } & Omit<CostCalculatorProps, 'pricing'>) {
  const enter = useEnterAnimation();
  return (
    <div className="mt-6" aria-live="polite">
      <p className={hintClass}>{messages.totalLabel}</p>
      <m.p
        key={cost.total}
        {...enter}
        className="mt-1 text-5xl font-semibold tracking-tight"
        data-testid="cost-total"
      >
        {formatUsd(cost.total, locale)}
      </m.p>
    </div>
  );
}

function PresetButtons({
  messages,
  values,
  onPick,
}: {
  messages: CostCalculatorMessages;
  values: CostFieldValues;
  onPick: (values: CostFieldValues) => void;
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <span className={hintClass}>{messages.presetsLabel}:</span>
      {costPresetNames.map((preset) => (
        <button
          key={preset}
          type="button"
          className={secondaryButtonClass}
          aria-pressed={isSamePreset(values, preset)}
          onClick={() => onPick(costPresets[preset])}
        >
          {messages.presets[preset]}
        </button>
      ))}
    </div>
  );
}

function CostNotes({ locale, messages, pricing }: CostCalculatorProps) {
  const verifiedAt = formatDateTime(pricing.verifiedAt, locale, {
    dateStyle: 'long',
    timeZone: 'UTC',
  });
  return (
    <ul className={`mt-4 list-disc space-y-1 pl-5 ${hintClass}`}>
      <li>{fillTemplate(messages.freeTransferNote, { gb: pricing.transferOut.freeGb })}</li>
      <li>
        {fillTemplate(messages.freePlanNote, {
          credits: formatUsd(pricing.freePlan.creditsUsd, locale),
          extra: formatUsd(pricing.freePlan.extraCreditsUsd, locale),
          months: pricing.freePlan.months,
        })}
      </li>
      <li>{fillTemplate(messages.verifiedNote, { date: verifiedAt })}</li>
    </ul>
  );
}

function CostCalculatorBody(props: CostCalculatorProps) {
  const { locale, messages, pricing } = props;
  const [values, setValues] = useState<CostFieldValues>(costPresets[INITIAL_PRESET]);
  const markUsed = useInteractionTracker('CostCalculator');
  const cost = estimateMonthlyCost(toStandardCostInput(values), pricing);
  const update = (next: CostFieldValues) => {
    setValues(next);
    markUsed();
  };
  const bars = BREAKDOWN_LINES.map((line) => ({
    id: line,
    label: messages.lines[line],
    value: cost[line],
  }));
  return (
    <div>
      <PresetButtons messages={messages} values={values} onPick={update} />
      <CostFields
        messages={messages}
        values={values}
        onChange={(field, value) => update({ ...values, [field]: value })}
      />
      <CostTotal cost={cost} messages={messages} locale={locale} />
      <CostBars
        title={messages.breakdownTitle}
        bars={bars}
        formatValue={(value) => formatUsd(value, locale)}
      />
      <CostNotes {...props} />
    </div>
  );
}

export default function CostCalculator(props: CostCalculatorProps) {
  return (
    <IslandFrame
      island="CostCalculator"
      title={props.messages.title}
      fallback={props.messages.fallback}
    >
      <CostCalculatorBody {...props} />
    </IslandFrame>
  );
}
