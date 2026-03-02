import { QUESTIONS } from "./questions";

export const initialState: {
  phase: string;
  pairs: { letter: string; question: string } | null;
  questions: string[];
} = {
  phase: "setup",
  pairs: null,
  questions: QUESTIONS,
};
