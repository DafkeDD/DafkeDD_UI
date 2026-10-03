# DafkeDD UI

[Nederlands](README.nl.md) · **English**

A fully in-house React component library, built on the **DafkeDD UI design**.
It works like shadcn/ui — same composition, same copy-paste approach — but **without a single line
of code from shadcn, Radix, Headless UI, cva or clsx**. Everything lives in `packages/ui/src`.

```
161 components · 4 languages · 2 themes · 3 densities · 0 UI dependencies in the core
```

| Category | Count | For |
| --- | --- | --- |
| Basics | 12 | Button, Badge, Card, Avatar, Icon, Text, Kbd, Skeleton … |
| Forms | 20 | Input, Select, Combobox, Toggle, Rating, Fieldset, RichEditor … |
| Overlays | 11 | Dialog, AlertDialog, Drawer, Popover, ContextMenu, HoverCard … |
| Data | 13 | Table, Chart, Stat, Timeline, MessageThread, Carousel, Countdown … |
| Navigation | 13 | Tabs, Sidebar, BottomNav, Menubar, Fab, Collapsible, FilterPanel … |
| Dates & scheduling | 8 | Calendar, WeekSchedule, ResourceColumns, Swimlanes … |
| Layout | 11 | AppShell, Workspace, Resizable, ScrollArea, Mockup, Stack/Row/Grid … |
| Feedback | 5 | Alert, EmptyState, Indicator, Confetti, PulseDot |
| Motion | 11 | Optional, behind `@dafke/ui/motion` |

---

## Getting started

```bash
npm install
npm run dev        # docs site on http://localhost:3000 (or 3001, 3002, ... if 3000 is taken)
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the documentation site (Next.js 15) |
| `npm run build` | Generates the registry and builds the site |
| `npm run registry` | Regenerates `registry/`, the props tables and the demo index |
| `npm run typecheck` | TypeScript check on the library, the docs and the tests |
| `npm test` | Vitest: unit, component and CLI tests (`tests/`) |
| `npm run test:watch` | Same, re-running on every change |
| `npm run test:ui` | Builds the site and clicks through the interactive components in Chrome |
| `npm run cli -- <command>` | Runs the CLI straight from the monorepo |

---

## Structure

```
dafke-ui/
├─ packages/
│  ├─ ui/                 The library
│  │  └─ src/
│  │     ├─ components/   138 components (.tsx + .css per component)
│  │     ├─ motion/       23 components behind @dafke/ui/motion (optional)
│  │     ├─ lib/          cn, variants, Slot, Portal, hooks, positioning, dates
│  │     ├─ icons/        in-house icon set (one path per glyph)
│  │     └─ styles/       tokens.css + base.css + index.css
│  └─ cli/                npx dafke-ui  (init / add / update / list)
├─ apps/
│  └─ docs/               The documentation site with live previews
├─ registry/              Generated: source per component for the CLI
└─ scripts/
   └─ build-registry.mjs  Generates the registry, props tables and demo index
```

---

## Using it in another project

As long as the CLI isn't published on npm, link it once from this repo:

```bash
cd packages/cli && npm link            # after this, `dafke-ui` works anywhere on your machine
```

```bash
npx dafke-ui init                   # tokens, base CSS and helpers
npx dafke-ui add button card dialog # copy components (+ their dependencies)
npx dafke-ui add --all              # everything at once
npx dafke-ui update                 # update everything + add new components
npx dafke-ui list                   # overview
npx dafke-ui add button --registry https://raw.githubusercontent.com/DafkeDD/DafkeDD_UI/main/registry/index.json
```

The CLI writes to `components/ui/` (configurable in `dafke-ui.json`), rewrites the imports into
one flat folder and maintains `components/ui/ui.css` (CSS imports) and `components/ui/index.ts` (exports).
Import that one file in your global stylesheet and you're done.

`update` fetches the latest version of everything already in your project, immediately installs the
components added to the registry since your last update, and leaves files you changed yourself alone —
those are skipped unless you pass `--force`. Use `--dry-run` to see beforehand what would happen;
`--only-installed` sticks to what you already have. For this the CLI keeps `dafke-ui.lock.json`
(which components you have + a hash per file) — commit that file.

---

## Animation in the core

Overlays ease in and ease out: Dialog, Drawer, Popover, Tooltip and Toast stay in the DOM
briefly after closing with `data-state="closed"`, so the CSS can run an exit animation.
The `usePresence` hook in `packages/ui/src/lib/hooks.ts` handles this — about forty lines,
no dependency.

Accordion and Collapsible animate their height with `grid-template-rows: 0fr → 1fr`.
That way the height never has to be measured, and content that changes mid-animation
follows along smoothly.

Everything respects `prefers-reduced-motion`.

---

## Motion layer (optional)

The core of the library has zero dependencies and that stays that way. Next to it sits one
folder that does need something: `packages/ui/src/motion`, with the things that get far too
expensive in pure CSS — gestures, exit animations and layout that moves along.

```bash
npm i motion            # only needed if you import from it
```

```tsx
import { MotionDrawerContent, ReorderList, SendButton } from "@dafke/ui/motion";
```

| Component | What it adds |
|---|---|
| `MotionDrawerContent` | Replaces `DrawerContent`: spring motion, real exit animation, swipe to close |
| `ReorderList` | A list you reorder by dragging, with or without a handle |
| `MotionSegmented` | Same API as `Segmented`, but the active background slides along |
| `OtpVerification` | Verification card that checks itself: row → grid → confirmation |
| `PaymentCheckout` | Card details with a card that writes along and flips for the CVC |
| `UploadButton` | File field whose button unfolds and fills with the progress |
| `SendButton` | Folds into a paper plane that flies away |
| `OrderButton` | A delivery van driving through the button |
| `AddToCartButton` | Shrinks into a basket the item drops into |
| `ShareButton` | Fans out to your share channels |
| `DeleteButton` | A trash can that eats the label |

The action buttons share one state machine: `useAction` (idle → busy → done or error),
with a minimum play time so a fast backend doesn't cut the animation short.

`motion` is listed in `package.json` as an **optional** peer dependency: if you import nothing from
`@dafke/ui/motion`, you don't need to install it and it doesn't end up in your bundle.

The CLI keeps that distinction: `npx dafke-ui add --all` skips this folder, and
`npx dafke-ui update` doesn't install them on its own. You add them deliberately by name
or with `--with-extras`; the CLI then tells you which npm package you still need.

They all respect `prefers-reduced-motion`: they fade instead of move, and dragging is disabled.

---

## Multilingual documentation site

The docs site runs on [next-intl](https://next-intl.dev):

```
apps/docs/i18n/routing.ts      # locales + defaultLocale + localePrefix
apps/docs/i18n/request.ts      # loads messages/<locale>.json per request
apps/docs/i18n/navigation.ts   # Link, redirect, usePathname, useRouter
apps/docs/middleware.ts        # language detection (Next 16 calls this proxy.ts)
apps/docs/messages/*.json      # nl · fr · en · de
apps/docs/app/[locale]/...     # all routes under a locale segment
```

`localePrefix` is set to `never`: the URL stays `/docs`, and the language comes from the
`NEXT_LOCALE` cookie, otherwise from the `Accept-Language` header. The language switcher
in the top right (`components/locale-switcher.tsx`) sets that cookie.

To translate a text: add the key to all four `messages/*.json` files, then use
`useTranslations("namespace")` in a client component or
`getTranslations("namespace")` in a server component.

The metadata, navigation, top bar and homepage are translated. The texts on the documentation
pages themselves (introduction, installation, theming, component descriptions in
`content/catalog.ts`) are still hardcoded in Dutch.

---

## Design tokens

**All colors come from `packages/ui/src/styles/tokens.css`** — taken exactly from the
DafkeDD UI design. Components never write a hex value; they only use variables:

```css
--accent: #0d9488;   --surface: #ffffff;   --text: #0f1729;
--green: #16a34a;    --amber: #d97706;     --red: #dc2626;
--r-sm: 8px;         --sh-md: 0 4px 12px rgba(16,23,41,.07);
```

Changing one token recolors the whole library, in light and dark.
Dark mode lives in the same file under `[data-theme="dark"]`.

---

## In-house primitives (no dependencies)

| File | Replaces | What it does |
| --- | --- | --- |
| `lib/cn.ts` | clsx / classnames | Merging class names |
| `lib/variants.ts` | cva | Variants → classes |
| `lib/slot.tsx` | @radix-ui/react-slot | The `asChild` pattern |
| `lib/anchor.ts` | Floating UI / Popper | Positioning with flip + clamp |
| `lib/portal.tsx` | Radix Portal | Rendering into `document.body` |
| `lib/hooks.ts` | Radix hooks | Controlled state, focus trap, escape, scroll lock, outside click |
| `lib/date.ts` | date-fns / dayjs | Weeks, months, ISO week numbers, parsing and formatting time (Intl, nl-BE) |
| `lib/schedule.ts` | — | Shared calendar model: resources, events, overlap packing, grouping |
| `lib/use-voice.ts` | react-speech-recognition | The browser's speech recognition, with a graceful fallback |
| `lib/image.ts` | react-easy-crop / browser-image-compression | Square-cropping and downsizing photos on a canvas |
| `icons/` | lucide / feather | In-house icon set, 24×24, stroke-based |

---

## Components

**Basics** — Button, Badge, Chip, Avatar, Card, Text, Separator, Kbd, Skeleton, Spinner, CopyButton, Icon
**Forms** — Input, Textarea, Field, Fieldset, Label, Checkbox, RadioGroup, Switch, Toggle, Select, Combobox, Slider, Rating, OtpInput, FileDrop, RichEditor, Composer, VoiceButton, AvatarUpload, SwatchPicker
**Overlays** — Dialog, AlertDialog (+ useConfirm), Drawer, Popover, HoverCard, DropdownMenu, ContextMenu, Tooltip, Command, Toast, ModalProvider (imperative)
**Navigation** — Tabs, Accordion, Collapsible, Breadcrumb, Pagination, Segmented, Stepper, Toolbar, Menubar, Sidebar, BottomNav, Fab (+ SpeedDial), FilterPanel
**Dates & scheduling** — Calendar, DatePicker, DateRangePicker, TimeField, TimeRangeField, PeriodNav
**Calendar views** — WeekSchedule (time grid), ResourceColumns, Swimlanes, TimeSlotList — one data model
**Data** — Table, ListRow, TaskItem, KeyValueList, Stat, DataPill, Timeline, MessageThread, Carousel, Countdown, QrCode, Charts (bar / line / donut / sparkline), Progress
**Feedback** — Alert, EmptyState, Indicator, PulseDot, ConfettiBurst
**Layout** — AppShell, Workspace, Resizable, ScrollArea, AspectRatio, Mockup, SectionHeader, EntityHeader, AuthLayout, Stack/Row/Grid, Theme (+ DensityToggle)

Every component: TypeScript, controlled + uncontrolled, ARIA roles, keyboard navigation,
visible focus, light + dark.

---

## Conventions

- Every CSS class starts with `lui-` — it never clashes with existing styling.
- One `.tsx` + one `.css` per component, always copied together.
- Sub-components follow the composition you know from shadcn:
  `Dialog / DialogTrigger / DialogContent / DialogHeader / DialogTitle / DialogFooter`.
- Props tables in the docs are **generated from the TypeScript source**, so they can't go stale.
- Tailwind v4 only runs as a CSS engine (reset + utilities for your own markup) and is not required.
- Drag & drop (WeekSchedule) is in-house pointer code: no dnd-kit, no react-beautiful-dnd.
- `Sidebar` has a `tone="inverted"` variant: a dark rail whose colors all come from the existing
  tokens via `color-mix`, so it stays within the DafkeDD UI palette too.
- `Workspace` stacks based on its own width (container query), not the window width.
- The four calendar views share `ScheduleResource` and `ScheduleEvent` from `lib/schedule.ts`, so
  switching views requires no conversion of your data.
- Density lives in a single token: `--density`. Every height and padding is `calc(Npx * var(--density))`, so
  `DensityToggle` (compact / normal / spacious) scales the whole library without touching a component.
- Voice (`VoiceButton`, `Composer`) runs on the browser's Web Speech API. If the browser doesn't support it,
  the button disappears or turns grey — you never get a dead button.
- New components carry `isNew: true` in `apps/docs/content/catalog.ts`; that shows the "new" label
  in the navigation, on the page and in the "New in this version" block.

---

## How it was built

This library was built in fifteen steps (see `apps/docs/content/roadmap.ts` and the
introduction page): foundation → forms & basics → navigation & feedback → overlays →
dates & scheduling → data & layout → extras → CLI → multilingual → the gaps from the designs →
motion → what shadcn and daisyUI did have → animation in the core → the list completed →
everything translated.

## Labels per release

`isNew` and `isUpdated` in `apps/docs/content/catalog.ts` belong to a single release, not to a component.
On every release: first remove all flags, then label only the components of that release again.

---

## Tests

| Where | What |
| --- | --- |
| `tests/ui/` | Hooks and components in jsdom (Vitest + Testing Library) |
| `tests/cli/` | The CLI end to end: init, add, update, and whether `add --all` compiles in strict mode |
| `tests/ui/structuur.test.ts` | Every component exported and styled, no external deps in the core |
| `scripts/ui-test.mjs` | Real Chrome on the built site: layout, dragging, animations, hydration |

Tests using `it.fails` with "BEKENDE BUG" (known bug) in their name document bugs that are still open.
They pass as long as the bug exists; once it's fixed, the test fails and you switch it to `it`.

Rule: **everything that gets added gets a test.**

---

## Branches & releases

| Branch | Role |
| --- | --- |
| `developer` | Where work happens and gets pushed. Every push runs CI (registry check, typecheck, build, tests, browser test). |
| `main` | Only via a pull request from `developer`. Every merge automatically creates a GitHub release. |

Making a release:

```bash
git switch developer
npm run version:patch        # or version:minor / version:major — updates every package.json, the lockfile and the registry
git commit -am "chore: release v0.1.1"
git push
```

Then open a pull request `developer → main` and merge it. The workflow
`.github/workflows/release.yml` builds everything, creates tag `vX.Y.Z` and a release with
auto-generated release notes, the registry (`dafke-ui-registry-vX.Y.Z.tar.gz`)
and the CLI package (`dafke-ui-X.Y.Z.tgz`). If the tag already exists because you forgot to bump
the version, the workflow skips the release with a warning.

After the release, bring `developer` level with `main` (fast-forward, no extra merge commit):

```bash
git switch developer
git pull --ff-only origin main
git push
```

Ignore GitHub's "main had recent pushes → Compare & pull request" banner: never open
a pull request `main → developer`.
