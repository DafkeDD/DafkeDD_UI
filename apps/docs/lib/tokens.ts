import { readFileSync } from "node:fs";
import { join } from "node:path";

export interface TokenEntry {
  name: string;
  light: string;
  dark?: string;
}

/** Leest tokens.css en geeft alle variabelen terug met hun licht- en donkerwaarde. */
export function readTokens(): TokenEntry[] {
  const source = readFileSync(
    join(process.cwd(), "../../packages/ui/src/styles/tokens.css"),
    "utf8"
  );

  const block = (selector: string) => {
    const index = source.indexOf(selector);
    if (index === -1) return "";
    const start = source.indexOf("{", index);
    const end = source.indexOf("\n}", start);
    return source.slice(start, end);
  };

  const parse = (text: string) => {
    const map = new Map<string, string>();
    for (const match of text.matchAll(/(--[\w-]+):\s*([^;]+);/g)) {
      map.set(match[1], match[2].trim());
    }
    return map;
  };

  const light = parse(block(":root {"));
  const dark = parse(block('[data-theme="dark"] {'));

  return [...light.entries()].map(([name, value]) => ({
    name,
    light: value,
    dark: dark.get(name),
  }));
}

/** `key` verwijst naar de vertaling in messages/<taal>.json onder tokenGroups. */
export const TOKEN_GROUPS: Array<{ key: string; names: string[] }> = [
  {
    key: "accent",
    names: ["--accent", "--accent-hover", "--accent-active", "--accent-fg", "--accent-tint", "--accent-tint-2", "--accent-border"],
  },
  {
    key: "surfaces",
    names: ["--bg", "--surface", "--surface-2", "--surface-3", "--surface-hover", "--border", "--border-strong"],
  },
  {
    key: "text",
    names: ["--text", "--text-2", "--text-3", "--text-inv"],
  },
  {
    key: "status",
    names: [
      "--green", "--green-tint", "--green-border",
      "--amber", "--amber-tint", "--amber-border",
      "--red", "--red-tint", "--red-border",
      "--blue", "--blue-tint", "--blue-border",
      "--violet", "--violet-tint", "--violet-border",
    ],
  },
  {
    key: "dataviz",
    names: ["--chart-1", "--chart-2", "--chart-3", "--chart-4", "--chart-5", "--chart-6"],
  },
];
