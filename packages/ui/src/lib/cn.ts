/**
 * cn — eigen mini-implementatie van het "classnames"-patroon.
 * Geen clsx, geen tailwind-merge: nul dependencies.
 *
 *   cn("lui-btn", isPrimary && "lui-btn-primary", { "is-open": open })
 */
export type ClassValue =
  | string
  | number
  | bigint
  | null
  | undefined
  | false
  | ClassValue[]
  | { [key: string]: unknown };

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];

  const walk = (value: ClassValue): void => {
    if (!value) return;
    if (typeof value === "string" || typeof value === "number" || typeof value === "bigint") {
      out.push(String(value));
      return;
    }
    if (Array.isArray(value)) {
      for (const item of value) walk(item);
      return;
    }
    if (typeof value === "object") {
      for (const key in value) {
        if ((value as Record<string, unknown>)[key]) out.push(key);
      }
    }
  };

  for (const input of inputs) walk(input);

  // Dedupe met behoud van volgorde.
  return Array.from(new Set(out.join(" ").split(/\s+/).filter(Boolean))).join(" ");
}
