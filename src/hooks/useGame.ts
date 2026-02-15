import { useReducer } from "react";
import reducer from "../game/reducer.ts";
import { initialState } from "../game/initialState.ts";

export function useGame() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return {
    state,
    startGame: () => dispatch({ type: "START_GAME" }),
    endGame: () => dispatch({ type: "END_GAME" }),
    nextPair: () => dispatch({ type: "NEXT_PAIR" }),
  };
}
