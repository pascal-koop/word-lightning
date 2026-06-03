export type GamePhase =
  | "setup"
  | "playing"
  | "result"
  | "add-question"
  | "custom-question";

export type Player = {
  // A stable identifier (created when the player is added) lets React
  // use it as a list key and lets the reducer target a specific player
  // even if two players happen to share the same name.
  id: string;
  name: string;
  score: number;
};

export type GameState = {
  phase: GamePhase;
  pairs: { letter: string; question: string } | null;
  history: GamePhase[];
  // Players are persisted across phases so the names a user typed on the
  // setup screen are still around when the round ends and we render the
  // scoreboard on the result screen.
  players: Player[];
  // After a swipe, the UI must block the next card until the user has
  // decided who scored the point. `pendingScore` is set to `true` by the
  // swipe handler and cleared again by AWARD_POINT.
  pendingScore: boolean;
};

export const initialState: GameState = {
  phase: "setup",
  pairs: null,
  history: [],
  players: [],
  pendingScore: false,
};
