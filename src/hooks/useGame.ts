import { useCallback, useMemo, useReducer, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import reducer from "../game/reducer.ts";
import { initialState } from "../game/initialState.ts";
import {
  db,
  MAX_CUSTOM_QUESTIONS,
  type QuestionRecord,
  type QuestionSource,
} from "../db/db.ts";
import {
  isDuplicateQuestion,
  validateQuestionInput,
} from "../game/questionValidation.ts";
import { THEMES } from "../game/themes.ts";
import {
  describeSelection,
  initialPlaySelection,
  resolveActiveTexts,
  type PlaySelection,
} from "../game/playSelection.ts";

export type AddQuestionResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "duplicate" | "limit" };

export function useGame() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const defaultQuestions = useLiveQuery(
    () => db.defaultQuestions.toArray(),
    [],
  );
  const customQuestions = useLiveQuery(() => db.customQuestions.toArray(), []);

  const isLoading =
    defaultQuestions === undefined || customQuestions === undefined;

  const [playSelection, setPlaySelection] =
    useState<PlaySelection>(initialPlaySelection);

  const activeQuestionTexts = useMemo(() => {
    const standardTexts = (defaultQuestions ?? []).map((q) => q.text);
    const customTexts = (customQuestions ?? []).map((q) => q.text);
    return resolveActiveTexts(
      playSelection,
      standardTexts,
      customTexts,
      THEMES,
    );
  }, [defaultQuestions, customQuestions, playSelection]);

  const selectionSummary = useMemo(() => {
    const standardTexts = (defaultQuestions ?? []).map((q) => q.text);
    const customTexts = (customQuestions ?? []).map((q) => q.text);
    return describeSelection(playSelection, standardTexts, customTexts, THEMES);
  }, [defaultQuestions, customQuestions, playSelection]);

  const selectTheme = useCallback((themeId: string) => {
    setPlaySelection({ mode: "theme", themeId });
  }, []);

  const clearTheme = useCallback(() => {
    setPlaySelection({ mode: "mix", selectedTexts: [] });
  }, []);

  const setQuestionsSelected = useCallback(
    (texts: string[], selected: boolean) => {
      setPlaySelection((current) => {
        const base = current.mode === "mix" ? current.selectedTexts : [];
        if (selected) {
          return {
            mode: "mix",
            selectedTexts: [...new Set([...base, ...texts])],
          };
        }
        return {
          mode: "mix",
          selectedTexts: base.filter((entry) => !texts.includes(entry)),
        };
      });
    },
    [],
  );

  const addCustomQuestion = useCallback(
    async (rawInput: string): Promise<AddQuestionResult> => {
      const validation = validateQuestionInput(rawInput);
      if (!validation.success) return { ok: false, reason: "invalid" };

      const count = await db.customQuestions.count();
      if (count >= MAX_CUSTOM_QUESTIONS) {
        return { ok: false, reason: "limit" };
      }

      const existingTexts = (await db.customQuestions.toArray()).map(
        (row) => row.text,
      );
      if (isDuplicateQuestion(validation.data, existingTexts)) {
        return { ok: false, reason: "duplicate" };
      }

      await db.customQuestions.add({ text: validation.data } as QuestionRecord);
      return { ok: true };
    },
    [],
  );

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

  const [manageQuestionSource, setManageQuestionSource] =
    useState<QuestionSource>("both");

  return {
    state,
    isLoading,
    defaultQuestions: defaultQuestions ?? [],
    customQuestions: customQuestions ?? [],
    customCount: (customQuestions ?? []).length,
    themes: THEMES,
    playSelection,
    selectionSummary,
    activeQuestionTexts,
    selectTheme,
    clearTheme,
    setQuestionsSelected,
    startGame: () =>
      dispatch({ type: "START_GAME", payload: activeQuestionTexts }),
    endGame: () => dispatch({ type: "END_GAME" }),
    nextPair: () =>
      dispatch({ type: "NEXT_PAIR", payload: activeQuestionTexts }),
    goToSetup: () => dispatch({ type: "GO_TO_SETUP" }),
    goToSelectQuestions: () => dispatch({ type: "GO_TO_SELECT_QUESTIONS" }),
    goToCustomQuestion: () => dispatch({ type: "GO_TO_CUSTOM_QUESTION" }),
    goBack: () => dispatch({ type: "GO_BACK" }),
    addPlayer: (name: string) =>
      dispatch({ type: "ADD_PLAYER", payload: name }),
    removePlayer: (id: string) =>
      dispatch({ type: "REMOVE_PLAYER", payload: id }),
    onSwipe: () => dispatch({ type: "SWIPE_AWAITING_SCORE" }),
    awardPoint: (playerId: string) =>
      dispatch({ type: "AWARD_POINT", payload: playerId }),
    addQuestion: addCustomQuestion,
    deleteQuestion: deleteCustomQuestion,
    editQuestion: editCustomQuestion,
    manageQuestionSource,
    setManageQuestionSource,
  };
}
