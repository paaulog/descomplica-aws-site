export interface ScrollMetrics {
  scrollTop: number;
  scrollHeight: number;
  viewportHeight: number;
}

// Sub-pixel rounding on mobile browsers can leave the page a fraction short of the end.
const END_TOLERANCE_PX = 2;

export function computeReadingProgress({
  scrollTop,
  scrollHeight,
  viewportHeight,
}: ScrollMetrics): number {
  const scrollable = scrollHeight - viewportHeight;
  if (scrollable <= END_TOLERANCE_PX) return 1;
  return Math.min(1, Math.max(0, scrollTop / (scrollable - END_TOLERANCE_PX)));
}
