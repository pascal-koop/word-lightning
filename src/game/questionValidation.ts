import { z } from "zod";

const QUESTION_MIN_LENGTH = 3;
const QUESTION_MAX_LENGTH = 120;

const HTML_TAG_REGEX = /<[^>]*>/g;
const MULTIPLE_SPACES_REGEX = /\s+/g;
const HAS_LETTER_REGEX = /\p{L}/u;
const HAS_NUMBER_REGEX = /\p{N}/u;

function stripControlCharacters(value: string): string {
  return Array.from(value)
    .filter((character) => {
      const codePoint = character.codePointAt(0);
      if (codePoint === undefined) return false;
      return codePoint >= 32 && codePoint !== 127;
    })
    .join("");
}

export const questionSchema = z
  .string()
  .min(QUESTION_MIN_LENGTH, `Question must be at least ${QUESTION_MIN_LENGTH} characters.`)
  .max(QUESTION_MAX_LENGTH, `Question must be at most ${QUESTION_MAX_LENGTH} characters.`)
  .refine((value) => HAS_LETTER_REGEX.test(value), {
    message: "Question must contain letters.",
  })
  .refine((value) => !HAS_NUMBER_REGEX.test(value), {
    message: "Question must not contain numbers.",
  });

export function sanitizeQuestionInput(rawValue: string): string {
  return stripControlCharacters(rawValue)
    .replace(HTML_TAG_REGEX, " ")
    .replace(MULTIPLE_SPACES_REGEX, " ")
    .trim();
}

export function validateQuestionInput(rawValue: string) {
  const sanitized = sanitizeQuestionInput(rawValue);
  return questionSchema.safeParse(sanitized);
}

export function isDuplicateQuestion(candidate: string, existingQuestions: string[]) {
  const normalizedCandidate = candidate.toLocaleLowerCase();
  return existingQuestions.some(
    (existingQuestion) =>
      sanitizeQuestionInput(existingQuestion).toLocaleLowerCase() === normalizedCandidate,
  );
}
