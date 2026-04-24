import { createPairs } from "./logic";
import { type GameState } from "./initialState";

type Action =
  | { type: "START_GAME"; payload: string[] }
  | { type: "END_GAME" }
  | { type: "NEXT_PAIR"; payload: string[] }
  | { type: "GO_TO_ADD_QUESTION" }
  | { type: "GO_TO_SETUP" }
  | { type: "GO_TO_CUSTOM_QUESTION" };

export default function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "START_GAME": {
      if (action.payload.length === 0) return state;
      return {
        ...state,
        phase: "playing",
        pairs: createPairs(action.payload),
      };
    }

    case "END_GAME":
      return { ...state, phase: "result" };

    case "NEXT_PAIR": {
      if (action.payload.length === 0) return state;
      return { ...state, pairs: createPairs(action.payload) };
    }

    case "GO_TO_ADD_QUESTION":
      return { ...state, phase: "add-question" };

    case "GO_TO_CUSTOM_QUESTION":
      return { ...state, phase: "custom-question" };

    case "GO_TO_SETUP":
      return { ...state, phase: "setup" };

    default:
      return state;
  }
}
