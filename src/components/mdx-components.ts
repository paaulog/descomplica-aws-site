import S3Island from './interactive/S3Island.astro';
import Analogy from './sections/Analogy.astro';
import Card from './sections/Card.astro';
import CardGrid from './sections/CardGrid.astro';
import Hero from './sections/Hero.astro';
import NextHook from './sections/NextHook.astro';
import NextSteps from './sections/NextSteps.astro';
import PricingNote from './sections/PricingNote.astro';
import SmallWin from './sections/SmallWin.astro';
import Steps from './sections/Steps.astro';
import Summary from './sections/Summary.astro';
import CodeTabs from './ui/CodeTabs.astro';
import Term from './ui/Term.astro';

// Available in every section MDX without imports, so content files stay free of paths.
export const mdxComponents = {
  Analogy,
  Card,
  CardGrid,
  CodeTabs,
  Hero,
  NextHook,
  NextSteps,
  PricingNote,
  S3Island,
  SmallWin,
  Steps,
  Summary,
  Term,
};
