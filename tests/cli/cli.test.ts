/**
 * End-to-end tests voor de CLI (packages/cli/bin/dafke-ui.mjs): we draaien hem
 * echt, in een tijdelijke map binnen de repo (zodat TypeScript react uit de
 * node_modules van de monorepo vindt), tegen de lokale registry/.
 *
 * `it.fails(...)` = BEKENDE BUG. Slaagt zolang de bug er is; na de fix faalt
 * hij — vervang dan `it.fails` door `it`.
 */
// @vitest-environment node
import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = join(__dirname, "../..");
const cli = join(root, "packages/cli/bin/dafke-ui.mjs");
const tmpRoot = join(root, ".tmp-tests");
mkdirSync(tmpRoot, { recursive: true });

let dir = "";
beforeEach(() => {
  dir = mkdtempSync(join(tmpRoot, "cli-"));
  writeFileSync(join(dir, "package.json"), '{ "name": "testproject", "private": true }\n');
});
afterAll(() => rmSync(tmpRoot, { recursive: true, force: true }));

function run(...args: string[]) {
  const r = spawnSync(process.execPath, [cli, ...args], {
    cwd: dir,
    encoding: "utf8",
    env: { ...process.env, NO_COLOR: "1", DAFKE_UI_REGISTRY: "" },
  });
  return { code: r.status, out: `${r.stdout}${r.stderr}` };
}
const lees = (pad: string) => readFileSync(join(dir, pad), "utf8");
const ui = (pad: string) => join(dir, "components/ui", pad);
const lijst = () => readdirSync(join(dir, "components/ui")).sort();

describe("dafke-ui init", () => {
  it("schrijft config, gedeelde bestanden en het CSS-verzamelbestand", () => {
    const { code } = run("init", "--yes");
    expect(code).toBe(0);
    const config = JSON.parse(lees("dafke-ui.json"));
    expect(config.componentsDir).toBe("components/ui");
    for (const f of ["tokens.css", "base.css", "cn.ts", "hooks.ts", "ui.css", "index.ts"]) {
      expect(existsSync(ui(f)), f).toBe(true);
    }
    expect(lees("components/ui/ui.css")).toContain('@import "./tokens.css"');
    expect(lees("components/ui/ui.css")).not.toContain("tailwind.css");
  });

  it("--version toont de versie uit package.json", () => {
    const versie = JSON.parse(readFileSync(join(root, "packages/cli/package.json"), "utf8")).version;
    expect(run("--version").out).toContain(versie);
  });
});

describe("dafke-ui add", () => {
  it("kopieert een component met zijn afhankelijkheden en houdt index/ui.css/lock bij", () => {
    run("init", "--yes");
    const { code } = run("add", "button", "--yes");
    expect(code).toBe(0);
    expect(existsSync(ui("button.tsx"))).toBe(true);
    expect(existsSync(ui("button.css"))).toBe(true);
    expect(existsSync(ui("spinner.tsx"))).toBe(true); // afhankelijkheid
    expect(lees("components/ui/index.ts")).toContain('export * from "./button"');
    expect(lees("components/ui/ui.css")).toContain('@import "./button.css"');
    expect(JSON.parse(lees("dafke-ui.lock.json")).components.button).toBeTruthy();
    // imports zijn herschreven naar één platte map
    expect(lees("components/ui/button.tsx")).not.toMatch(/from "\.\.\//);
  });

  it.fails("BEKENDE BUG: add --dry-run schrijft niets (werkt nu enkel bij update)", () => {
    run("init", "--yes");
    const voor = lijst();
    run("add", "dialog", "--yes", "--dry-run");
    expect(lijst()).toEqual(voor);
  });

  it("add --all levert code op die compileert (strict TypeScript)", () => {
    run("init", "--yes");
    expect(run("add", "--all", "--yes").code).toBe(0);
    writeFileSync(
      join(dir, "tsconfig.json"),
      JSON.stringify({
        compilerOptions: {
          target: "ES2022",
          lib: ["dom", "dom.iterable", "ES2022"],
          module: "ESNext",
          moduleResolution: "bundler",
          jsx: "react-jsx",
          strict: true,
          noEmit: true,
          skipLibCheck: true,
        },
        include: ["components/**/*"],
      })
    );
    const tsc = spawnSync(process.execPath, [join(root, "node_modules/typescript/bin/tsc"), "-p", dir], {
      encoding: "utf8",
    });
    expect(tsc.stdout + tsc.stderr).toBe("");
    expect(tsc.status).toBe(0);
  }, 120_000);
});

describe("dafke-ui update", () => {
  it("--dry-run schrijft niets", () => {
    run("init", "--yes");
    run("add", "button", "--yes");
    writeFileSync(ui("button.tsx"), "// oud\n");
    const voor = lijst();
    run("update", "--yes", "--dry-run", "--force");
    expect(lijst()).toEqual(voor);
    expect(lees("components/ui/button.tsx")).toBe("// oud\n");
  });

  it("laat zelf aangepaste bestanden met rust, tenzij --force", () => {
    run("init", "--yes");
    run("add", "button", "--yes");
    const aangepast = lees("components/ui/button.tsx") + "\n// mijn aanpassing\n";
    writeFileSync(ui("button.tsx"), aangepast);

    run("update", "--yes", "--only-installed");
    expect(lees("components/ui/button.tsx")).toBe(aangepast);

    run("update", "--yes", "--only-installed", "--force");
    expect(lees("components/ui/button.tsx")).not.toContain("mijn aanpassing");
  });

  it.fails("BEKENDE BUG: update installeert niet de hele library als je maar één component hebt", () => {
    run("init", "--yes");
    run("add", "button", "--yes");
    const voor = lijst().length;
    run("update", "--yes");
    expect(lijst().length).toBeLessThan(voor + 20);
  });

  it.fails("BEKENDE BUG: update zet geen lib-bestanden in index.ts en geen tailwind.css in ui.css", () => {
    run("init", "--yes");
    run("add", "dialog", "--yes");
    // Gedeelde bestanden laten afwijken, zodat update ze opnieuw schrijft.
    writeFileSync(ui("hooks.ts"), lees("components/ui/hooks.ts") + "\n// oud\n");
    writeFileSync(ui("tailwind.css"), lees("components/ui/tailwind.css") + "\n/* oud */\n");
    run("update", "--yes", "--only-installed", "--force");
    expect(lees("components/ui/index.ts")).not.toMatch(/export \* from "\.\/(anchor|date|hooks|cn)"/);
    expect(lees("components/ui/ui.css")).not.toContain("tailwind.css");
  });

  it.fails("BEKENDE BUG: een bestand dat enkel CRLF-regeleindes kreeg geldt niet als zelf aangepast", () => {
    run("init", "--yes");
    run("add", "button", "--yes");
    writeFileSync(ui("button.tsx"), lees("components/ui/button.tsx").replace(/\n/g, "\r\n"));
    const { out } = run("update", "--yes", "--only-installed", "--dry-run");
    expect(out).not.toMatch(/aangepast/i);
  });
});

describe("foutafhandeling", () => {
  it.fails("BEKENDE BUG: een onbekend component geeft exitcode ≠ 0", () => {
    run("init", "--yes");
    expect(run("add", "bestaat-niet", "--yes").code).not.toBe(0);
  });

  it.fails("BEKENDE BUG: een ongeldige --registry geeft een fout in plaats van stil terug te vallen", () => {
    run("init", "--yes");
    expect(run("add", "button", "--yes", "--registry", join(dir, "bestaat/niet/index.json")).code).not.toBe(0);
  });
});
