import { createPairs } from "./logic";
import { initialState } from "./initialState";

export default function reducer(state: typeof initialState, action: { type: string }) {
  switch (action.type) {
    case "START_GAME":
      return {
        ...initialState,
        phase: "playing",
        pairs: createPairs(),
      };

    case "END_GAME":
      return {
        ...state,
        phase: "result",
      };

    case "NEXT_PAIR":
      return {
        ...state,
        pairs: createPairs(),
      };

    default:
      return state;
  }
}
