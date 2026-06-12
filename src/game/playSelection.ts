import { findThemeById, type Theme } from "./themes";

export type PlaySelection =
  | { mode: "theme"; themeId: string }
  | { mode: "mix"; selectedTexts: string[] };

export const initialPlaySelection: PlaySelection = {
  mode: "mix",
  selectedTexts: [],
};

export function resolveActiveTexts(
  selection: PlaySelection,
  standardTexts: string[],
  customTexts: string[],
  themes: Theme[] = [],
): string[] {
  if (selection.mode === "theme") {
    const theme =
      themes.find((entry) => entry.id === selection.themeId) ??
      findThemeById(selection.themeId);
    return theme ? dedupe(theme.questions) : [];
  }

  const available = new Set([...standardTexts, ...customTexts]);
  const stillExisting = selection.selectedTexts.filter((text) =>
    available.has(text),
  );
  return dedupe(stillExisting);
}

export function isSelectionEmpty(
  selection: PlaySelection,
  standardTexts: string[],
  customTexts: string[],
  themes: Theme[] = [],
): boolean {
  return (
    resolveActiveTexts(selection, standardTexts, customTexts, themes).length ===
    0
  );
}

export type SelectionSummary = {
  title: string;
  count: number;
};

export function describeSelection(
  selection: PlaySelection,
  standardTexts: string[],
  customTexts: string[],
  themes: Theme[] = [],
): SelectionSummary {
  const count = resolveActiveTexts(
    selection,
    standardTexts,
    customTexts,
    themes,
  ).length;

  if (selection.mode === "theme") {
    const theme =
      themes.find((entry) => entry.id === selection.themeId) ??
      findThemeById(selection.themeId);
    return {
      title: theme ? `Theme: ${theme.name}` : "Unknown theme",
      count,
    };
  }

  return {
    title: count > 0 ? "Custom mix" : "Nothing selected",
    count,
  };
}

function dedupe(texts: string[]): string[] {
  // de-duplication
  return [...new Set(texts)];
}
