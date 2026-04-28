import { useCallback, useMemo, useReducer } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import reducer from "../game/reducer.ts";
import { initialState } from "../game/initialState.ts";
import {
  db,
  SETTINGS_KEYS,
  isQuestionSource,
  type QuestionRecord,
  type QuestionSource,
} from "../db/db.ts";
import {
  isDuplicateQuestion,
  validateQuestionInput,
} from "../game/questionValidation.ts";

export function useGame() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const defaultQuestions = useLiveQuery(
    () => db.defaultQuestions.toArray(),
    [],
  );
  const customQuestions = useLiveQuery(() => db.customQuestions.toArray(), []);
  const questionSourceSetting = useLiveQuery(
    () => db.settings.get(SETTINGS_KEYS.questionSource),
    [],
  );

  const isLoading =
    defaultQuestions === undefined ||
    customQuestions === undefined ||
    questionSourceSetting === undefined;

  const questionSource: QuestionSource =
    questionSourceSetting && isQuestionSource(questionSourceSetting.value)
      ? questionSourceSetting.value
      : "default";

  const activeQuestionTexts = useMemo(() => {
    const defaultTexts = (defaultQuestions ?? []).map((q) => q.text);
    const customTexts = (customQuestions ?? []).map((q) => q.text);
    switch (questionSource) {
      case "default":
        return defaultTexts;
      case "custom":
        return customTexts;
      case "both":
        return [...defaultTexts, ...customTexts];
    }
  }, [defaultQuestions, customQuestions, questionSource]);

  const addCustomQuestion = useCallback(async (rawInput: string) => {
    const validation = validateQuestionInput(rawInput);
    if (!validation.success) return;

    const existingTexts = (await db.customQuestions.toArray()).map(
      (row) => row.text,
    );
    if (isDuplicateQuestion(validation.data, existingTexts)) return;

    await db.customQuestions.add({ text: validation.data } as QuestionRecord);
  }, []);

  const deleteCustomQuestion = useCallback(async (text: string) => {
    await db.customQuestions.where("text").equals(text).delete();
  }, []);

  const editCustomQuestion = useCallback(
    async (oldText: string, newText: string) => {
      const validation = validateQuestionInput(newText);
      if (!validation.success) return;

      const others = (await db.customQuestions.toArray())
        .filter((row) => row.text !== oldText)
        .map((row) => row.text);
      if (isDuplicateQuestion(validation.data, others)) return;

      await db.customQuestions
        .where("text")
        .equals(oldText)
        .modify({ text: validation.data });
    },
    [],
  );

  const setQuestionSource = useCallback(async (value: QuestionSource) => {
    await db.settings.put({
      key: SETTINGS_KEYS.questionSource,
      value,
    });
  }, []);

  return {
    state,
    isLoading,
    defaultQuestions: defaultQuestions ?? [],
    customQuestions: customQuestions ?? [],
    questionSource,
    activeQuestionTexts,
    startGame: () =>
      dispatch({ type: "START_GAME", payload: activeQuestionTexts }),
    endGame: () => dispatch({ type: "END_GAME" }),
    nextPair: () =>
      dispatch({ type: "NEXT_PAIR", payload: activeQuestionTexts }),
    goToAddQuestion: () => dispatch({ type: "GO_TO_ADD_QUESTION" }),
    goToSetup: () => dispatch({ type: "GO_TO_SETUP" }),
    goToCustomQuestion: () => dispatch({ type: "GO_TO_CUSTOM_QUESTION" }),
    goBack: () => dispatch({ type: "GO_BACK" }),
    addQuestion: addCustomQuestion,
    deleteQuestion: deleteCustomQuestion,
    editQuestion: editCustomQuestion,
    setQuestionSource,
  };
}
