export const initialState: {
  phase: string;
  pairs: { letter: string; question: string } | null;
} = {
  phase: "setup",
  pairs: null,
};
