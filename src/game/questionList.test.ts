import { describe, expect, it } from "vitest";
import { buildVisibleQuestions } from "./questionList";

/**
 * The "My Questions" screen used to render only the user's custom
 * prompts regardless of which source toggle was active – defaults
 * (and the "both" union) were silently hidden. `buildVisibleQuestions`
 * is the pure helper that fixes that. These tests pin down the
 * contract so a future refactor can't accidentally reintroduce the
 * regression.
 */

const defaultQuestions = ["In der Küche", "Ist ein Tier"];
const customQuestions = ["Ist gelb", "Schmeckt sauer"];

describe("buildVisibleQuestions", () => {
  describe("source = 'default'", () => {
    it("returns only the default questions", () => {
      const result = buildVisibleQuestions(
        "default",
        defaultQuestions,
        customQuestions,
      );

      expect(result.map((entry) => entry.text)).toEqual(defaultQuestions);
    });

    it("flags every entry as not custom (read-only)", () => {
      const result = buildVisibleQuestions(
        "default",
        defaultQuestions,
        customQuestions,
      );

      expect(result.every((entry) => entry.isCustom === false)).toBe(true);
    });
  });

  describe("source = 'custom'", () => {
    it("returns only the custom questions", () => {
      const result = buildVisibleQuestions(
        "custom",
        defaultQuestions,
        customQuestions,
      );

      expect(result.map((entry) => entry.text)).toEqual(customQuestions);
    });

    it("flags every entry as custom (editable)", () => {
      const result = buildVisibleQuestions(
        "custom",
        defaultQuestions,
        customQuestions,
      );

      expect(result.every((entry) => entry.isCustom === true)).toBe(true);
    });
  });

  describe("source = 'both'", () => {
    it("returns customs first, then defaults", () => {
      const result = buildVisibleQuestions(
        "both",
        defaultQuestions,
        customQuestions,
      );

      expect(result.map((entry) => entry.text)).toEqual([
        ...customQuestions,
        ...defaultQuestions,
      ]);
    });

    it("keeps the isCustom flag per row so defaults stay read-only", () => {
      const result = buildVisibleQuestions(
        "both",
        defaultQuestions,
        customQuestions,
      );

      expect(result.map((entry) => entry.isCustom)).toEqual([
        true,
        true,
        false,
        false,
      ]);
    });
  });

  describe("edge cases", () => {
    it("returns an empty array when both tables are empty", () => {
      expect(buildVisibleQuestions("both", [], [])).toEqual([]);
    });

    it("returns an empty array on 'custom' when the user has no own prompts yet", () => {
      expect(buildVisibleQuestions("custom", defaultQuestions, [])).toEqual([]);
    });
  });
});
