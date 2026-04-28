export type GamePhase =
  | "setup"
  | "playing"
  | "result"
  | "add-question"
  | "custom-question";

export type GameState = {
  phase: GamePhase;
  pairs: { letter: string; question: string } | null;
  history: GamePhase[];
};

export const initialState: GameState = {
  phase: "setup",
  pairs: null,
  history: [],
};
