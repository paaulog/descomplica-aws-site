// Narrows a <select> value back to one of its known options instead of trusting a type cast.
export function pickOption<T extends number>(options: readonly T[], value: string, fallback: T): T {
  return options.find((option) => String(option) === value) ?? fallback;
}
