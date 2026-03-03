import { createPairs } from "./logic";
import { initialState } from "./initialState";

type Action =
  | { type: "START_GAME" }
  | { type: "END_GAME" }
  | { type: "NEXT_PAIR" }
  | { type: "GO_TO_ADD_QUESTION" }
  | { type: "GO_TO_SETUP" }
  | { type: "ADD_QUESTION"; payload: string };

export default function reducer(state: typeof initialState, action: Action) {
  switch (action.type) {
    case "START_GAME":
      return {
        ...initialState,
        phase: "playing",
        pairs: createPairs(state.questions),
        questions: state.questions,
      };

    case "END_GAME":
      return {
        ...state,
        phase: "result",
      };

    case "NEXT_PAIR":
      return {
        ...state,
        pairs: createPairs(state.questions),
      };
    case "GO_TO_ADD_QUESTION":
      return {
        ...state,
        phase: "add-question",
      };
    case "GO_TO_SETUP":
      return {
        ...state,
        phase: "setup",
      };
    case "ADD_QUESTION": {
      const trimmed = action.payload.trim();
      if (trimmed.length === 0) {
        return state;
      }
      return {
        ...state,
        questions: [...state.questions, trimmed],
      };
    }

    default:
      return state;
  }
}
