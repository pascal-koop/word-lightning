import type { QuestionSource } from "../db/db";

// What the "My Questions" screen renders per row. The `isCustom` flag
// tells the UI whether the user can edit/delete that row – defaults
// are read-only because they live in a separate `defaultQuestions`
// table that `addCustomQuestion`/`deleteCustomQuestion` don't touch.
export type VisibleQuestion = {
  text: string;
  isCustom: boolean;
};

// Builds the list shown on the "My Questions" screen for the given
// source toggle. Pulling this logic out of the React tree keeps the
// component simple and lets us unit-test the *behaviour* (defaults
// must come first, isCustom must reflect the source table, ...)
// without having to mount the DOM.
export function buildVisibleQuestions(
  source: QuestionSource,
  defaultQuestions: string[],
  customQuestions: string[],
): VisibleQuestion[] {
  const defaults = defaultQuestions.map((text) => ({ text, isCustom: false }));
  const customs = customQuestions.map((text) => ({ text, isCustom: true }));

  switch (source) {
    case "default":
      return defaults;
    case "custom":
      return customs;
    case "both":
      return [...customs, ...defaults];
  }
}
