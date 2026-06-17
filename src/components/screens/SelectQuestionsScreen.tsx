import { useState } from "react";
import ThemePicker from "../ThemePicker.tsx";
import AddQuestionDialog from "../dialogs/AddQuestionDialog.tsx";
import { useAddQuestionForm } from "../../hooks/useAddQuestionForm.ts";
import { MAX_CUSTOM_QUESTIONS } from "../../db/db.ts";
import type { Theme } from "../../game/themes.ts";
import type { PlaySelection } from "../../game/playSelection.ts";
import type { AddQuestionResult } from "../../hooks/useGame.ts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type SelectQuestionsScreenProps = {
  onBack: () => void;
  onGoToCustomQuestions: () => void;
  defaultQuestions: string[];
  customQuestions: string[];
  customCount: number;
  themes: Theme[];
  selection: PlaySelection;
  onSelectTheme: (themeId: string) => void;
  onClearTheme: () => void;
  activeCount: number;
  onAddQuestion: (rawQuestion: string) => Promise<AddQuestionResult>;
};

export default function SelectQuestionsScreen({
  onBack,
  onGoToCustomQuestions,
  defaultQuestions,
  customQuestions,
  customCount,
  themes,
  selection,
  onSelectTheme,
  onClearTheme,
  activeCount,
  onAddQuestion,
}: SelectQuestionsScreenProps) {
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);

  const isAtLimit = customCount >= MAX_CUSTOM_QUESTIONS;

  const addForm = useAddQuestionForm({
    existingQuestions: [...defaultQuestions, ...customQuestions],
    onAddQuestion,
    onSuccess: () => setIsAddQuestionOpen(false),
  });

  const handleCloseAddQuestion = () => {
    setIsAddQuestionOpen(false);
    addForm.reset();
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                Questions
              </p>
              <CardTitle className="mt-1 text-2xl font-black">
                What will be played?
              </CardTitle>
            </div>
            <Badge aria-live="polite">{activeCount} active</Badge>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          <ThemePicker
            themes={themes}
            selection={selection}
            onSelectTheme={onSelectTheme}
            onClearTheme={onClearTheme}
          />

          <section aria-labelledby="mix-heading">
            <h4
              id="mix-heading"
              className="text-sm font-semibold text-foreground"
            >
              Custom mix
            </h4>
            <p className="mt-1 text-xs text-muted-foreground">
              Write your own questions and check individual questions in the list
              to build your own mix.
            </p>
            <Button
              variant="outline"
              className="mt-3 w-full"
              aria-label="Select and manage questions"
              onClick={onGoToCustomQuestions}
            >
              Manage questions
            </Button>
          </section>

          {isAtLimit && (
            <p role="status" className="text-center text-xs text-destructive">
              Limit reached. Delete custom questions to add new ones.
            </p>
          )}
        </CardContent>

        <CardFooter>
          <Button className="w-full" onClick={onBack}>
            Done
          </Button>
        </CardFooter>

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
      </Card>
    </div>
  );
}
