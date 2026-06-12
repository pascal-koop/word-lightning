export type GamePhase =
  | "setup"
  | "select-questions"
  | "playing"
  | "result"
  | "custom-question";

export type Player = {
  id: string;
  name: string;
  score: number;
};

export type GameState = {
  phase: GamePhase;
  pairs: { letter: string; question: string } | null;
  history: GamePhase[];
  players: Player[];
  pendingScore: boolean;
  remainingCards: number;
};

export const initialState: GameState = {
  phase: "setup",
  pairs: null,
  history: [],
  players: [],
  pendingScore: false,
  remainingCards: 0,
};
