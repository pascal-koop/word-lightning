import { createPairs } from "./logic";
import { type GamePhase, type GameState } from "./initialState";
import { createPlayerId, resetScores, validatePlayerName } from "./players";

type Action =
  | { type: "START_GAME"; payload: string[] }
  | { type: "END_GAME" }
  | { type: "NEXT_PAIR"; payload: string[] }
  | { type: "GO_TO_SETUP" }
  | { type: "GO_TO_SELECT_QUESTIONS" }
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
      if (action.payload.length === 0) return state;
      if (state.players.length === 0) return state;

      return {
        ...state,
        phase: "playing",
        pairs: createPairs(action.payload),
        players: resetScores(state.players),
        pendingScore: false,
        remainingCards: action.payload.length,
      };
    }

    case "END_GAME":
      return { ...state, phase: "result", pendingScore: false };

    case "NEXT_PAIR": {
      if (action.payload.length === 0) return state;
      const remaining = state.remainingCards - 1;
      if (remaining <= 0) {
        return { ...state, phase: "result", pairs: null, pendingScore: false };
      }
      return {
        ...state,
        pairs: createPairs(action.payload),
        remainingCards: remaining,
      };
    }

    case "GO_TO_SELECT_QUESTIONS":
      return {
        ...state,
        phase: "select-questions",
        history: pushHistory(state.history, state.phase),
      };

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
      const next = state.players.filter(
        (player) => player.id !== action.payload,
      );
      if (next.length === state.players.length) return state;
      return { ...state, players: next };
    }

    case "SWIPE_AWAITING_SCORE":
      if (state.pendingScore) return state;
      return { ...state, pendingScore: true };

    case "AWARD_POINT": {
      if (!state.pendingScore) return state;

      const players = state.players.map((player) =>
        player.id === action.payload
          ? { ...player, score: player.score + 1 }
          : player,
      );
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
