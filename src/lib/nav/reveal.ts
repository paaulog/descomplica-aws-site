const READY_CLASS = 'reveal-ready';
const REVEALED_CLASS = 'is-revealed';
// Starts the transition slightly before the section reaches the viewport bottom.
const REVEAL_MARGIN = '0px 0px -10% 0px';

function isInViewport(element: Element): boolean {
  return element.getBoundingClientRect().top < window.innerHeight;
}

// Content is only hidden once this runs, so a failed script never leaves the page blank.
export function observeReveal(elements: readonly Element[]): () => void {
  const pending = elements.filter((element) => !isInViewport(element));
  for (const element of elements) {
    if (!pending.includes(element)) element.classList.add(REVEALED_CLASS);
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries.filter((item) => item.isIntersecting)) {
        entry.target.classList.add(REVEALED_CLASS);
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: REVEAL_MARGIN },
  );
  for (const element of pending) observer.observe(element);
  document.documentElement.classList.add(READY_CLASS);
  return () => observer.disconnect();
}
