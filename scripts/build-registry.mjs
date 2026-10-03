#!/usr/bin/env node
/**
 * Bouwt:
 *  1. /registry/*.json          — bron voor de CLI (`npx dafke-ui add button`)
 *  2. /apps/docs/content/props.generated.json — props-tabellen voor de docs
 *  3. /apps/docs/demos/index.ts — map van alle demo's
 *
 * Alles wordt afgeleid uit packages/ui/src, zodat documentatie en registry
 * nooit uit de pas lopen met de echte broncode.
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const uiSrc = join(root, "packages/ui/src");
const registryDir = join(root, "registry");
const docsDir = join(root, "apps/docs");

/* ------------------------------------------------------------------ */
/* 1. Catalogus inlezen (dezelfde bron als de documentatiesite)         */
/* ------------------------------------------------------------------ */
const catalogSource = readFileSync(join(docsDir, "content/catalog.ts"), "utf8");
const catalogBody = catalogSource.slice(catalogSource.indexOf("export const COMPONENTS"));

function parseCatalog() {
  const entries = [];
  const blocks = catalogBody.split(/\n  \{\n/).slice(1);
  for (const block of blocks) {
    const slug = block.match(/slug:\s*"([^"]+)"/)?.[1];
    if (!slug) continue;
    const name = block.match(/name:\s*"([^"]+)"/)?.[1] ?? slug;
    const description = block.match(/description:\s*"([^"]*)"/)?.[1] ?? "";
    const category = block.match(/category:\s*"([^"]*)"/)?.[1] ?? "";
    const files = [...(block.match(/files:\s*\[([^\]]*)\]/)?.[1] ?? "").matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    const dependsOn = [...(block.match(/dependsOn:\s*\[([^\]]*)\]/)?.[1] ?? "").matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    // npm-packages die dit component nodig heeft (alleen de motion-laag).
    const requires = [...(block.match(/requires:\s*\[([^\]]*)\]/)?.[1] ?? "").matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    // Namen van de props-tabellen, zodat we kunnen nakijken of ze echt bestaan.
    const props = [...(block.match(/props:\s*\[([^\]]*)\]/)?.[1] ?? "").matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    entries.push({ slug, name, description, category, files, dependsOn, requires, props });
  }
  return entries;
}

const components = parseCatalog();

/* ------------------------------------------------------------------ */
/* 2. Props uit de TypeScript-bron halen                                */
/* ------------------------------------------------------------------ */
function collectSourceFiles() {
  const files = [];
  for (const dir of ["components", "lib", "icons", "motion"]) {
    const full = join(uiSrc, dir);
    if (!existsSync(full)) continue;
    for (const file of readdirSync(full)) {
      if (file.endsWith(".tsx") || file.endsWith(".ts")) files.push(join(full, file));
    }
  }
  return files;
}

function parseDefaults(source) {
  const defaults = {};
  const pattern = /(\w+)\s*=\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|-?\d+(?:\.\d+)?|true|false|\[\]|\{\})[,\s)]/g;
  let match;
  while ((match = pattern.exec(source))) {
    if (!(match[1] in defaults)) defaults[match[1]] = match[2];
  }

  // Ook defaults die in variants({ defaultVariants: { ... } }) staan.
  const variantBlock = source.match(/defaultVariants:\s*\{([^}]*)\}/);
  if (variantBlock) {
    const inner = /(\w+):\s*("[^"]*"|'[^']*'|true|false|-?\d+)/g;
    let entry;
    while ((entry = inner.exec(variantBlock[1]))) {
      if (!(entry[1] in defaults)) defaults[entry[1]] = entry[2];
    }
  }

  return defaults;
}

function parseInterfaces(source) {
  const result = {};
  const pattern = /export interface (\w+)([^{]*)\{/g;
  let match;
  while ((match = pattern.exec(source))) {
    const name = match[1];
    const heritage = match[2].trim();
    let depth = 1;
    let index = pattern.lastIndex;
    while (index < source.length && depth > 0) {
      if (source[index] === "{") depth += 1;
      if (source[index] === "}") depth -= 1;
      index += 1;
    }
    const body = source.slice(pattern.lastIndex, index - 1);
    result[name] = { extends: heritage.replace(/^extends\s+/, ""), props: parseProps(body) };
  }
  return result;
}

function parseProps(body) {
  const props = [];
  const lines = body.split("\n");
  let doc = [];
  let buffer = "";

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith("/**")) {
      doc = [line.replace(/^\/\*\*\s?/, "").replace(/\*\/$/, "").trim()].filter(Boolean);
      if (line.endsWith("*/")) continue;
      continue;
    }
    if (line.startsWith("*/")) continue;
    if (line.startsWith("*")) {
      doc.push(line.replace(/^\*\s?/, "").trim());
      continue;
    }
    if (line.startsWith("//")) continue;

    buffer += (buffer ? " " : "") + line;
    if (!buffer.endsWith(";")) continue;

    const entry = buffer.match(/^\[?["']?([\w"'\-]+)["']?\]?(\?)?:\s*(.+);$/);
    buffer = "";
    if (!entry) {
      doc = [];
      continue;
    }
    props.push({
      name: entry[1].replace(/["']/g, ""),
      required: !entry[2],
      type: entry[3].trim(),
      description: doc.join(" ").trim(),
    });
    doc = [];
  }

  return props;
}

const interfaces = {};
const defaultsByInterface = {};
for (const file of collectSourceFiles()) {
  const source = readFileSync(file, "utf8");
  const parsed = parseInterfaces(source);
  const defaults = parseDefaults(source);
  for (const [name, value] of Object.entries(parsed)) {
    interfaces[name] = value;
    defaultsByInterface[name] = defaults;
  }
}

for (const [name, value] of Object.entries(interfaces)) {
  for (const prop of value.props) {
    const fallback = defaultsByInterface[name]?.[prop.name];
    if (fallback !== undefined) prop.default = fallback;
  }
}

writeFileSync(join(docsDir, "content/props.generated.json"), `${JSON.stringify(interfaces, null, 2)}\n`);

/* ------------------------------------------------------------------ */
/* 3. Registry schrijven                                                */
/* ------------------------------------------------------------------ */
if (existsSync(registryDir)) rmSync(registryDir, { recursive: true, force: true });
mkdirSync(join(registryDir, "components"), { recursive: true });

const sharedFiles = [
  "lib/cn.ts",
  "lib/variants.ts",
  "lib/slot.tsx",
  "lib/hooks.ts",
  "lib/anchor.ts",
  "lib/portal.tsx",
  "icons/icon.tsx",
  "icons/icons.ts",
  "styles/tokens.css",
  "styles/tailwind.css",
  "styles/base.css",
];

function readSource(relative) {
  const clean = relative.startsWith("../") ? relative.replace("../", "") : `components/${relative}`;
  return { path: clean, content: readFileSync(join(uiSrc, clean), "utf8") };
}

/**
 * Voegt lib-/icon-bestanden toe die een component importeert maar niet zelf
 * in de catalogus vermeldt (bv. lib/date.ts), zodat `add` altijd compileert.
 */
function withLibDependencies(files) {
  const result = [...files];
  const known = new Set([...sharedFiles, ...result.map((file) => file.path)]);
  for (let index = 0; index < result.length; index += 1) {
    for (const match of result[index].content.matchAll(/from "\.\.?\/(lib|icons)\/([\w-]+)"/g)) {
      const base = `${match[1]}/${match[2]}`;
      const path = [`${base}.ts`, `${base}.tsx`].find((candidate) => existsSync(join(uiSrc, candidate)));
      if (!path || known.has(path)) continue;
      known.add(path);
      result.push({ path, content: readFileSync(join(uiSrc, path), "utf8") });
    }
  }
  return result;
}

const waarschuwingen = [];

/* Props-tabellen die naar een niet-bestaande interface verwijzen renderen stil
   niets. Dat gebeurt zodra een type een `export type` is in plaats van een
   `export interface` — de parser hierboven leest alleen het laatste. */
for (const entry of components) {
  for (const naam of entry.props ?? []) {
    if (!interfaces[naam]) {
      waarschuwingen.push(`${entry.slug}: props-tabel "${naam}" bestaat niet als export interface — de tabel blijft leeg`);
    }
  }
}

const payloads = new Map();
const index = [];
for (const entry of components) {
  const files = withLibDependencies(entry.files.map(readSource));
  payloads.set(entry.slug, files);
  const payload = {
    name: entry.slug,
    title: entry.name,
    description: entry.description,
    category: entry.category,
    dependencies: entry.dependsOn,
    requires: entry.requires,
    files,
  };
  writeFileSync(join(registryDir, "components", `${entry.slug}.json`), `${JSON.stringify(payload, null, 2)}\n`);
  index.push({
    name: entry.slug,
    title: entry.name,
    description: entry.description,
    category: entry.category,
    dependencies: entry.dependsOn,
    requires: entry.requires,
    files: files.map((file) => file.path),
  });
}

writeFileSync(
  join(registryDir, "index.json"),
  `${JSON.stringify(
    {
      name: "dafke-ui",
      version: JSON.parse(readFileSync(join(root, "packages/ui/package.json"), "utf8")).version,
      style: "dafke",
      shared: sharedFiles.filter((file) => existsSync(join(uiSrc, file))).map((file) => ({ path: file, content: readFileSync(join(uiSrc, file), "utf8") })),
      components: index,
    },
    null,
    2
  )}\n`
);

/* ------------------------------------------------------------------ */
/* 3b. Zuster-imports nakijken                                          */
/* ------------------------------------------------------------------ */
/* withLibDependencies volgt alleen ../lib/ en ../icons/. Een import van een
   ander component (from "./field") moet met de hand in dependsOn staan; vergeet
   je dat, dan levert `add <component>` een bestand dat naar een onbestaande
   buur verwijst. Daarom hier de controle. */
const perSlug = new Map(components.map((entry) => [entry.slug, entry]));
const gedeeldeNamen = new Set(sharedFiles.map((file) => basename(file)));

function transitief(slug, gezien = new Set()) {
  if (gezien.has(slug)) return gezien;
  gezien.add(slug);
  for (const dep of perSlug.get(slug)?.dependsOn ?? []) transitief(dep, gezien);
  return gezien;
}

for (const entry of components) {
  const beschikbaar = new Set(gedeeldeNamen);
  for (const slug of transitief(entry.slug)) {
    for (const file of payloads.get(slug) ?? []) beschikbaar.add(basename(file.path));
  }
  for (const file of payloads.get(entry.slug) ?? []) {
    if (!/\.tsx?$/.test(file.path)) continue;
    for (const match of file.content.matchAll(/from "\.\/([\w-]+)"/g)) {
      const naam = match[1];
      if (beschikbaar.has(`${naam}.tsx`) || beschikbaar.has(`${naam}.ts`)) continue;
      waarschuwingen.push(
        `${entry.slug}: ${basename(file.path)} importeert "./${naam}" maar dat bestand komt niet mee — zet "${naam}" in dependsOn`
      );
    }
  }
}

/* ------------------------------------------------------------------ */
/* 4. Demo-index genereren                                              */
/* ------------------------------------------------------------------ */
const demoDir = join(docsDir, "demos");
const demoFiles = readdirSync(demoDir).filter((file) => file.endsWith(".tsx")).sort();
const toIdentifier = (key) => key.replace(/(^|-)([a-z])/g, (_, __, char) => char.toUpperCase());

writeFileSync(
  join(demoDir, "index.ts"),
  [
    "/* Automatisch gegenereerd door scripts/build-registry.mjs — niet handmatig aanpassen. */",
    '"use client";',
    'import type { ComponentType } from "react";',
    "",
    ...demoFiles.map((file) => `import ${toIdentifier(basename(file, ".tsx"))} from "./${basename(file, ".tsx")}";`),
    "",
    "export const DEMOS: Record<string, ComponentType> = {",
    ...demoFiles.map((file) => `  "${basename(file, ".tsx")}": ${toIdentifier(basename(file, ".tsx"))},`),
    "};",
    "",
  ].join("\n")
);

console.log(
  `registry: ${index.length} componenten · props: ${Object.keys(interfaces).length} interfaces · demo's: ${demoFiles.length}`
);

if (waarschuwingen.length > 0) {
  const streep = "-".repeat(72);
  console.warn(`
${streep}
${waarschuwingen.length} waarschuwing(en) uit de catalogus:
`);
  for (const regel of waarschuwingen) console.warn(`  ! ${regel}`);
  console.warn(`${streep}
`);
}
