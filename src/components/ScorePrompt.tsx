import type { Player } from "../game/initialState";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type ScorePromptProps = {
  players: Player[];
  onAwardPoint: (playerId: string) => void;
};

export default function ScorePrompt({
  players,
  onAwardPoint,
}: ScorePromptProps) {
  return (
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="score-prompt-heading"
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-sm"
    >
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle id="score-prompt-heading">Who got the point?</CardTitle>
          <CardDescription>
            Tap a player to award them one point and continue.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <ul aria-label="Players" className="flex flex-col gap-2">
            {players.map((player) => (
              <li key={player.id}>
                <Button
                  className="flex w-full items-center justify-between"
                  onClick={() => onAwardPoint(player.id)}
                  aria-label={`Award one point to ${player.name}`}
                >
                  <span className="font-semibold">{player.name}</span>
                  <span className="rounded-full bg-primary-foreground/20 px-3 py-1 text-sm">
                    {player.score}
                  </span>
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
