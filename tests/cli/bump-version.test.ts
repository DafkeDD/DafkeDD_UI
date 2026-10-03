/** scripts/bump-version.mjs: verhoogt de versie overal tegelijk, zonder npm install. */
// @vitest-environment node
import { describe, it, expect, afterAll } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const root = join(__dirname, "../..");
const script = join(root, "scripts/bump-version.mjs");
// Eigen map per testbestand: testbestanden draaien parallel, een gedeelde map
// opruimen terwijl een ander bestand ze nog gebruikt geeft EPERM op Windows.
const tmpRoot = mkdtempSync(join(tmpdir(), "dafke-bump-"));
afterAll(() => {
  try {
    rmSync(tmpRoot, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  } catch {
    // Opruimen mag een test nooit doen falen (virusscanner, open handles op Windows).
  }
});

const PAKKETTEN = ["package.json", "packages/ui/package.json", "packages/cli/package.json", "apps/docs/package.json"];

function maakRepo(versie: string) {
  const dir = mkdtempSync(join(tmpRoot, "bump-"));
  for (const pad of PAKKETTEN) {
    mkdirSync(join(dir, pad, ".."), { recursive: true });
    writeFileSync(join(dir, pad), JSON.stringify({ name: pad, version: versie }, null, 2) + "\n");
  }
  const packages = Object.fromEntries(
    ["", "packages/ui", "packages/cli", "apps/docs"].map((k) => [k, { version: versie }])
  );
  packages["node_modules/react"] = { version: "19.0.0" };
  writeFileSync(join(dir, "package-lock.json"), JSON.stringify({ version: versie, packages }, null, 2) + "\n");
  return dir;
}
const lees = (dir: string, pad: string) => JSON.parse(readFileSync(join(dir, pad), "utf8"));
const bump = (dir: string, arg: string) => spawnSync(process.execPath, [script, arg], { cwd: dir, encoding: "utf8" });

describe("bump-version", () => {
  it.each([
    ["patch", "0.1.1"],
    ["minor", "0.2.0"],
    ["major", "1.0.0"],
    ["2.3.4", "2.3.4"],
  ])("%s: 0.1.0 → %s in alle package.json's en de lockfile", (arg, verwacht) => {
    const dir = maakRepo("0.1.0");
    expect(bump(dir, arg).status).toBe(0);
    for (const pad of PAKKETTEN) expect(lees(dir, pad).version, pad).toBe(verwacht);
    const lock = lees(dir, "package-lock.json");
    expect(lock.version).toBe(verwacht);
    expect(lock.packages["packages/cli"].version).toBe(verwacht);
    expect(lock.packages["node_modules/react"].version).toBe("19.0.0"); // dependencies blijven ongemoeid
  });

  it("weigert een ongeldig argument", () => {
    const dir = maakRepo("0.1.0");
    expect(bump(dir, "groot").status).not.toBe(0);
    expect(lees(dir, "package.json").version).toBe("0.1.0");
  });
});
