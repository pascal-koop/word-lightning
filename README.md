# Word Lightning

A fast, playful word-association game built with **React 19**, **TypeScript** and **Vite**.
The player is shown a random letter together with a random question (for example
`M – Is in the kitchen`) and has to come up with a matching word that starts with
that letter. Cards can be swiped away to get the next pair, and players can manage
their own collection of questions on top of the built-in ones.

---

## 1. What the app does (non-technical summary)

Word Lightning is a small, mobile-first browser game that runs entirely on the
client – no backend, no login, no tracking. From a user perspective the app
provides four things:

1. **A quick game mode.** Tap "Start game" and you get a card with a random
   letter and a random prompt. Swipe the card to get the next pair. Keep going
   as long as you like and end the round whenever you want.
2. **A prompt library.** Every question used in the game is stored locally on
   the device. A set of default questions ships with the app so the game is
   immediately playable.
3. **Your own prompts.** Users can add, edit and delete their own questions
   through a dedicated screen. All changes are persisted on the device and
   survive a page reload.
4. **A question-source switch.** Users can decide whether to play with only the
   default prompts, only their own prompts, or both combined.

Because everything is stored in the browser (IndexedDB), the app works offline
after the first load and there is no account setup.

---

## 2. Technology stack

| Area             | Choice                                                       |
| ---------------- | ------------------------------------------------------------ |
| UI framework     | React 19 (function components + hooks)                       |
| Language         | TypeScript 5.9 (strict mode)                                 |
| Build tool       | Vite 7                                                       |
| Styling          | Tailwind CSS v4 (via `@tailwindcss/vite`)                    |
| Animation        | `motion` (the successor of Framer Motion) for swipe gestures |
| Client-side DB   | IndexedDB via `dexie` + `dexie-react-hooks` (live queries)   |
| Input validation | `zod` schemas for question text                              |
| Linting          | ESLint 9 with `typescript-eslint` and React Hooks plugins    |

---

## 3. Project structure

```text
src/
├── App.tsx                      # App shell (header + Game container)
├── Game.tsx                     # Top-level screen router driven by game phase
├── main.tsx                     # Vite entry; bootstraps the database
├── index.css                    # Tailwind import and global design tokens
│
├── assets/                      # Static images (logo, card background)
│
├── components/
│   ├── LoadingScreen.tsx        # Accessible spinner while DB hydrates
│   ├── QuestionListItem.tsx     # List row with inline edit + delete flow
│   ├── QuestionSourceToggle.tsx # Radio group: default / custom / both
│   ├── SwipeCards.tsx           # Motion-based swipeable card stack
│   ├── Button.tsx               # Shared button primitive
│   │
│   ├── dialogs/
│   │   ├── AddQuestionDialog.tsx    # <dialog>-based modal for adding a prompt
│   │   └── DeleteQuestionDialog.tsx # Confirmation modal before deleting
│   │
│   └── screens/
│       ├── SetupScreen.tsx          # Landing screen: start / add question
│       ├── AddQuestionScreen.tsx    # Form to add a new prompt
│       ├── CustomQuestionScreen.tsx # Full list with CRUD on own prompts
│       ├── PlaySreen.tsx            # Game screen with the swipe card
│       └── ResultScreen.tsx         # Shown after the user ends a round
│
├── db/
│   └── db.ts                    # Dexie schema, seeding and settings migration
│
├── game/
│   ├── initialState.ts          # Game state + phase union type
│   ├── reducer.ts               # Pure reducer for all game transitions
│   ├── logic.ts                 # Random pair creation (Fisher–Yates shuffle)
│   ├── questions.ts             # Default prompt list used as the DB seed
│   └── questionValidation.ts    # zod schema + sanitization + duplicate check
│
└── hooks/
    └── useGame.ts               # Single hook that glues reducer + Dexie together
```

The architectural idea is a clear split between three layers:

- **State machine** (`game/reducer.ts`, `game/initialState.ts`) – pure, testable,
  no side effects.
- **Persistence** (`db/db.ts`) – Dexie/IndexedDB, including schema, seed data and
  a forward-compatible settings migration.
- **Glue** (`hooks/useGame.ts`) – a custom hook that exposes a single,
  narrow API to the React tree (`state`, `isLoading`, `startGame`,
  `addQuestion`, `deleteQuestion`, `editQuestion`, `setQuestionSource`, …).

Screens only talk to this hook; they never touch Dexie or the reducer directly.

---

## 4. Features in detail

### 4.1 Screen router via a finite-state machine

`Game.tsx` renders a different screen depending on `state.phase`, which is
strictly typed as one of:

```ts
type GamePhase =
  | "setup"
  | "playing"
  | "result"
  | "add-question"
  | "custom-question";
```

All transitions go through the reducer (`START_GAME`, `END_GAME`, `NEXT_PAIR`,
`GO_TO_ADD_QUESTION`, `GO_TO_CUSTOM_QUESTION`, `GO_TO_SETUP`), which keeps
navigation logic in one place and makes it easy to reason about.

### 4.2 Gameplay

- **Random pair generation.** `createPairs` picks a random letter from the full
  English alphabet and a random question from the currently active prompt pool,
  using a Fisher–Yates shuffle.
- **Swipe to continue.** `SwipeCards` uses `motion`'s `useMotionValue` and
  `useTransform` to rotate and fade the card while dragging. Once the user
  drags more than 50px, the card is removed from the stack and `NEXT_PAIR` is
  dispatched, which generates the next letter/question pair.
- **End game button.** Ends the round and navigates to `ResultScreen`.
- **Empty-state protection.** The "Start game" button is disabled when no
  questions are available, so the game cannot be started into a broken state.

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

### 4.5 Question source toggle (default / custom / both)

The `QuestionSourceToggle` is an accessible `role="radiogroup"` with three
options. The selected value is stored in the `settings` table under the key
`questionSource` and read back through a live query, so the choice survives a
page reload. `useGame` derives `activeQuestionTexts` from it:

```ts
switch (questionSource) {
  case "default":
    return defaultTexts;
  case "custom":
    return customTexts;
  case "both":
    return [...defaultTexts, ...customTexts];
}
```

### 4.6 Custom question management (CRUD)

Users can:

- **Create** prompts via `AddQuestionScreen` (inline form) or the
  `AddQuestionDialog` modal on the custom-question screen.
- **Read** all their prompts in `CustomQuestionScreen`, which also shows a
  short preview (last 3 entries) on the add screen.
- **Update** a prompt inline inside `QuestionListItem`, with cancel support
  that restores the original value.
- **Delete** a prompt via `DeleteQuestionDialog`, which requires an explicit
  confirmation and shows the prompt text being deleted.

All async handlers (`addCustomQuestion`, `editCustomQuestion`,
`deleteCustomQuestion`) are memoized with `useCallback` and expose their
`isSubmitting` / `isDeleting` / `isSaving` state so the UI can disable buttons
and render accessible `aria-busy` states.

### 4.7 Input validation and sanitization

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

### 4.8 Accessibility and UX details

- Native `<dialog>` elements with `showModal()` for add and delete flows, so
  focus trapping and the escape key work out of the box.
- `aria-invalid`, `aria-busy`, `aria-live="polite"` and `role="status"` on the
  loading screen.
- Disabled states with `disabled:cursor-not-allowed` and `disabled:opacity-50`.
- Responsive layouts: card width adapts, list rows stack on mobile and become
  horizontal on `md:`.

### 4.9 Design system

- Tailwind v4 is configured through `@tailwindcss/vite` with CSS custom
  properties inside an `@theme` block in `index.css`.
- A shared button style (rounded, shadow, hover, disabled) is defined once in
  `index.css` so every `<button>` is on-brand by default.
- A soft `bg-linear-to-br from-indigo-50 via-white to-pink-50` background is
  applied globally on `body`.

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

| Script             | What it does                                           |
| ------------------ | ------------------------------------------------------ |
| `npm run dev`      | Start the Vite dev server with HMR                     |
| `npm run build`    | Type-check with `tsc -b` and create a production build |
| `npm run preview`  | Serve the production build locally for a smoke test    |
| `npm run lint`     | Run ESLint across the whole project                    |
| `npm run test`     | Start Vitest in watch mode for local development       |
| `npm run test:run` | Run the full Vitest suite once (for CI / pre-commit)   |

### Testing

Unit tests live next to the code they cover (e.g. `src/game/reducer.ts` has a
sibling `src/game/reducer.test.ts`). This keeps tests discoverable and makes
refactoring easier because the test file moves with the implementation.

Currently covered:

- `src/game/reducer.test.ts` – every action of the game reducer, including
  empty-payload no-ops and state immutability.
- `src/game/questionValidation.test.ts` – zod schema, text sanitization, the
  validation wrapper and locale-aware duplicate detection.

Vitest is configured inside `vite.config.ts` (via the `test` block) so there
is a single source of truth for both the dev server and the test runner.

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
```

Settings keys are centralized in `SETTINGS_KEYS` and a type guard
`isQuestionSource` is used before reading the raw string value, so invalid
values coming from older app versions are gracefully ignored.

---

## 7. Roadmap – what can still be done

The following items are **not implemented yet** and represent the natural next
steps for the project, roughly ordered by impact.

### UX and gameplay

- [ ] **Real result screen.** `ResultScreen` is currently a placeholder. It
      should show the number of played rounds, the duration and a "play again"
      call to action.
- [ ] **Round statistics.** Track how often each prompt was used and expose a
      simple "most played" view.
- [ ] **Timer per card.** Optional countdown (e.g. 10 seconds) with a visual
      progress indicator to add pressure.
- [ ] **Score / points system.** Let players mark answers as accepted/rejected
      and keep a score across a round.
- [ ] **Multiplayer / pass-and-play.** Let multiple players take turns on the
      same device with per-player scores.
- [ ] **Keyboard navigation.** Arrow keys or `Space` to advance a card for
      desktop users.
- [ ] **i18n.** Split UI copy and prompts from the code and ship at least a
      German and an English version.

### Data and persistence

- [ ] **Toggle individual default prompts** (enable/disable without deleting).
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

- [ ] **More unit tests.** `reducer.ts` and `questionValidation.ts` are
      covered; `logic.ts` (`createPairs`, Fisher–Yates shuffle) is not yet.
- [ ] **Component tests** for `QuestionListItem` and the two dialogs
      (edit/delete happy path and validation errors) with React Testing
      Library, which also requires adding `jsdom` as the Vitest environment.
- [ ] **E2E smoke test** with Playwright that covers "add a prompt → start
      game → swipe → end game".
- [ ] **Extract the `<dialog>` boilerplate** into a shared `useModalDialog`
      hook to deduplicate `AddQuestionDialog` and `DeleteQuestionDialog`.
- [ ] **PWA support.** Add a manifest and a service worker so the app becomes
      installable and fully offline-capable.
- [ ] **CI pipeline.** Add a GitHub Actions workflow that runs `lint`,
      `build` and the future test suite on every pull request.

### Accessibility

- [ ] **Audit with axe / Lighthouse** and fix any contrast or focus-order
      findings.
- [ ] **Announce phase changes** (e.g. "Now playing") via an `aria-live`
      region for screen-reader users.
- [ ] **Reduced-motion support.** Respect `prefers-reduced-motion` in
      `SwipeCards` and fall back to a fade/slide without rotation.

---

## 8. License

MIT License - see the [LICENSE](LICENSE) file for details.
