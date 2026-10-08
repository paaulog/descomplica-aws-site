import { usePrefersReducedMotion } from './use-reduced-motion';

export interface CostBar {
  id: string;
  label: string;
  value: number;
  highlighted?: boolean;
  badge?: string;
}

interface CostBarsProps {
  title: string;
  bars: readonly CostBar[];
  formatValue: (value: number) => string;
}

const PERCENT = 100;

// One series, so no legend: the title names it, each bar carries its label and its value as text.
export function CostBars({ title, bars, formatValue }: CostBarsProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const max = Math.max(...bars.map((bar) => bar.value), 0);
  return (
    <figure className="mt-5">
      <figcaption className="text-sm font-medium">{title}</figcaption>
      <ul className="mt-3 space-y-3">
        {bars.map((bar) => (
          <li key={bar.id} data-bar={bar.id} data-highlighted={bar.highlighted ? '' : undefined}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className={bar.highlighted ? 'font-semibold' : undefined}>
                {bar.label}
                {bar.badge && (
                  <span className="ml-2 rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium">
                    {bar.badge}
                  </span>
                )}
              </span>
              <span className="font-mono tabular-nums">{formatValue(bar.value)}</span>
            </div>
            <div className="mt-1 h-3" aria-hidden="true">
              <div
                className={`h-full rounded-e-[4px] ${bar.highlighted ? 'bg-accent' : 'bg-muted/40'} ${prefersReducedMotion ? '' : 'transition-[width] duration-300 ease-out'}`}
                style={{ width: max > 0 ? `${(bar.value / max) * PERCENT}%` : '0%' }}
              />
            </div>
          </li>
        ))}
      </ul>
    </figure>
  );
}
