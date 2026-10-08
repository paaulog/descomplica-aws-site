export type TemplateValues = Record<string, string | number>;

// Unknown placeholders stay visible, so a typo shows up on the page instead of vanishing.
export function fillTemplate(template: string, values: TemplateValues): string {
  return template.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
    Object.hasOwn(values, name) ? String(values[name]) : placeholder,
  );
}
