// Deliberately not a general template engine. Only a fixed set of tokens is
// substituted, so sequence bodies can never reach into arbitrary data.

export type TemplateVars = {
  name?: string | null;
  expertName?: string | null;
  businessName?: string | null;
  message?: string | null;
};

const ALLOWED = ["name", "expertName", "businessName", "message"] as const;

export function renderTemplate(input: string, vars: TemplateVars): string {
  return input.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key: string) => {
    if (!(ALLOWED as readonly string[]).includes(key)) return match;
    const value = vars[key as keyof TemplateVars];
    return value == null ? "" : String(value);
  });
}

/** First name only — "Hi Mohammad" reads better than "Hi Mohammad Rahman Khan". */
export function firstName(full?: string | null): string {
  if (!full) return "there";
  return full.trim().split(/\s+/)[0] || "there";
}
