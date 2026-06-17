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
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PAGE_SIZE = 10;

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
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-2xl font-black">My Questions</CardTitle>
            <CardDescription
              className={isAtLimit ? "text-destructive" : undefined}
            >
              {customQuestions.length} / {MAX_CUSTOM_QUESTIONS} custom questions
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsAddQuestionOpen(true)}
              disabled={isAtLimit}
              title={
                isAtLimit
                  ? `Limit of ${MAX_CUSTOM_QUESTIONS} custom questions reached`
                  : undefined
              }
            >
              Add question
            </Button>
            <BackButton onBack={onBack} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {isAtLimit && (
          <p role="status" className="text-center text-xs text-destructive">
            Limit reached. Delete custom questions to add new ones.
          </p>
        )}

        <QuestionSourceToggle
          questionSource={questionSource}
          onChange={handleChangeQuestionSource}
        />

        <p className="text-center text-sm font-semibold text-primary">
          {selection.mode === "theme"
            ? `Currently playing the theme „${
                activeTheme?.name ?? ""
              }". Check questions to play a custom mix instead.`
            : "Check questions to play a custom mix instead."}
        </p>

        {visibleQuestions.length > 0 && (
          <label className="flex items-center gap-3 rounded-lg border bg-secondary px-4 py-3 font-semibold text-secondary-foreground">
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

        <ul aria-label="Question list" className="flex flex-col gap-3">
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
            className="flex items-center justify-between gap-3"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={safePage === 1}
            >
              Previous
            </Button>
            <Badge variant="secondary">
              Page {safePage} of {totalPages}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={safePage === totalPages}
            >
              Next
            </Button>
          </nav>
        )}

        {visibleQuestions.length === 0 && (
          <p className="rounded-lg border bg-secondary/50 px-4 py-6 text-center text-muted-foreground">
            {emptyStateMessage}
          </p>
        )}
      </CardContent>

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
    </Card>
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
      className="size-5 shrink-0 cursor-pointer accent-primary"
      checked={checked}
      onChange={onToggle}
      aria-label="Select all visible questions"
    />
  );
}
