import { createPairs } from "./logic";
import { type GamePhase, type GameState } from "./initialState";
import {
  createPlayerId,
  resetScores,
  validatePlayerName,
} from "./players";

type Action =
  | { type: "START_GAME"; payload: string[] }
  | { type: "END_GAME" }
  | { type: "NEXT_PAIR"; payload: string[] }
  | { type: "GO_TO_SETUP" }
  | { type: "GO_TO_CUSTOM_QUESTION" }
  | { type: "GO_BACK" }
  | { type: "ADD_PLAYER"; payload: string }
  | { type: "REMOVE_PLAYER"; payload: string }
  | { type: "SWIPE_AWAITING_SCORE" }
  | { type: "AWARD_POINT"; payload: string };

function pushHistory(history: GamePhase[], currentPhase: GamePhase) {
  return [...history, currentPhase].slice(-3);
}

export default function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "START_GAME": {
      // A round only makes sense with at least one question and one
      // player – otherwise we'd either show "undefined" cards or have
      // no one to attribute points to. Returning the same reference
      // lets React skip a re-render in those guard-rail cases.
      if (action.payload.length === 0) return state;
      if (state.players.length === 0) return state;

      return {
        ...state,
        phase: "playing",
        pairs: createPairs(action.payload),
        // Starting a new round always resets the scores so the same
        // line-up can play multiple games in a row from one setup.
        players: resetScores(state.players),
        pendingScore: false,
      };
    }

    case "END_GAME":
      return { ...state, phase: "result", pendingScore: false };

    case "NEXT_PAIR": {
      if (action.payload.length === 0) return state;
      return { ...state, pairs: createPairs(action.payload) };
    }

    case "GO_TO_CUSTOM_QUESTION":
      return {
        ...state,
        phase: "custom-question",
        history: pushHistory(state.history, state.phase),
      };

    case "GO_TO_SETUP":
      return {
        ...state,
        phase: "setup",
        history: pushHistory(state.history, state.phase),
      };

    case "GO_BACK": {
      const previousPhase = state.history.at(-1);
      if (!previousPhase) return state;
      return {
        ...state,
        phase: previousPhase,
        history: state.history.slice(0, -1),
      };
    }

    case "ADD_PLAYER": {
      const validation = validatePlayerName(action.payload, state.players);
      if (!validation.ok) return state;

      return {
        ...state,
        players: [
          ...state.players,
          {
            id: createPlayerId(),
            name: validation.name,
            score: 0,
          },
        ],
      };
    }

    case "REMOVE_PLAYER": {
      const next = state.players.filter((player) => player.id !== action.payload);
      // Bail out if nothing changed so React can skip a re-render.
      if (next.length === state.players.length) return state;
      return { ...state, players: next };
    }

    case "SWIPE_AWAITING_SCORE":
      // Already waiting – returning the same reference is a small
      // optimisation that prevents an unnecessary re-render of the
      // score prompt while the user is still deciding.
      if (state.pendingScore) return state;
      return { ...state, pendingScore: true };

    case "AWARD_POINT": {
      // Defensive guard: only credit a point when we're actually
      // waiting for one. Without this guard a stray button press
      // outside the prompt could rack up points silently.
      if (!state.pendingScore) return state;

      const players = state.players.map((player) =>
        player.id === action.payload
          ? { ...player, score: player.score + 1 }
          : player,
      );
      // If no player matched the id we bail out instead of clearing
      // pendingScore – otherwise a typo in the id would unlock the
      // swipe without anyone receiving a point.
      const hasMatch = players.some(
        (player, index) => player.score !== state.players[index].score,
      );
      if (!hasMatch) return state;

      return { ...state, players, pendingScore: false };
    }

    default:
      return state;
  }
}
