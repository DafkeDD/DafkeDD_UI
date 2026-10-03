/**
 * Bewaakt de opbouw van de library: alles wat er staat wordt ook
 * geëxporteerd en gestyled, en de kern blijft vrij van dependencies.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join, basename } from "node:path";

const src = join(__dirname, "../../packages/ui/src");
const lees = (pad: string) => readFileSync(join(src, pad), "utf8");
const bestanden = (map: string, ext: string) =>
  readdirSync(join(src, map)).filter((f) => f.endsWith(ext)).map((f) => basename(f, ext));

describe("library-structuur", () => {
  it("elk component staat in index.ts", () => {
    const index = lees("index.ts");
    const ontbreekt = bestanden("components", ".tsx").filter((naam) => !index.includes(`./components/${naam}"`));
    expect(ontbreekt).toEqual([]);
  });

  it("elk motion-component staat in motion/index.ts", () => {
    const index = lees("motion/index.ts");
    const ontbreekt = bestanden("motion", ".tsx").filter((naam) => !index.includes(`./${naam}"`));
    expect(ontbreekt).toEqual([]);
  });

  it("elk component-CSS-bestand wordt geïmporteerd in styles/index.css", () => {
    const css = lees("styles/index.css");
    const ontbreekt = bestanden("components", ".css").filter((naam) => !css.includes(`components/${naam}.css`));
    expect(ontbreekt).toEqual([]);
  });

  it("de kern importeert geen externe packages buiten react", () => {
    const fout: string[] = [];
    for (const map of ["components", "lib", "icons"]) {
      for (const bestand of readdirSync(join(src, map)).filter((f) => /\.tsx?$/.test(f))) {
        for (const [, pakket] of lees(`${map}/${bestand}`).matchAll(/from "([^".][^"]*)"/g)) {
          if (pakket !== "react" && pakket !== "react-dom") fout.push(`${map}/${bestand}: ${pakket}`);
        }
      }
    }
    expect(fout).toEqual([]);
  });

  it("componenten gebruiken geen hardgecodeerde hex-kleuren in hun CSS", () => {
    // Puur wit/zwart mag (tekst op foto's, maskers). Uitzonderingen met een reden:
    //  - color-picker: het tintenspectrum is per definitie vaste kleuren
    //  - mockup: het apparaatframe imiteert echte hardware (ook in licht thema donker)
    const uitzonderingen = new Set(["color-picker", "mockup"]);
    const toegestaan = /^#(fff|000|ffffff|000000)$/i;
    const fout: string[] = [];
    for (const naam of bestanden("components", ".css")) {
      if (uitzonderingen.has(naam)) continue;
      const css = lees(`components/${naam}.css`).replace(/\/\*[\s\S]*?\*\//g, "");
      for (const [hex] of css.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
        if (!toegestaan.test(hex)) fout.push(`${naam}.css: ${hex}`);
      }
    }
    expect(fout).toEqual([]);
  });

  it("de aantallen in de README kloppen met de library", () => {
    const readme = readFileSync(join(src, "../../../README.md"), "utf8");
    const kern = bestanden("components", ".tsx").length;
    const motion = bestanden("motion", ".tsx").length;
    const registry = JSON.parse(readFileSync(join(src, "../../../registry/index.json"), "utf8"));
    expect(readme).toContain(`${registry.components.length} componenten ·`);
    expect(readme).toContain(`components/   ${kern} componenten`);
    expect(readme).toContain(`motion/       ${motion} componenten`);
  });
});
