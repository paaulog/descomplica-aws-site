import type { StorageClass } from './storage-class';

export type LifecycleAction = { type: 'transition'; to: StorageClass } | { type: 'expire' };

export interface LifecycleRule {
  afterDays: number;
  action: LifecycleAction;
}

export type LifecycleStep =
  | { day: number; event: 'upload' | 'transition'; storageClass: StorageClass }
  | { day: number; event: 'expire'; storageClass: null };

const INITIAL_CLASS: StorageClass = 'STANDARD';

// The AWS lifecycle waterfall, warmest first: Standard-IA may move to Intelligent-Tiering, not back.
const WATERFALL: readonly StorageClass[] = [
  'STANDARD',
  'STANDARD_IA',
  'INTELLIGENT_TIERING',
  'GLACIER_IR',
  'GLACIER',
  'DEEP_ARCHIVE',
];

const rankClass = (storageClass: StorageClass): number => WATERFALL.indexOf(storageClass);

function sortRules(rules: readonly LifecycleRule[]): LifecycleRule[] {
  return rules.toSorted((first, second) => first.afterDays - second.afterDays);
}

function toStep(rule: LifecycleRule, current: StorageClass): LifecycleStep | null {
  const day = rule.afterDays;
  if (rule.action.type === 'expire') return { day, event: 'expire', storageClass: null };
  // Lifecycle only moves objects down the waterfall, towards colder (cheaper) classes.
  if (rankClass(rule.action.to) <= rankClass(current)) return null;
  return { day, event: 'transition', storageClass: rule.action.to };
}

// Lists what happens to one object from upload until `days`; expiring ends the line.
export function lifecycleTimeline(rules: readonly LifecycleRule[], days: number): LifecycleStep[] {
  const steps: LifecycleStep[] = [{ day: 0, event: 'upload', storageClass: INITIAL_CLASS }];
  let current: StorageClass = INITIAL_CLASS;
  for (const rule of sortRules(rules).filter((candidate) => candidate.afterDays <= days)) {
    const step = toStep(rule, current);
    if (!step) continue;
    steps.push(step);
    if (step.storageClass === null) break;
    current = step.storageClass;
  }
  return steps;
}
