const IN_VIEW_ATTRIBUTE = 'data-inview';

/** Marks illustration stages that are on screen, so CSS can pause the loops of all the others. */
export function observeArtStages(stages: readonly Element[]): () => void {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      entry.target.toggleAttribute(IN_VIEW_ATTRIBUTE, entry.isIntersecting);
    }
  });
  for (const stage of stages) observer.observe(stage);
  return () => observer.disconnect();
}
