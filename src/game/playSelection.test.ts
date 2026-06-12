import { describe, expect, it } from "vitest";
import {
  describeSelection,
  isSelectionEmpty,
  resolveActiveTexts,
  type PlaySelection,
} from "./playSelection";
import type { Theme } from "./themes";

/**
 * `resolveActiveTexts` is the single source of truth for "what gets
 * played" given a selection. These tests pin down the three rules that
 * are easy to break in a refactor: themes are exclusive, a mix only
 * contains prompts that still exist, and the result never has duplicates.
 */

const standardQuestions = ["In der Küche", "Ist ein Tier"];
const customQuestions = ["Ist gelb", "Schmeckt sauer"];

const themes: Theme[] = [
  { id: "tiere", name: "Tiere", questions: ["Kann fliegen", "Hat ein Fell"] },
];

describe("resolveActiveTexts", () => {
  describe("mode = 'theme'", () => {
    it("returns exactly the theme's questions and ignores standard/custom", () => {
      const selection: PlaySelection = { mode: "theme", themeId: "tiere" };

      const result = resolveActiveTexts(
        selection,
        standardQuestions,
        customQuestions,
        themes,
      );

      expect(result).toEqual(["Kann fliegen", "Hat ein Fell"]);
    });

    it("returns an empty array when the theme id is unknown", () => {
      const selection: PlaySelection = { mode: "theme", themeId: "missing" };

      const result = resolveActiveTexts(
        selection,
        standardQuestions,
        customQuestions,
        themes,
      );

      expect(result).toEqual([]);
    });
  });

  describe("mode = 'mix'", () => {
    it("returns the ticked standard and custom questions", () => {
      const selection: PlaySelection = {
        mode: "mix",
        selectedTexts: ["In der Küche", "Ist gelb"],
      };

      const result = resolveActiveTexts(
        selection,
        standardQuestions,
        customQuestions,
        themes,
      );

      expect(result).toEqual(["In der Küche", "Ist gelb"]);
    });

    it("drops ticked texts that no longer exist (e.g. a deleted custom question)", () => {
      const selection: PlaySelection = {
        mode: "mix",
        selectedTexts: ["Ist gelb", "Wurde gelöscht"],
      };

      const result = resolveActiveTexts(
        selection,
        standardQuestions,
        customQuestions,
        themes,
      );

      expect(result).toEqual(["Ist gelb"]);
    });

    it("removes duplicates", () => {
      const selection: PlaySelection = {
        mode: "mix",
        selectedTexts: ["Ist gelb", "Ist gelb"],
      };

      const result = resolveActiveTexts(
        selection,
        standardQuestions,
        customQuestions,
        themes,
      );

      expect(result).toEqual(["Ist gelb"]);
    });
  });
});

describe("isSelectionEmpty", () => {
  it("is true for a fresh mix with nothing ticked", () => {
    const selection: PlaySelection = { mode: "mix", selectedTexts: [] };

    expect(
      isSelectionEmpty(selection, standardQuestions, customQuestions, themes),
    ).toBe(true);
  });

  it("is false once a valid question is ticked", () => {
    const selection: PlaySelection = {
      mode: "mix",
      selectedTexts: ["In der Küche"],
    };

    expect(
      isSelectionEmpty(selection, standardQuestions, customQuestions, themes),
    ).toBe(false);
  });

  it("is false for a known theme", () => {
    const selection: PlaySelection = { mode: "theme", themeId: "tiere" };

    expect(
      isSelectionEmpty(selection, standardQuestions, customQuestions, themes),
    ).toBe(false);
  });
});

describe("describeSelection", () => {
  it("names the theme and counts its questions in theme mode", () => {
    const selection: PlaySelection = { mode: "theme", themeId: "tiere" };

    expect(
      describeSelection(selection, standardQuestions, customQuestions, themes),
    ).toEqual({ title: "Theme: Tiere", count: 2 });
  });

  it("labels a non-empty mix as 'Custom mix'", () => {
    const selection: PlaySelection = {
      mode: "mix",
      selectedTexts: ["In der Küche", "Ist gelb"],
    };

    expect(
      describeSelection(selection, standardQuestions, customQuestions, themes),
    ).toEqual({ title: "Custom mix", count: 2 });
  });

  it("labels an empty mix as 'Nothing selected'", () => {
    const selection: PlaySelection = { mode: "mix", selectedTexts: [] };

    expect(
      describeSelection(selection, standardQuestions, customQuestions, themes),
    ).toEqual({ title: "Nothing selected", count: 0 });
  });
});
