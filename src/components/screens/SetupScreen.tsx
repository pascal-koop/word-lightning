import PlayerSetup from "../PlayerSetup";
import type { Player } from "../../game/initialState";
import type { SelectionSummary } from "../../game/playSelection.ts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type SetupScreenProps = {
  onStart: () => void;
  onGoToSelectQuestions: () => void;
  selectionSummary: SelectionSummary;
  players: Player[];
  onAddPlayer: (name: string) => void;
  onRemovePlayer: (id: string) => void;
};

export default function SetupScreen({
  onStart,
  onGoToSelectQuestions,
  selectionSummary,
  players,
  onAddPlayer,
  onRemovePlayer,
}: SetupScreenProps) {
  const hasPlayers = players.length > 0;
  const hasActiveQuestions = selectionSummary.count > 0;
  const isStartDisabled = !hasPlayers || !hasActiveQuestions;

  const startHint = (() => {
    if (!hasActiveQuestions && !hasPlayers) {
      return "Add a player and select questions.";
    }
    if (!hasActiveQuestions) {
      return "Select a theme or individual questions.";
    }
    if (!hasPlayers) {
      return "Add at least one player to start.";
    }
    return null;
  })();

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-black">Ready to play?</CardTitle>
          <CardDescription>
            Add players, pick your prompts, then hit start.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-5">
          <PlayerSetup
            players={players}
            onAddPlayer={onAddPlayer}
            onRemovePlayer={onRemovePlayer}
          />

          <section aria-labelledby="questions-setup-heading">
            <div className="flex items-center justify-between">
              <h3
                id="questions-setup-heading"
                className="text-sm font-semibold text-foreground"
              >
                Questions
              </h3>
              <Badge variant="secondary" aria-live="polite">
                {selectionSummary.count} active
              </Badge>
            </div>

            <p className="mt-2 text-sm text-muted-foreground">
              {selectionSummary.title}
            </p>

            <Button
              variant="outline"
              className="mt-3 w-full"
              onClick={onGoToSelectQuestions}
            >
              {hasActiveQuestions ? "Change selection" : "Select questions"}
            </Button>
          </section>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Button
            className="w-full"
            size="lg"
            onClick={onStart}
            disabled={isStartDisabled}
          >
            Start game
          </Button>
          {startHint && (
            <p
              role="status"
              className="text-center text-xs text-muted-foreground"
            >
              {startHint}
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
