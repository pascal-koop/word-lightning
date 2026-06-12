import { useEffect, useRef, useState } from "react";
import QuestionListItem from "../QuestionListItem.tsx";
import AddQuestionDialog from "../dialogs/AddQuestionDialog.tsx";
import ThemeSwitchDialog from "../dialogs/ThemeSwitchDialog.tsx";
import QuestionSourceToggle from "../QuestionSourceToggle.tsx";
import { MAX_CUSTOM_QUESTIONS, type QuestionSource } from "../../db/db.ts";
import { buildVisibleQuestions } from "../../game/questionList.ts";
import { useAddQuestionForm } from "../../hooks/useAddQuestionForm.ts";
import type { AddQuestionResult } from "../../hooks/useGame.ts";
import type { PlaySelection } from "../../game/playSelection.ts";
import { findThemeById } from "../../game/themes.ts";
import BackButton from "../BackButton.tsx";

const PAGE_SIZE = 15;

type CustomQuestionScreenProps = {
  onBack: () => void;
  defaultQuestions: string[];
  customQuestions: string[];
  onDeleteQuestion: (question: string) => Promise<void>;
  onEditQuestion: (oldQuestion: string, newQuestion: string) => Promise<void>;
  onAddQuestion: (question: string) => Promise<AddQuestionResult>;
  questionSource: QuestionSource;
  onChangeQuestionSource: (value: QuestionSource) => void;
  selection: PlaySelection;
  onSetQuestionsSelected: (texts: string[], selected: boolean) => void;
};

export default function CustomQuestionScreen({
  onBack,
  defaultQuestions,
  customQuestions,
  onDeleteQuestion,
  onEditQuestion,
  onAddQuestion,
  questionSource,
  onChangeQuestionSource,
  selection,
  onSetQuestionsSelected,
}: CustomQuestionScreenProps) {
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [pendingTexts, setPendingTexts] = useState<string[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const isAtLimit = customQuestions.length >= MAX_CUSTOM_QUESTIONS;

  const visibleQuestions = buildVisibleQuestions(
    questionSource,
    defaultQuestions,
    customQuestions,
  );
  const visibleTexts = visibleQuestions.map((entry) => entry.text);

  const totalPages = Math.max(
    1,
    Math.ceil(visibleQuestions.length / PAGE_SIZE),
  );
  const safePage = Math.min(currentPage, totalPages);
  const pageStartIndex = (safePage - 1) * PAGE_SIZE;
  const pagedQuestions = visibleQuestions.slice(
    pageStartIndex,
    pageStartIndex + PAGE_SIZE,
  );

  const goToPreviousPage = () => setCurrentPage(Math.max(1, safePage - 1));
  const goToNextPage = () => setCurrentPage(Math.min(totalPages, safePage + 1));

  const handleChangeQuestionSource = (value: QuestionSource) => {
    setCurrentPage(1);
    onChangeQuestionSource(value);
  };

  const isSelectedForPlay = (text: string) =>
    selection.mode === "mix" && selection.selectedTexts.includes(text);

  const selectedVisibleCount = visibleTexts.filter(isSelectedForPlay).length;
  const areAllVisibleSelected =
    visibleTexts.length > 0 && selectedVisibleCount === visibleTexts.length;
  const areSomeVisibleSelected =
    selectedVisibleCount > 0 && !areAllVisibleSelected;

  const activeTheme =
    selection.mode === "theme" ? findThemeById(selection.themeId) : undefined;

  const handleTogglePlay = (text: string) => {
    if (selection.mode === "theme") {
      setPendingTexts([text]);
      return;
    }
    onSetQuestionsSelected([text], !isSelectedForPlay(text));
  };

  const handleToggleAll = () => {
    if (selection.mode === "theme") {
      setPendingTexts(visibleTexts);
      return;
    }
    onSetQuestionsSelected(visibleTexts, !areAllVisibleSelected);
  };

  const confirmThemeSwitch = () => {
    if (pendingTexts) onSetQuestionsSelected(pendingTexts, true);
    setPendingTexts(null);
  };

  const allQuestionTexts = [...defaultQuestions, ...customQuestions];

  const addForm = useAddQuestionForm({
    existingQuestions: allQuestionTexts,
    onAddQuestion,
    onSuccess: () => setIsAddQuestionOpen(false),
  });

  const handleCloseAddQuestion = () => {
    setIsAddQuestionOpen(false);
    addForm.reset();
  };

  const emptyStateMessage = (() => {
    switch (questionSource) {
      case "default":
        return "No default questions have been seeded yet.";
      case "custom":
        return "No custom questions yet. Add your first one.";
      case "both":
        return "No questions yet. Add your first one.";
    }
  })();

  return (
    <div className="mx-auto w-full max-w-2xl rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl backdrop-blur md:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900">My Questions</h2>
          <p
            className={`mt-1 text-xs font-semibold ${
              isAtLimit ? "text-red-600" : "text-slate-500"
            }`}
          >
            {customQuestions.length} / {MAX_CUSTOM_QUESTIONS} custom questions
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsAddQuestionOpen(true)}
            disabled={isAtLimit}
            title={
              isAtLimit
                ? `Limit of ${MAX_CUSTOM_QUESTIONS} custom questions reached`
                : undefined
            }
            className="disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add question
          </button>
          <BackButton onBack={onBack} />
        </div>
      </div>
      {isAtLimit && (
        <p role="status" className="mb-4 text-center text-xs text-red-600">
          limit reached. delete custom questions to add new ones.
        </p>
      )}
      <div className="mb-4">
        <QuestionSourceToggle
          questionSource={questionSource}
          onChange={handleChangeQuestionSource}
        />
      </div>
      <p className="mb-4 text-center font-bold text-base text-indigo-600">
        {selection.mode === "theme"
          ? `Currently playing the theme „${
              activeTheme?.name ?? ""
            }". Check questions to play a custom mix instead.`
          : "Check questions to play a custom mix instead."}
      </p>
      {visibleQuestions.length > 0 && (
        <label className="mb-3 flex items-center gap-3 rounded-2xl bg-slate-100 px-4 py-3 font-semibold text-slate-800">
          <SelectAllCheckbox
            checked={areAllVisibleSelected}
            indeterminate={areSomeVisibleSelected}
            onToggle={handleToggleAll}
          />
          <span>
            Select all ({selectedVisibleCount}/{visibleTexts.length})
          </span>
        </label>
      )}
      <ul aria-label="Question list" className="space-y-3">
        {pagedQuestions.map((entry) => (
          <QuestionListItem
            key={`${entry.isCustom ? "custom" : "default"}-${entry.text}`}
            question={entry.text}
            questions={allQuestionTexts}
            isCustom={entry.isCustom}
            isSelectedForPlay={isSelectedForPlay(entry.text)}
            onTogglePlay={handleTogglePlay}
            onDeleteQuestion={onDeleteQuestion}
            onEditQuestion={onEditQuestion}
          />
        ))}
      </ul>
      {totalPages > 1 && (
        <nav
          aria-label="Question list pagination"
          className="mt-4 flex items-center justify-between gap-3"
        >
          <button
            onClick={goToPreviousPage}
            disabled={safePage === 1}
            className="disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm font-semibold text-slate-600">
            Page {safePage} of {totalPages}
          </span>
          <button
            onClick={goToNextPage}
            disabled={safePage === totalPages}
            className="disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </nav>
      )}
      {visibleQuestions.length === 0 && (
        <p className="rounded-2xl bg-[#6365f117] px-4 py-6 text-center text-slate-600">
          {emptyStateMessage}
        </p>
      )}
      <AddQuestionDialog
        isOpen={isAddQuestionOpen}
        newQuestion={addForm.value}
        shouldShowValidationError={addForm.shouldShowValidationError}
        validationError={addForm.validationError}
        submitError={addForm.submitError}
        isAddDisabled={addForm.isDisabled}
        isSubmitting={addForm.isSubmitting}
        onQuestionChange={addForm.handleChange}
        onSubmit={addForm.handleSubmit}
        onClose={handleCloseAddQuestion}
      />
      <ThemeSwitchDialog
        isOpen={pendingTexts !== null}
        themeName={activeTheme?.name ?? ""}
        onClose={() => setPendingTexts(null)}
        onConfirm={confirmThemeSwitch}
      />
    </div>
  );
}

function SelectAllCheckbox({
  checked,
  indeterminate,
  onToggle,
}: {
  checked: boolean;
  indeterminate: boolean;
  onToggle: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      className="h-5 w-5 shrink-0 cursor-pointer accent-indigo-600"
      checked={checked}
      onChange={onToggle}
      aria-label="Select all visible questions"
    />
  );
}
