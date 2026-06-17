import { useState, type FormEvent } from "react";
import type { Player } from "../game/initialState";
import { PLAYER_NAME_MAX_LENGTH, validatePlayerName } from "../game/players";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type PlayerSetupProps = {
  players: Player[];
  onAddPlayer: (name: string) => void;
  onRemovePlayer: (id: string) => void;
};

function describeValidationError(
  reason: "empty" | "too-long" | "duplicate",
): string {
  switch (reason) {
    case "empty":
      return "Please type a player name first.";
    case "too-long":
      return `Names can be at most ${PLAYER_NAME_MAX_LENGTH} characters.`;
    case "duplicate":
      return "That player is already in the line-up.";
  }
}

export default function PlayerSetup({
  players,
  onAddPlayer,
  onRemovePlayer,
}: PlayerSetupProps) {
  const [name, setName] = useState("");
  const [hasInteracted, setHasInteracted] = useState(false);

  const validation = validatePlayerName(name, players);
  const shouldShowError = hasInteracted && !validation.ok && name.length > 0;
  const errorMessage =
    !validation.ok && shouldShowError
      ? describeValidationError(validation.reason)
      : null;
  const isAddDisabled = !validation.ok;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validation.ok) {
      setHasInteracted(true);
      return;
    }
    onAddPlayer(validation.name);
    setName("");
    setHasInteracted(false);
  };

  return (
    <section aria-labelledby="player-setup-heading">
      <h3
        id="player-setup-heading"
        className="text-sm font-semibold text-foreground"
      >
        Players
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Add at least one player – points are credited after every swipe.
      </p>

      <form className="mt-3 flex flex-col gap-2" onSubmit={handleSubmit}>
        <div className="flex gap-2">
          <Input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onFocus={() => setHasInteracted(true)}
            maxLength={PLAYER_NAME_MAX_LENGTH + 8}
            placeholder="Player name"
            aria-invalid={shouldShowError}
            aria-label="New player name"
          />
          <Button type="submit" disabled={isAddDisabled} aria-label="Add player">
            Add
          </Button>
        </div>
        {errorMessage && (
          <p className="text-xs font-semibold text-destructive">
            {errorMessage}
          </p>
        )}
      </form>

      {players.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-2" aria-label="Player list">
          {players.map((player) => (
            <li
              key={player.id}
              className="flex items-center justify-between rounded-lg border bg-card px-3 py-2"
            >
              <Badge variant="secondary">{player.name}</Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRemovePlayer(player.id)}
                aria-label={`Remove ${player.name}`}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 rounded-lg border bg-muted/50 px-3 py-2 text-center text-xs text-muted-foreground">
          No players yet.
        </p>
      )}
    </section>
  );
}
