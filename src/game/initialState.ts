export type GamePhase =
  | "setup"
  | "playing"
  | "result"
  // "custom-question" is reached via the "Manage questions" button on
  // the setup screen. The old "add-question" full-screen phase was
  // removed in favour of an inline modal that opens on top of the
  // setup screen.
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
  // Tracks how many cards are left in the current round. Decremented on
  // each NEXT_PAIR; when it hits 0 the game transitions to "result".
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
