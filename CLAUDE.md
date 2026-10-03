# CLAUDE.md — Dafke UI

Instructies voor Claude (en andere AI-assistenten) die in deze repo werken.

## Git-regels (belangrijk)

- **Push altijd naar `developer`.** Nooit rechtstreeks naar `main` committen of pushen.
- Controleer vóór elke commit/push op welke branch je staat: `git branch --show-current`.
  Sta je op `main`, schakel dan eerst over: `git switch developer`.
- `main` krijgt enkel wijzigingen via een pull request `developer → main`.
  Elke merge naar `main` maakt automatisch een GitHub-release (`.github/workflows/release.yml`).
- Nooit force-pushen naar `main` of `developer`.
- Remote: `https://github.com/DafkeDD/DafkeDD_UI.git`

## Release maken

1. Op `developer`: `npm run version:patch` (of `version:minor` / `version:major`).
   Dit verhoogt de versie in alle package.json's + package-lock.json.
2. `git commit -am "chore: release vX.Y.Z"` en `git push` (naar developer).
3. Pull request `developer → main` openen en mergen (`gh pr create --base main --head developer --fill`).
4. De workflow maakt tag `vX.Y.Z` + release. Bestaat de tag al, dan wordt er niets gereleased.
5. Daarna `developer` gelijkzetten met `main` (fast-forward, geen extra merge-commit):
   `git switch developer && git pull --ff-only origin main && git push`.
   De GitHub-melding "main had recent pushes → Compare & pull request" negeren:
   nooit een pull request `main → developer` openen.

Maak nooit zelf tags of releases met de hand; dat doet de workflow.

## Tests (verplicht)

- **Alles wat erbij komt krijgt een test.** Nieuw component, nieuwe prop, nieuwe hook,
  nieuwe CLI-optie of een bugfix: geen wijziging zonder bijhorende test in dezelfde commit.
- Waar:
  - `tests/ui/*.test.tsx` — hooks en componenten (Vitest + Testing Library, jsdom)
  - `tests/cli/*.test.ts` — de CLI, end-to-end in een tijdelijke map
  - `tests/ui/structuur.test.ts` — exports, CSS-imports, geen externe deps, geen hex-kleuren
  - `scripts/ui-test.mjs` — echte Chrome-browsertest op de gebouwde docs-site; voeg een
    controle toe voor interactie die jsdom niet kan (layout, slepen, animaties, scrollen)
- Een bugfix begint met een test die de bug aantoont.
- `it.fails(...)` met "BEKENDE BUG" in de naam = gedocumenteerde, nog niet opgeloste bug.
  Los je hem op, dan faalt die test: zet hem om naar `it(...)`. Nooit een `it.fails`
  toevoegen om een falende test weg te moffelen.
- Test toegankelijk: zoek elementen op rol en naam (`getByRole("button", { name })`),
  niet op CSS-klasse, tenzij het om de klasse zelf gaat.

## Vóór elke push

```bash
npm run registry    # regenereert registry/, props.generated.json en demos/index.ts — mee committen
npm run typecheck   # library, docs én tests
npm test            # Vitest: unit-, component- en CLI-tests
npm run build
npm run test:ui     # optioneel lokaal (Chrome nodig); draait sowieso in CI
```

CI (`.github/workflows/ci.yml`, job `CI-check`) draait dit allemaal en faalt als
`npm run registry` nog wijzigingen oplevert. De release-workflow draait dezelfde tests
en maakt geen release als er één faalt.

## Projectstructuur & conventies

- `packages/ui/src` — de library (`@dafke/ui`), nul UI-dependencies in de kern.
  `motion/` is de enige map die `motion` mag importeren.
- `packages/cli` — CLI `dafke-ui` (init / add / update / list).
- `apps/docs` — Next.js 15 + next-intl docs-site (nl, fr, en, de; `localePrefix: "never"`).
- `registry/`, `apps/docs/content/props.generated.json`, `apps/docs/demos/index.ts` zijn
  **gegenereerd** — niet met de hand aanpassen.
- Elke CSS-klasse begint met `lui-`. Componenten gebruiken alleen tokens uit
  `packages/ui/src/styles/tokens.css`, nooit hex-waarden.
- Eén `.tsx` + één `.css` per component; nieuw component ook toevoegen aan
  `apps/docs/content/catalog.ts` (+ demo), `packages/ui/src/index.ts` **en een test**.
- Nieuwe vertaalsleutels altijd in alle vier `apps/docs/messages/*.json`.
- Regeleindes: LF (zie `.gitattributes`).
- Taal van code-commentaar en docs: Nederlands.
