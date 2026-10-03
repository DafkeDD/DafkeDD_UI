#!/usr/bin/env node
/**
 * dafke-ui — kopieert componenten uit de registry naar je project.
 * Zelfde idee als de shadcn-CLI, volledig zelf geschreven, zonder dependencies.
 *
 *   npx dafke-ui init
 *   npx dafke-ui add button card dialog
 *   npx dafke-ui add --all
 *   npx dafke-ui update
 *   npx dafke-ui list
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname, basename, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline/promises";
import { createHash } from "node:crypto";

const here = dirname(fileURLToPath(import.meta.url));
const cwd = process.cwd();
const ESC = "\u001b";

const c = {
  reset: `${ESC}[0m`,
  bold: `${ESC}[1m`,
  dim: `${ESC}[2m`,
  teal: `${ESC}[36m`,
  green: `${ESC}[32m`,
  red: `${ESC}[31m`,
  amber: `${ESC}[33m`,
};

const log = (message = "") => console.log(message);
const ok = (message) => log(`${c.green}+${c.reset} ${message}`);
const warn = (message) => log(`${c.amber}!${c.reset} ${message}`);
const fail = (message) => {
  log(`${c.red}x${c.reset} ${message}`);
  process.exit(1);
};

const CONFIG_FILE = "dafke-ui.json";
const DEFAULT_CONFIG = {
  componentsDir: "components/ui",
  cssEntry: "components/ui/ui.css",
  importAlias: "@/components/ui",
};

const LOCK_FILE = "dafke-ui.lock.json";

let registryPath = null;

/* ------------------------------------------------------------------ */
/* Lockfile: welke componenten staan er, en met welke inhoud           */
/* ------------------------------------------------------------------ */
const hash = (content) => createHash("sha256").update(content).digest("hex").slice(0, 16);

function readLock() {
  const path = join(cwd, LOCK_FILE);
  if (!existsSync(path)) return { aanwezig: false, version: null, shared: {}, components: {} };
  const lock = JSON.parse(readFileSync(path, "utf8"));
  return {
    aanwezig: true,
    version: lock.version ?? null,
    shared: lock.shared ?? {},
    components: lock.components ?? {},
  };
}

function writeLock(lock, registry) {
  const ordered = {
    name: "dafke-ui",
    version: registry.version,
    bijgewerkt: new Date().toISOString(),
    shared: lock.shared,
    components: Object.fromEntries(Object.keys(lock.components).sort().map((key) => [key, lock.components[key]])),
  };
  writeFileSync(join(cwd, LOCK_FILE), `${JSON.stringify(ordered, null, 2)}
`);
}

/* ------------------------------------------------------------------ */
/* Registry vinden: --registry -> env -> monorepo -> meegeleverde kopie */
/* ------------------------------------------------------------------ */
async function loadRegistry(explicit) {
  const candidates = [
    explicit,
    process.env.DAFKE_UI_REGISTRY,
    findUp("registry/index.json"),
    join(here, "../registry/index.json"),
    // Ook buiten de monorepo (bv. na `npm link`): de registry naast deze CLI.
    join(here, "../../../registry/index.json"),
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (/^https?:\/\//.test(candidate)) {
      const response = await fetch(candidate);
      if (!response.ok) continue;
      registryPath = candidate;
      return response.json();
    }
    if (existsSync(candidate)) {
      registryPath = candidate;
      return JSON.parse(readFileSync(candidate, "utf8"));
    }
  }

  fail("Geen registry gevonden. Draai `npm run registry` in de monorepo, of geef --registry <pad|url> mee.");
  return null;
}

function findUp(relative) {
  let dir = cwd;
  for (let depth = 0; depth < 8; depth += 1) {
    const candidate = join(dir, relative);
    if (existsSync(candidate)) return candidate;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

function readConfig() {
  const path = join(cwd, CONFIG_FILE);
  if (!existsSync(path)) return null;
  return { ...DEFAULT_CONFIG, ...JSON.parse(readFileSync(path, "utf8")) };
}

function writeFileSafe(path, content, force) {
  mkdirSync(dirname(path), { recursive: true });
  if (existsSync(path) && !force) {
    return readFileSync(path, "utf8") === content ? "gelijk" : "bestaat";
  }
  writeFileSync(path, content);
  return "geschreven";
}

function ensureCssImport(config, cssFileName) {
  const entry = join(cwd, config.cssEntry);
  const line = `@import "./${cssFileName}";`;
  mkdirSync(dirname(entry), { recursive: true });

  if (!existsSync(entry)) {
    writeFileSync(
      entry,
      [
        "/* Dafke UI — verzamelbestand.",
        "   Importeer dit een keer in je globale stylesheet. */",
        line,
        "",
      ].join("\n")
    );
    return;
  }

  const current = readFileSync(entry, "utf8");
  if (current.includes(line)) return;
  writeFileSync(entry, `${current.trimEnd()}\n${line}\n`);
}

/**
 * Houdt <componentsDir>/index.ts bij, zodat je alles kan importeren via
 * `import { Button, Dialog } from "@/components/ui";`
 */
function ensureIndexExport(config, fileName, sourcePath = fileName) {
  if (!/\.tsx?$/.test(fileName) || fileName === "icons.ts") return;
  // Interne hulpbestanden (lib/) horen niet in de index: ze exporteren namen
  // als Align of Side die botsen met die van componenten. Importeer ze rechtstreeks.
  if (sourcePath.startsWith("lib/")) return;
  const entry = join(cwd, config.componentsDir, "index.ts");
  const line = `export * from "./${fileName.replace(/\.tsx?$/, "")}";`;

  if (!existsSync(entry)) {
    writeFileSync(entry, ["/* Dafke UI — bijgehouden door de CLI. */", line, ""].join("\n"));
    return;
  }

  const current = readFileSync(entry, "utf8");
  if (current.includes(line)) return;
  writeFileSync(entry, `${current.trimEnd()}\n${line}\n`);
}

/** Zet interne imports om naar een platte map met componenten. */
function rewriteImports(content) {
  return content
    .replace(/from "\.\.\/lib\/([\w-]+)"/g, 'from "./$1"')
    .replace(/from "\.\.\/icons\/([\w-]+)"/g, 'from "./$1"')
    .replace(/from "\.\.\/components\/([\w-]+)"/g, 'from "./$1"');
}

function report(status, target) {
  const shown = relative(cwd, target).split("\\").join("/");
  if (status === "geschreven") ok(shown);
  else if (status === "gelijk") log(`${c.dim}= ${shown} (ongewijzigd)${c.reset}`);
  else warn(`${shown} bestaat al — gebruik --force om te overschrijven`);
}

/**
 * Schrijft een registry-bestand plat in componentsDir en houdt CSS-import,
 * index.ts en de lockfile bij.
 */
function installFile(config, file, force, record) {
  const name = basename(file.path);
  const target = join(cwd, config.componentsDir, name);
  const content = rewriteImports(file.content);
  const status = writeFileSafe(target, content, force);

  // tailwind.css is opt-in: alleen zinvol na @import "tailwindcss", dus niet automatisch in het verzamelbestand.
  if (name === "tailwind.css") {
    /* niets */
  } else if (name.endsWith(".css")) ensureCssImport(config, name);
  else ensureIndexExport(config, name, file.path);
  if (status !== "bestaat") record?.(name, hash(content));

  report(status, target);
  return status;
}

function flag(args, name) {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
}

/* ------------------------------------------------------------------ */
/* Commando's                                                          */
/* ------------------------------------------------------------------ */
async function cmdInit(args) {
  const registry = await loadRegistry(flag(args, "--registry"));
  const force = args.includes("--force") || args.includes("-f");
  let config = readConfig();

  if (!config || force) {
    const auto = args.includes("--yes") || args.includes("-y");
    const rl = auto ? null : createInterface({ input: process.stdin, output: process.stdout });
    const ask = async (question, fallback) => {
      if (!rl) return fallback;
      const answer = await rl.question(`${c.teal}?${c.reset} ${question} ${c.dim}(${fallback})${c.reset} `);
      return answer.trim() || fallback;
    };

    config = {
      componentsDir: await ask("Waar mogen de componenten komen?", DEFAULT_CONFIG.componentsDir),
      cssEntry: await ask("Pad van het CSS-verzamelbestand?", DEFAULT_CONFIG.cssEntry),
      importAlias: await ask("Import-alias voor je componenten?", DEFAULT_CONFIG.importAlias),
    };
    rl?.close();
    writeFileSync(join(cwd, CONFIG_FILE), `${JSON.stringify(config, null, 2)}\n`);
    ok(`${CONFIG_FILE} aangemaakt`);
  } else {
    warn(`${CONFIG_FILE} bestaat al — gebruik --force om opnieuw te configureren.`);
  }

  const lock = readLock();

  log();
  log(`${c.bold}Gedeelde bestanden${c.reset}`);
  for (const file of registry.shared) {
    installFile(config, file, force, (name, digest) => {
      lock.shared[name] = digest;
    });
  }
  writeLock(lock, registry);

  log();
  ok("Klaar. Importeer het verzamelbestand in je globale stylesheet:");
  log(`  ${c.dim}@import "./${config.cssEntry}";${c.reset}`);
  log();
  log(`Volgende stap: ${c.teal}npx dafke-ui add button${c.reset}`);
}

async function readComponentPayload(name) {
  if (/^https?:\/\//.test(registryPath)) {
    const url = new URL(`components/${name}.json`, registryPath);
    const response = await fetch(url);
    if (response.ok) return response.json();
    fail(`Bronbestanden voor "${name}" niet gevonden op ${url}.`);
  }
  const file = join(dirname(registryPath), "components", `${name}.json`);
  if (existsSync(file)) return JSON.parse(readFileSync(file, "utf8"));
  fail(`Bronbestanden voor "${name}" niet gevonden naast ${registryPath}.`);
  return null;
}

async function cmdAdd(args) {
  const registry = await loadRegistry(flag(args, "--registry"));
  const config = readConfig();
  if (!config) fail(`Geen ${CONFIG_FILE} gevonden. Draai eerst \`npx dafke-ui init\`.`);

  const force = args.includes("--force") || args.includes("-f");
  const all = args.includes("--all");
  const registryArg = flag(args, "--registry");
  // --all pakt alleen wat zonder extra npm-packages werkt; de motion-laag
  // haal je er bewust bij met de naam of met --with-extras.
  const withExtras = args.includes("--with-extras");
  const requested = all
    ? registry.components
        .filter((component) => withExtras || (component.requires ?? []).length === 0)
        .map((component) => component.name)
    : args.filter((argument) => !argument.startsWith("-") && argument !== registryArg);

  if (requested.length === 0) fail("Geef minstens een component op, of gebruik --all.");

  const queue = [];
  const seen = new Set();
  const push = (name) => {
    if (seen.has(name)) return;
    const component = registry.components.find((entry) => entry.name === name);
    if (!component) {
      warn(`Onbekend component: ${name}`);
      return;
    }
    seen.add(name);
    for (const dependency of component.dependencies ?? []) push(dependency);
    queue.push(component);
  };
  requested.forEach(push);

  const lock = readLock();

  for (const component of queue) {
    const payload = await readComponentPayload(component.name);
    log();
    log(`${c.bold}${payload.title}${c.reset} ${c.dim}${payload.description}${c.reset}`);
    const bestanden = (lock.components[component.name] ??= {});
    for (const file of payload.files) {
      installFile(config, file, force, (name, digest) => {
        bestanden[name] = digest;
      });
    }
  }
  writeLock(lock, registry);

  log();
  ok(`${queue.length} component(en) klaar in ${config.componentsDir}/`);
  meldPackages(queue);
}

/** Vertelt welke npm-packages de gekopieerde componenten nodig hebben. */
function meldPackages(components) {
  const packages = [...new Set(components.flatMap((component) => component.requires ?? []))];
  if (packages.length === 0) return;
  log();
  warn(`Deze componenten hebben een extra package nodig:`);
  log(`  ${c.teal}npm i ${packages.join(" ")}${c.reset}`);
}

/**
 * Werkt alles bij naar de huidige registry: gedeelde bestanden, de componenten
 * die al in je project staan, en standaard ook componenten die nieuw zijn in de
 * registry. Bestanden die je zelf aangepast hebt blijven staan (tenzij --force).
 */
async function cmdUpdate(args) {
  const registry = await loadRegistry(flag(args, "--registry"));
  const config = readConfig();
  if (!config) fail(`Geen ${CONFIG_FILE} gevonden. Draai eerst \`npx dafke-ui init\`.`);

  const force = args.includes("--force") || args.includes("-f");
  const dryRun = args.includes("--dry-run") || args.includes("-n");
  const alleenBestaande = args.includes("--only-installed");
  const lock = readLock();

  /** Staat dit component al in het project? Lockfile eerst, anders de bestanden zelf. */
  const isGeinstalleerd = (component) =>
    Boolean(lock.components[component.name]) ||
    component.files.every((file) => existsSync(join(cwd, config.componentsDir, basename(file))));

  const bestaande = registry.components.filter(isGeinstalleerd);
  const metExtras = args.includes("--with-extras");
  const nieuwe = alleenBestaande
    ? []
    : registry.components.filter(
        (component) => !isGeinstalleerd(component) && (metExtras || (component.requires ?? []).length === 0)
      );
  const verdwenen = Object.keys(lock.components).filter(
    (name) => !registry.components.some((component) => component.name === name)
  );

  const telling = { bijgewerkt: 0, nieuw: 0, ongewijzigd: 0, overgeslagen: 0 };
  // Sommige bestanden zitten in meer dan een component; elk pad hoeft maar een keer.
  const gedaan = new Set();

  /** Eén bestand vergelijken met de registry en beslissen wat ermee moet. */
  const verwerk = (file, opgeslagen) => {
    const name = basename(file.path);
    const target = join(cwd, config.componentsDir, name);
    if (gedaan.has(name)) {
      opgeslagen[name] ??= hash(rewriteImports(file.content));
      return;
    }
    gedaan.add(name);
    const content = rewriteImports(file.content);
    const toon = relative(cwd, target).split("\\").join("/");

    if (!existsSync(target)) {
      if (!dryRun) {
        mkdirSync(dirname(target), { recursive: true });
        writeFileSync(target, content);
        if (name.endsWith(".css")) ensureCssImport(config, name);
        else ensureIndexExport(config, name);
      }
      opgeslagen[name] = hash(content);
      telling.nieuw += 1;
      ok(`${toon} ${c.dim}(nieuw)${c.reset}`);
      return;
    }

    const huidig = readFileSync(target, "utf8");
    if (huidig === content) {
      opgeslagen[name] = hash(content);
      telling.ongewijzigd += 1;
      return;
    }

    // Zonder lockfile-hash weten we niet of dit bestand van ons komt. Bij een
    // bestaande lockfile is dat verdacht (zelf gezet?), dus dan blijven we eraf.
    const verwacht = opgeslagen[name];
    const zelfAangepast = verwacht !== undefined && hash(huidig) !== verwacht;
    const onbekend = verwacht === undefined && lock.aanwezig;
    if ((zelfAangepast || onbekend) && !force) {
      telling.overgeslagen += 1;
      const reden = zelfAangepast ? "zelf aangepast" : "niet door de CLI gezet";
      warn(`${toon} — ${reden}, overgeslagen (gebruik --force om te overschrijven)`);
      return;
    }

    if (!dryRun) {
      writeFileSync(target, content);
      if (name.endsWith(".css")) ensureCssImport(config, name);
      else ensureIndexExport(config, name);
    }
    opgeslagen[name] = hash(content);
    telling.bijgewerkt += 1;
    ok(`${toon} ${c.dim}(bijgewerkt)${c.reset}`);
  };

  log();
  log(`${c.bold}Gedeelde bestanden${c.reset}`);
  for (const file of registry.shared) verwerk(file, lock.shared);

  if (bestaande.length > 0) {
    log();
    log(`${c.bold}Bestaande componenten${c.reset} ${c.dim}(${bestaande.length})${c.reset}`);
    for (const component of bestaande) {
      const payload = await readComponentPayload(component.name);
      const opgeslagen = (lock.components[component.name] ??= {});
      for (const file of payload.files) verwerk(file, opgeslagen);
    }
  }

  if (nieuwe.length > 0) {
    log();
    log(`${c.bold}Nieuw in de registry${c.reset} ${c.dim}(${nieuwe.length})${c.reset}`);
    for (const component of nieuwe) {
      const payload = await readComponentPayload(component.name);
      log(`${c.teal}${component.name}${c.reset} ${c.dim}${component.description}${c.reset}`);
      const opgeslagen = (lock.components[component.name] ??= {});
      for (const file of payload.files) verwerk(file, opgeslagen);
    }
  }

  for (const name of verdwenen) {
    warn(`${name} staat niet meer in de registry — bestanden blijven staan, verwijder ze zelf als je wil.`);
  }

  if (!dryRun) writeLock(lock, registry);

  meldPackages([...bestaande, ...nieuwe]);

  log();
  const delen = [
    `${telling.bijgewerkt} bijgewerkt`,
    `${telling.nieuw} nieuw`,
    `${telling.ongewijzigd} ongewijzigd`,
  ];
  if (telling.overgeslagen > 0) delen.push(`${telling.overgeslagen} overgeslagen`);
  ok(`registry v${registry.version} — ${delen.join(", ")}${dryRun ? `  ${c.amber}(--dry-run: niets geschreven)${c.reset}` : ""}`);
  if (alleenBestaande) log(`${c.dim}--only-installed: nieuwe componenten niet meegenomen.${c.reset}`);
  log();
}

async function cmdList(args) {
  const registry = await loadRegistry(flag(args, "--registry"));
  const groups = new Map();
  for (const component of registry.components) {
    const list = groups.get(component.category) ?? [];
    list.push(component);
    groups.set(component.category, list);
  }

  log();
  log(`${c.bold}Dafke UI${c.reset} ${c.dim}v${registry.version} - ${registry.components.length} componenten${c.reset}`);
  for (const [category, items] of groups) {
    log();
    log(`${c.teal}${category}${c.reset}`);
    for (const item of items) {
      log(`  ${item.name.padEnd(16)} ${c.dim}${item.description}${c.reset}`);
    }
  }
  log();
}

async function main() {
  const [command, ...args] = process.argv.slice(2);

  switch (command) {
    case "init":
      return cmdInit(args);
    case "add":
      return cmdAdd(args);
    case "update":
    case "up":
      return cmdUpdate(args);
    case "list":
    case "ls":
      return cmdList(args);
    case "--version":
    case "-v":
      return log(`dafke-ui ${JSON.parse(readFileSync(join(here, "..", "package.json"), "utf8")).version}`);
    default:
      log();
      log(`${c.bold}dafke-ui${c.reset} — je eigen componenten, in je eigen project.`);
      log();
      log(`  ${c.teal}init${c.reset}                 tokens, basis-CSS en hulpfuncties kopieren`);
      log(`  ${c.teal}add <namen...>${c.reset}       componenten kopieren (met hun afhankelijkheden)`);
      log(`  ${c.teal}add --all${c.reset}            alles in een keer`);
      log(`  ${c.teal}update${c.reset}               alles bijwerken + nieuwe componenten erbij`);
      log(`  ${c.teal}list${c.reset}                 toont alle beschikbare componenten`);
      log();
      log(`${c.dim}Opties: --force  --yes  --dry-run  --only-installed  --with-extras  --registry <pad|url>${c.reset}`);
      log();
      return undefined;
  }
}

main().catch((error) => fail(error.message));
