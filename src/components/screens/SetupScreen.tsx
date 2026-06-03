import { useState } from "react";
import PlayerSetup from "../PlayerSetup";
import QuestionSourceToggle from "../QuestionSourceToggle.tsx";
import AddQuestionDialog from "../dialogs/AddQuestionDialog.tsx";
import { useAddQuestionForm } from "../../hooks/useAddQuestionForm.ts";
import type { Player } from "../../game/initialState";
import { type QuestionSource } from "../../db/db.ts";

type SetupScreenProps = {
  onStart: () => void;
  onGoToCustomQuestions: () => void;
  // The two source tables come in unmerged so the screen can show a
  // breakdown ("X default · Y custom · Z active") and the modal's
  // duplicate check has access to both.
  defaultQuestions: string[];
  customQuestions: string[];
  questionSource: QuestionSource;
  onChangeQuestionSource: (value: QuestionSource) => void;
  onAddQuestion: (rawQuestion: string) => Promise<void>;
  players: Player[];
  onAddPlayer: (name: string) => void;
  onRemovePlayer: (id: string) => void;
};

export default function SetupScreen({
  onStart,
  onGoToCustomQuestions,
  defaultQuestions,
  customQuestions,
  questionSource,
  onChangeQuestionSource,
  onAddQuestion,
  players,
  onAddPlayer,
  onRemovePlayer,
}: SetupScreenProps) {
  // The "Add question" modal is local UI state – not worth lifting up
  // to the reducer, because no other screen needs to know about it.
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);

  // The quick-add form on this screen shares the exact same
  // validation and submission behaviour as the one on the manage
  // screen, so we factor it into a small hook.
  const addForm = useAddQuestionForm({
    existingQuestions: [...defaultQuestions, ...customQuestions],
    onAddQuestion,
    onSuccess: () => setIsAddQuestionOpen(false),
  });

  // Active count is what actually gets played with – the breakdown
  // makes it obvious *why* that number is what it is.
  const activeCount = (() => {
    switch (questionSource) {
      case "default":
        return defaultQuestions.length;
      case "custom":
        return customQuestions.length;
      case "both":
        return defaultQuestions.length + customQuestions.length;
    }
  })();

  const hasPlayers = players.length > 0;
  const hasActiveQuestions = activeCount > 0;
  const isStartDisabled = !hasPlayers || !hasActiveQuestions;

  // Tell the user *why* the start button is disabled instead of
  // leaving them guessing. We tailor the message to whatever is
  // missing right now.
  const startHint = (() => {
    if (!hasActiveQuestions && !hasPlayers) {
      return "Add a player and pick a source with questions to start.";
    }
    if (!hasActiveQuestions) {
      return "The selected source has no questions yet. Add one or switch the source.";
    }
    if (!hasPlayers) {
      return "Add at least one player to start.";
    }
    return null;
  })();

  const handleCloseAddQuestion = () => {
    setIsAddQuestionOpen(false);
    addForm.reset();
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur">
        <div className="mb-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">
            Game Setup
          </p>
          <h2 className="mt-2 text-3xl font-black text-slate-900">
            Ready to play?
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Add players, pick your prompts, then hit start.
          </p>
        </div>

        {/* 1. Players section */}
        <div className="mb-5">
          <PlayerSetup
            players={players}
            onAddPlayer={onAddPlayer}
            onRemovePlayer={onRemovePlayer}
          />
        </div>

        {/* 2. Questions section – the source toggle and the count
            breakdown live here, right next to Start, so the user
            doesn't have to dig into a sub-screen to choose what
            they're going to play with. */}
        <section
          aria-labelledby="questions-setup-heading"
          className="mb-5 rounded-2xl border border-indigo-100 bg-white px-4 py-3"
        >
          <div className="flex items-center justify-between">
            <h3
              id="questions-setup-heading"
              className="text-sm font-semibold text-slate-700"
            >
              Questions
            </h3>
            <span
              aria-live="polite"
              className="text-xs font-semibold text-indigo-700"
            >
              {activeCount} active
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Choose which prompts to play with.
          </p>

          <div className="mt-3">
            <QuestionSourceToggle
              questionSource={questionSource}
              onChange={onChangeQuestionSource}
            />
          </div>

          <p className="mt-3 text-center text-xs text-slate-500">
            <span className="font-semibold text-slate-700">
              {defaultQuestions.length}
            </span>{" "}
            default ·{" "}
            <span className="font-semibold text-slate-700">
              {customQuestions.length}
            </span>{" "}
            custom
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setIsAddQuestionOpen(true)}
              className="bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              + Add question
            </button>
            <button
              type="button"
              onClick={onGoToCustomQuestions}
              className="bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              Manage list
            </button>
          </div>
        </section>

        {/* 3. Start CTA – the most important action sits at the
            bottom where the thumb lands on mobile. */}
        <button
          className="w-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onStart}
          disabled={isStartDisabled}
        >
          ▶ Start game
        </button>
        {startHint && (
          <p
            role="status"
            className="mt-2 text-center text-xs text-slate-500"
          >
            {startHint}
          </p>
        )}

        <AddQuestionDialog
          isOpen={isAddQuestionOpen}
          newQuestion={addForm.value}
          shouldShowValidationError={addForm.shouldShowValidationError}
          validationError={addForm.validationError}
          isAddDisabled={addForm.isDisabled}
          isSubmitting={addForm.isSubmitting}
          onQuestionChange={addForm.handleChange}
          onSubmit={addForm.handleSubmit}
          onClose={handleCloseAddQuestion}
        />
      </div>
    </div>
  );
}
