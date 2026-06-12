import type { QuestionSource } from "../db/db";

export type VisibleQuestion = {
  text: string;
  isCustom: boolean;
};

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
