# Word Blitz

A fast, multiplayer word-association game built with **React 19**, **TypeScript**,
**Vite** and **shadcn/ui**. Players are shown a random letter together with a
random question (for example `M – Is in the kitchen`) and race to come up with a
matching word. Cards are swiped away to advance, points are awarded after each
round, and themed question packs to keep things fresh.

---

# [Word Blitz](https://word-blitz-two.vercel.app/) Play it!

## 1. What the app does (non-technical summary)

Word Blitz is a small, mobile-first browser game that runs entirely on the
client – no backend, no login, no tracking. From a user perspective the app
provides:

1. **Multiplayer on one device.** Add two or more players before starting a
   round. After every swipe a score prompt appears so the group can award a
   point to whoever came up with the best answer.
2. **Themed question packs.** Pick a pre-built theme (e.g. _Animals_ or _+18_)
   or create a custom mix from all available questions before starting.
3. **A swipe-card game mode.** Each card shows a random letter and a random
   prompt. Swipe it away to reveal the next one. The round ends automatically
   when the deck runs out, or players can stop early.
4. **A prompt library.** A set of default questions ships with the app so the
   game is immediately playable. Users can also add, edit and delete their own
   questions through a dedicated management screen.
5. **A result screen with rankings.** After the round, players are ranked by
   score with confetti for the winner.

Because everything is stored in the browser (IndexedDB), the app works offline
after the first load and there is no account setup.

---

## 2. Technology stack

| Area              | Choice                                                                          |
| ----------------- | ------------------------------------------------------------------------------- |
| UI framework      | React 19 (function components + hooks)                                          |
| Language          | TypeScript 5.9 (strict mode)                                                    |
| Build tool        | Vite 7                                                                          |
| Component library | shadcn/ui v4 (radix-luma style) on `@base-ui/react`                             |
| Styling           | Tailwind CSS v4 (via `@tailwindcss/vite`) + OKLCH design tokens                 |
| Class composition | `class-variance-authority` (CVA), `clsx`, `tailwind-merge`                      |
| Font              | Geist Variable (via `@fontsource-variable/geist`)                               |
| Icons             | `lucide-react` (configured, usage growing)                                      |
| Animation         | `motion` (the successor of Framer Motion) for swipe gestures + `tw-animate-css` |
| Client-side DB    | IndexedDB via `dexie` + `dexie-react-hooks` (live queries)                      |
| Input validation  | `zod` schemas for question and player-name text                                 |
| Mobile shell      | Capacitor 8 (iOS + Android) with haptics, splash and status plugins             |
| Linting           | ESLint 9 with `typescript-eslint` and React Hooks plugins                       |

---

## 3. Project structure

```text
src/
├── App.tsx                      # App shell (header + Game container)
├── Game.tsx                     # Top-level screen router driven by game phase
├── main.tsx                     # Vite entry; bootstraps the database
├── index.css                    # Tailwind + shadcn design tokens (OKLCH)
│
├── assets/                      # Static images (logo, card background)
│
├── lib/
│   └── utils.ts                 # cn() helper (clsx + tailwind-merge)
│
├── components/
│   ├── BackButton.tsx           # Shared back-navigation button
│   ├── LoadingScreen.tsx        # Accessible spinner while DB hydrates
│   ├── PlayerSetup.tsx          # Add / remove players before a round
│   ├── QuestionListItem.tsx     # List row with inline edit + delete flow
│   ├── QuestionSourceToggle.tsx # Radio group: default / custom / both
│   ├── ScorePrompt.tsx          # Post-swipe overlay to award a point
│   ├── SwipeCards.tsx           # Motion-based swipeable card stack
│   ├── ThemePicker.tsx          # Theme selection tiles
│   │
│   ├── dialogs/
│   │   ├── AddQuestionDialog.tsx    # <dialog>-based modal for adding a prompt
│   │   ├── DeleteQuestionDialog.tsx # Confirmation modal before deleting
│   │   └── ThemeSwitchDialog.tsx    # Confirm theme switch when mix is active
│   │
│   ├── screens/
│   │   ├── SetupScreen.tsx          # Landing: players + start game
│   │   ├── SelectQuestionsScreen.tsx# Theme / custom-mix question picker
│   │   ├── CustomQuestionScreen.tsx # Full list with CRUD on own prompts
│   │   ├── PlayScreen.tsx           # Game screen with swipe cards + scoring
│   │   └── ResultScreen.tsx         # Scoreboard with rankings + confetti
│   │
│   └── ui/                      # shadcn/ui primitives (radix-luma style)
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       └── input.tsx
│
├── db/
│   └── db.ts                    # Dexie schema, seeding and settings migration
│
├── game/
│   ├── initialState.ts          # Game state, phase union type + Player type
│   ├── reducer.ts               # Pure reducer for all game transitions
│   ├── logic.ts                 # Random pair creation (Fisher–Yates shuffle)
│   ├── players.ts               # Player name validation, ID generation, ranking
│   ├── playSelection.ts         # Theme / custom-mix resolution logic
│   ├── questionList.ts          # Build visible question list by source
│   ├── questions.ts             # Default prompt list used as the DB seed
│   ├── questionValidation.ts    # zod schema + sanitization + duplicate check
│   └── themes.ts                # Built-in theme definitions (Animals, +18, …)
│
└── hooks/
    ├── useGame.ts               # Single hook that glues reducer + Dexie together
    └── useAddQuestionForm.ts    # Reusable form logic for adding a question
```

The architectural idea is a clear split between three layers:

- **State machine** (`game/reducer.ts`, `game/initialState.ts`) – pure, testable,
  no side effects. Also includes `players.ts` (name validation, ranking),
  `playSelection.ts` (theme / custom-mix resolution) and `themes.ts`.
- **Persistence** (`db/db.ts`) – Dexie/IndexedDB, including schema, seed data and
  a forward-compatible settings migration.
- **Glue** (`hooks/useGame.ts`) – a custom hook that exposes a single,
  narrow API to the React tree (`state`, `isLoading`, `startGame`,
  `addPlayer`, `removePlayer`, `awardPoint`, `selectTheme`, …).

Screens only talk to this hook; they never touch Dexie or the reducer directly.

---

## 4. Features in detail

### 4.1 Screen router via a finite-state machine

`Game.tsx` renders a different screen depending on `state.phase`, which is
strictly typed as one of:

```ts
type GamePhase =
  | "setup"
  | "select-questions"
  | "playing"
  | "result"
  | "custom-question";
```

The typical flow is **setup → select-questions → playing → result**. Users
can also branch into **custom-question** from the select-questions screen to
manage their prompt library.

All transitions go through the reducer (`START_GAME`, `END_GAME`, `NEXT_PAIR`,
`GO_TO_SELECT_QUESTIONS`, `GO_TO_CUSTOM_QUESTION`, `GO_TO_SETUP`, `GO_BACK`,
`ADD_PLAYER`, `REMOVE_PLAYER`, `SWIPE_AWAITING_SCORE`, `AWARD_POINT`), which
keeps navigation logic in one place and makes it easy to reason about. A small
history stack (last 3 phases) powers the `GO_BACK` action.

### 4.2 Gameplay

- **Random pair generation.** `createPairs` picks a random letter from the full
  English alphabet and a random question from the currently active prompt pool,
  using a Fisher–Yates shuffle.
- **Swipe to continue.** `SwipeCards` uses `motion`'s `useMotionValue` and
  `useTransform` to rotate and fade the card while dragging. Once the user
  drags past the threshold, the card is removed and a score prompt appears.
- **Per-swipe scoring.** After each swipe, `ScorePrompt` shows the player
  list so the group can award a point to whoever gave the best answer
  (`SWIPE_AWAITING_SCORE` → `AWARD_POINT`). The next card appears only after
  a point is awarded.
- **Remaining-cards counter.** The deck is finite (one card per active
  question). When the last card is swiped, the round ends automatically.
- **End game button.** Players can also stop early and navigate to the result
  screen at any time.
- **Empty-state protection.** The "Start game" button is disabled when no
  questions are available or no players have been added.

### 4.3 Persistent storage with IndexedDB (Dexie)

Defined in `src/db/db.ts`:

```ts
this.version(1).stores({
  defaultQuestions: "++id, &text",
  customQuestions: "++id, &text",
  settings: "&key",
});
```

- Three object stores: `defaultQuestions`, `customQuestions`, `settings`.
- `&text` enforces **uniqueness at the database level**, so duplicate prompts
  cannot be written even under races.
- `seedDefaultQuestions` imports the shipped prompt list on first launch only
  (no-op if the table already has rows).
- `migrateLegacySettings` converts the old `useDefaultQuestions` boolean flag
  into the new `questionSource` enum in a single Dexie transaction.
- `ensureInitialSettings` makes sure `questionSource` always has a value
  (defaults to `"default"`).
- `initializeDatabase` is called once from `main.tsx` before React renders.

### 4.4 Live, reactive data with `dexie-react-hooks`

`useGame` reads data through `useLiveQuery`, which re-renders the subscribing
components automatically whenever the underlying IndexedDB rows change – no
manual cache invalidation is needed.

```ts
const defaultQuestions = useLiveQuery(() => db.defaultQuestions.toArray(), []);
const customQuestions = useLiveQuery(() => db.customQuestions.toArray(), []);
const questionSourceSetting = useLiveQuery(
  () => db.settings.get(SETTINGS_KEYS.questionSource),
  [],
);
```

A loading state is derived from those three queries being `undefined` and
surfaced via the `LoadingScreen` component so the UI never flashes an empty
state during hydration.

### 4.5 Multiplayer

`PlayerSetup` on the setup screen lets users add and remove named players
before a round begins. Names are validated by `players.ts` (min 1, max 24
characters, no duplicates – case-insensitive). Each player gets a unique ID
via `crypto.randomUUID()` (with a deterministic fallback). The game requires
at least one player to start.

Scores are reset to zero at the start of each round (`resetScores`) and the
result screen uses `rankPlayers` (sort by score, descending) to display the
final standings.

### 4.6 Themes and play selection

Before starting, users pick **what to play** on the `SelectQuestionsScreen`:

- **Theme mode.** Select a pre-built theme (`themes.ts`) like _Animals_ or
  _+18_. Only the theme's questions are used for that round.
- **Custom mix mode.** Hand-pick individual questions from default + custom
  pools via checkboxes.

The selection is modelled by a `PlaySelection` discriminated union:

```ts
type PlaySelection =
  | { mode: "theme"; themeId: string }
  | { mode: "mix"; selectedTexts: string[] };
```

`resolveActiveTexts` in `playSelection.ts` resolves either variant into a
flat list of question strings that is passed to `START_GAME`. A
`ThemeSwitchDialog` warns when switching from mix to theme (unsaved
selections would be lost).

### 4.7 Question source toggle (default / custom / both)

Inside the `CustomQuestionScreen`, a `QuestionSourceToggle` controls which
pool is visible for management. The selected value is stored in the `settings`
table under the key `questionSource` and read back through a live query, so
the choice survives a page reload. `questionList.ts` builds the visible list:

```ts
function buildVisibleQuestions(
  source: QuestionSource,
  defaultQuestions: string[],
  customQuestions: string[],
): VisibleQuestion[];
```

### 4.8 Custom question management (CRUD)

Users can:

- **Create** prompts via the `AddQuestionDialog` modal on the custom-question
  screen. The form logic is extracted into the reusable `useAddQuestionForm`
  hook. A hard limit of **100 custom questions** is enforced.
- **Read** all their prompts in `CustomQuestionScreen` with paginated display
  (10 per page).
- **Update** a prompt inline inside `QuestionListItem`, with cancel support
  that restores the original value.
- **Delete** a prompt via `DeleteQuestionDialog`, which requires an explicit
  confirmation and shows the prompt text being deleted.

All async handlers (`addCustomQuestion`, `editCustomQuestion`,
`deleteCustomQuestion`) are memoized with `useCallback` and expose their
`isSubmitting` / `isDeleting` / `isSaving` state so the UI can disable buttons
and render accessible `aria-busy` states.

### 4.9 Input validation and sanitization

Implemented in `src/game/questionValidation.ts` with `zod`:

- Min/max length (3–120 characters).
- Must contain at least one letter (`\p{L}`).
- Must **not** contain digits (`\p{N}`).
- `sanitizeQuestionInput` strips control characters, HTML tags and collapses
  multiple spaces before the schema runs.
- `isDuplicateQuestion` performs a locale-aware, case-insensitive comparison
  against the current prompts, so users get a clear error message _before_
  IndexedDB rejects the write.

The same validation is reused in three places (add screen, add dialog, inline
edit) to keep UX consistent.

### 4.10 Accessibility and UX details

- Native `<dialog>` elements with `showModal()` for add and delete flows, so
  focus trapping and the escape key work out of the box.
- `aria-invalid`, `aria-busy`, `aria-live="polite"` and `role="status"` on the
  loading screen.
- Disabled states with `disabled:cursor-not-allowed` and `disabled:opacity-50`.
- Responsive layouts: card width adapts, list rows stack on mobile and become
  horizontal on `md:`.

### 4.11 Design system (shadcn/ui)

The UI is built on **shadcn/ui v4** (radix-luma style) with four primitives
so far: `Button`, `Card`, `Input` and `Badge` (all in `src/components/ui/`).

- **Tokens.** `index.css` defines an OKLCH-based colour palette via CSS custom
  properties (`--background`, `--foreground`, `--primary`, `--card`, `--muted`,
  `--destructive`, etc.) with a purple/indigo hue (~272–281). A full `.dark`
  variant is defined but not yet toggled in the UI.
- **Font.** Geist Variable, loaded via `@fontsource-variable/geist`.
- **Class composition.** Components use `cn()` (`clsx` + `tailwind-merge`) and
  `class-variance-authority` for variant-based styling (e.g. button variants:
  `default`, `outline`, `secondary`, `ghost`, `destructive`, `link`).
- **Layout.** Screens use structured `Card` / `CardHeader` / `CardContent` /
  `CardFooter` layouts instead of hand-rolled glassmorphism divs.
- **Path alias.** All imports use the `@/` alias (resolved via Vite +
  `tsconfig` to `./src/`).

---

## 5. Getting started

### Prerequisites

- Node.js 20+
- npm (or any compatible package manager)

### Install and run

```bash
npm install
npm run dev
```

The dev server will start on the port printed by Vite (usually
`http://localhost:5173`).

### Available scripts

| Script                    | What it does                                                                  |
| ------------------------- | ----------------------------------------------------------------------------- |
| `npm run dev`             | Start the Vite dev server with HMR                                            |
| `npm run build`           | Type-check with `tsc -b` and create a production build                        |
| `npm run preview`         | Serve the production build locally for a smoke test                           |
| `npm run lint`            | Run ESLint across the whole project                                           |
| `npm run test`            | Start Vitest in watch mode for local development                              |
| `npm run test:run`        | Run the full Vitest suite once (for CI / pre-commit)                          |
| `npm run test:coverage`   | Run the full suite once and produce a V8 coverage report (≥ 70% gate)         |
| `npm run ios:sync`        | Build the web app and sync it into the native iOS project                     |
| `npm run ios:open`        | Same as `ios:sync` and then open the project in Xcode                         |
| `npm run android:sync`    | Build the web app and sync it into the native Android project                 |
| `npm run android:open`    | Same as `android:sync` and then open the project in Android Studio            |
| `npm run assets:generate` | Generate iOS and Android icons + splash assets from a single 1024×1024 master |

### Mobile builds (iOS + Android)

The app is wrapped with [Capacitor](https://capacitorjs.com) so the same
React codebase is shipped to both the Apple App Store and the Google Play
Store. The native projects live in the `ios/` and `android/` folders and
are committed to the repo – Capacitor only **copies the built web assets**
into them during `*:sync`.

Two German step-by-step guides explain the full release process:

- iOS / App Store: [`docs/APP_STORE_GUIDE.md`](docs/APP_STORE_GUIDE.md)
- Android / Play Store: [`docs/PLAY_STORE_GUIDE.md`](docs/PLAY_STORE_GUIDE.md)

A consolidated to-do list (what only you can do vs. what the agent can
automate) lives in [`docs/TODO.md`](docs/TODO.md).

### Testing

Unit tests live next to the code they cover (e.g. `src/game/reducer.ts` has a
sibling `src/game/reducer.test.ts`). This keeps tests discoverable and makes
refactoring easier because the test file moves with the implementation.

Currently covered:

- `src/game/reducer.test.ts` – every action of the game reducer, including
  history tracking, the `GO_BACK` action, player management, scoring, the
  unknown-action fallback and state immutability.
- `src/game/questionValidation.test.ts` – zod schema, text sanitization, the
  validation wrapper and locale-aware duplicate detection.
- `src/game/logic.test.ts` – the random pair builder (`createPairs`),
  including a `Math.random` spy to prove the function is the only source
  of randomness.
- `src/game/players.test.ts` – player name validation, normalization,
  duplicate detection, ID generation, score reset and ranking.
- `src/game/playSelection.test.ts` – theme and mix resolution, empty-state
  detection and selection summary descriptions.
- `src/game/questionList.test.ts` – building the visible question list by
  source (default / custom / both).

Vitest is configured inside `vite.config.ts` (via the `test` block) so there
is a single source of truth for both the dev server and the test runner.

The `test.coverage` block enforces a **70% threshold** on lines, statements,
functions and branches — currently scoped to `src/game/**` because that is
the pure-logic layer of the app (UI components and the IndexedDB layer are
not yet covered and would require a `jsdom` setup). If coverage drops below
70% the test run exits with a non-zero status, which fails CI.

---

## 6. Data model reference

```ts
type QuestionRecord = {
  id: number; // auto-incremented primary key
  text: string; // unique (enforced by Dexie index "&text")
};

type SettingRecord = {
  key: string; // e.g. "questionSource"
  value: string;
};

type QuestionSource = "default" | "custom" | "both";

type Player = {
  id: string; // crypto.randomUUID()
  name: string;
  score: number;
};

type PlaySelection =
  | { mode: "theme"; themeId: string }
  | { mode: "mix"; selectedTexts: string[] };
```

Settings keys are centralized in `SETTINGS_KEYS` and a type guard
`isQuestionSource` is used before reading the raw string value, so invalid
values coming from older app versions are gracefully ignored.

---

## 7. Roadmap – what can still be done

The following items are **not implemented yet** and represent the natural next
steps for the project, roughly ordered by impact.

### UX and gameplay

- [x] **Real result screen.** `ResultScreen` now shows a ranked scoreboard
      with confetti for the winner and a "Play again" button.
- [ ] **Round statistics.** Track how often each prompt was used and expose a
      simple "most played" view.
- [ ] **Timer per card.** Optional countdown (e.g. 10 seconds) with a visual
      progress indicator to add pressure.
- [x] **Score / points system.** After each swipe a `ScorePrompt` lets the
      group award a point to a player. Scores are tracked across the round.
- [x] **Multiplayer / pass-and-play.** Players are added on the setup screen
      via `PlayerSetup`. Each player has a name and a score.
- [ ] **Keyboard navigation.** Arrow keys or `Space` to advance a card for
      desktop users.
- [ ] **i18n.** Split UI copy and prompts from the code and ship at least a
      German and an English version.
- [x] **Themed question packs.** Pre-built themes (Animals, +18) can be
      selected on the question-selection screen.

### Data and persistence

- [x] **Toggle individual default prompts** (enable/disable without deleting).
      The data model already supports this – only a `disabled` flag on
      `defaultQuestions` and a filter in `activeQuestionTexts` are missing.
- [ ] **Bulk import / export** of custom prompts as JSON or CSV, including a
      "reset to defaults" action.
- [ ] **Dexie schema versioning.** Currently there is only `version(1)`. Once
      new indexes or tables land, a `version(2).upgrade(...)` migration should
      be added.
- [ ] **Cloud sync (optional).** Sync custom prompts across devices via a
      lightweight backend or a service like Supabase/Firebase.

### Code quality and tooling

- [x] **More unit tests.** `reducer.ts`, `questionValidation.ts`,
      `logic.ts`, `players.ts`, `playSelection.ts` and `questionList.ts`
      are now covered.
- [x] **shadcn/ui migration.** UI migrated from hand-rolled Tailwind to
      shadcn/ui v4 primitives (`Button`, `Card`, `Input`, `Badge`) with
      OKLCH design tokens and the Geist font.
- [ ] **Component tests** for `QuestionListItem` and the dialogs
      (edit/delete happy path and validation errors) with React Testing
      Library, which also requires adding `jsdom` as the Vitest environment.
- [ ] **E2E smoke test** with Playwright that covers "add players → pick
      theme → start game → swipe → award point → end game".
- [ ] **Extract the `<dialog>` boilerplate** into a shared `useModalDialog`
      hook to deduplicate the three dialog components.
- [ ] **PWA support.** Add a manifest and a service worker so the app becomes
      installable and fully offline-capable.
- [x] **CI pipeline.** A GitHub Actions workflow under
      `.github/workflows/ci.yml` runs `lint`, `build` and `test:coverage`
      on every push and pull request to `main` and `develop`, enforces a
      70% coverage threshold and posts a coverage comment on PRs.

### Accessibility

- [ ] **Audit with axe / Lighthouse** and fix any contrast or focus-order
      findings.
- [ ] **Announce phase changes** (e.g. "Now playing") via an `aria-live`
      region for screen-reader users.
- [ ] **Reduced-motion support.** Respect `prefers-reduced-motion` in
      `SwipeCards` and fall back to a fade/slide without rotation.

---

## 8. Branching and CI workflow

The project follows a **Git Flow**-style branching model:

- **`main`** – stable, release-ready code. Only updated via pull requests
  from `develop` (or short-lived hotfix branches).
- **`develop`** – integration branch. New features get merged into
  `develop` first; `develop` is then merged into `main` for a release.
- **`feature/*`** – short-lived branches created from `develop`, opened
  back into `develop` via a pull request.

Every push and pull request that targets `main` or `develop` runs the
GitHub Actions workflow `.github/workflows/ci.yml`, which:

1. Installs dependencies with `npm ci`.
2. Runs `npm run lint`.
3. Runs `npm run build` (which also type-checks via `tsc -b`).
4. Runs `npm run test:coverage` and **fails the build** if the coverage
   drops below the 70% threshold defined in `vite.config.ts`.
5. On pull requests, posts a coverage report comment so reviewers see
   the current numbers before merging into `develop` or `main`.
6. Always uploads the full coverage report as a workflow artefact.

---

## 9. License

MIT License - see the [LICENSE](LICENSE) file for details.
