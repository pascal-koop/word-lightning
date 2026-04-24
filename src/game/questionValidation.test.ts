import { describe, expect, it } from "vitest";
import {
  isDuplicateQuestion,
  questionSchema,
  sanitizeQuestionInput,
  validateQuestionInput,
} from "./questionValidation";

/**
 * These tests cover three layers that work together:
 *   - sanitizeQuestionInput: purely textual clean-up (strips control chars,
 *     HTML tags, collapses whitespace, trims).
 *   - questionSchema: the zod schema that enforces length, "has at least one
 *     letter", and "contains no digits".
 *   - validateQuestionInput: the convenience wrapper that runs sanitization
 *     first and then the schema.
 *   - isDuplicateQuestion: locale-aware, case-insensitive duplicate detection
 *     against an existing list.
 */

describe("sanitizeQuestionInput", () => {
  it("replaces HTML tags with a space and collapses the result", () => {
    expect(sanitizeQuestionInput("Is <b>blue</b>")).toBe("Is blue");
  });

  it("collapses multiple consecutive whitespace characters into a single space", () => {
    expect(sanitizeQuestionInput("Is    in    the    kitchen")).toBe(
      "Is in the kitchen",
    );
  });

  it("removes control characters (< code point 32 and DEL 127)", () => {
    expect(sanitizeQuestionInput("Is\u0000 blue\u0007")).toBe("Is blue");
  });

  it("trims leading and trailing whitespace", () => {
    expect(sanitizeQuestionInput("   Is blue   ")).toBe("Is blue");
  });

  it("returns an empty string when the input is only whitespace", () => {
    expect(sanitizeQuestionInput("   \t\n   ")).toBe("");
  });
});

describe("questionSchema", () => {
  it("accepts a normal-length question that contains only letters and spaces", () => {
    const result = questionSchema.safeParse("Is blue");
    expect(result.success).toBe(true);
  });

  it("rejects input shorter than 3 characters", () => {
    const result = questionSchema.safeParse("hi");
    expect(result.success).toBe(false);
  });

  it("rejects input longer than 120 characters", () => {
    const tooLong = "a".repeat(121);
    const result = questionSchema.safeParse(tooLong);
    expect(result.success).toBe(false);
  });

  it("rejects input that contains no letters at all", () => {
    // Three dashes: long enough, but no Unicode letter character.
    const result = questionSchema.safeParse("---");
    expect(result.success).toBe(false);
  });

  it("rejects input that contains numeric digits", () => {
    const result = questionSchema.safeParse("Is 1 blue");
    expect(result.success).toBe(false);
  });
});

describe("validateQuestionInput", () => {
  it("sanitizes before validating (HTML tags, extra spaces)", () => {
    const result = validateQuestionInput("  <b>Is   blue</b>  ");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("Is blue");
    }
  });

  it("fails when sanitization leaves the input too short", () => {
    // "  <b></b>  " sanitizes down to "" which is below the 3-character minimum.
    const result = validateQuestionInput("  <b></b>  ");
    expect(result.success).toBe(false);
  });

  it("fails when the sanitized input still contains digits", () => {
    const result = validateQuestionInput("  Is 7 blue  ");
    expect(result.success).toBe(false);
  });
});

describe("isDuplicateQuestion", () => {
  it("finds a duplicate regardless of letter case", () => {
    const existing = ["Is blue"];
    expect(isDuplicateQuestion("is blue", existing)).toBe(true);
    expect(isDuplicateQuestion("IS BLUE", existing)).toBe(true);
  });

  it("finds a duplicate even when the stored version has extra whitespace or HTML", () => {
    const existing = ["  Is   blue  ", "<b>Is round</b>"];
    expect(isDuplicateQuestion("is blue", existing)).toBe(true);
    expect(isDuplicateQuestion("is round", existing)).toBe(true);
  });

  it("returns false when no stored question matches", () => {
    const existing = ["Is red", "Is round"];
    expect(isDuplicateQuestion("is blue", existing)).toBe(false);
  });

  it("returns false for an empty list of existing questions", () => {
    expect(isDuplicateQuestion("is blue", [])).toBe(false);
  });
});
