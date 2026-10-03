import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Leest de échte broncode van een demo, zodat het codevoorbeeld op de site
 * nooit kan afwijken van wat je ziet draaien.
 */
export function demoSource(key: string): string {
  try {
    const file = join(process.cwd(), "demos", `${key}.tsx`);
    return readFileSync(file, "utf8").replace(/^"use client";\n+/, "").trimEnd();
  } catch {
    return "";
  }
}

/** Leest een bestand uit packages/ui/src (voor "de code van dit component"). */
export function uiSource(relative: string): string {
  try {
    return readFileSync(join(process.cwd(), "../../packages/ui/src", relative), "utf8").trimEnd();
  } catch {
    return "";
  }
}
