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
    goToAddQuestion: () => dispatch({ type: "GO_TO_ADD_QUESTION" }),
    goToSetup: () => dispatch({ type: "GO_TO_SETUP" }),
    addQuestion: (question: string) =>
      dispatch({ type: "ADD_QUESTION", payload: question }),
  };
}
