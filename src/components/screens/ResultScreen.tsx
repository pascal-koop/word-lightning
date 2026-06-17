import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import confetti from "canvas-confetti";
import type { Player } from "../../game/initialState";
import { rankPlayers } from "../../game/players";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type ResultScreenProps = {
  players: Player[];
  onRestart: () => void;
};

function fireConfetti() {
  const end = Date.now() + 2_500;

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
    });

    if (Date.now() < end) requestAnimationFrame(frame);
  };

  frame();
}

const WINNER_SPLASH_DURATION_MS = 4_200;

export default function ResultScreen({
  players,
  onRestart,
}: ResultScreenProps) {
  const ranked = rankPlayers(players);
  const topScore = ranked[0]?.score ?? 0;
  const hasAnyScore = topScore > 0;

  const winners = hasAnyScore ? ranked.filter((p) => p.score === topScore) : [];

  const winnerLabel =
    winners.length === 1
      ? winners[0].name
      : winners.map((w) => w.name).join(" & ");

  const [showSplash, setShowSplash] = useState(hasAnyScore);

  useEffect(() => {
    if (!hasAnyScore) return;

    fireConfetti();

    const timer = setTimeout(
      () => setShowSplash(false),
      WINNER_SPLASH_DURATION_MS,
    );
    return () => clearTimeout(timer);
  }, [hasAnyScore]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <AnimatePresence>
        {showSplash && (
          <motion.div
            aria-label={`${winnerLabel} ${winners.length > 1 ? "win" : "wins"}!`}
            className="pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <motion.span
              className="text-6xl"
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
            >
              🏆
            </motion.span>

            <motion.h1
              className="px-4 text-center text-5xl font-black tracking-tight text-primary drop-shadow-lg sm:text-6xl"
              initial={{ scale: 0.3, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 220,
                damping: 16,
                delay: 0.15,
              }}
            >
              {winnerLabel}
            </motion.h1>

            <motion.p
              className="text-lg font-semibold text-primary/70"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {winners.length > 1 ? "Winners!" : "Winner!"}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        role="region"
        aria-label="Game results"
        className="w-full max-w-md"
        initial={hasAnyScore ? { opacity: 0, y: 20 } : undefined}
        animate={{ opacity: 1, y: 0 }}
        transition={
          hasAnyScore
            ? { delay: WINNER_SPLASH_DURATION_MS / 1000 - 0.3, duration: 0.4 }
            : undefined
        }
      >
        <Card>
          <CardHeader className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Round over
            </p>
            <CardTitle className="text-2xl font-black">Final scores</CardTitle>
            {!hasAnyScore && (
              <CardDescription>
                No points were awarded this round.
              </CardDescription>
            )}
          </CardHeader>

          <CardContent>
            {ranked.length > 0 ? (
              <ol aria-label="Scoreboard" className="flex flex-col gap-2">
                {ranked.map((player, index) => {
                  const isWinner = hasAnyScore && player.score === topScore;
                  return (
                    <li
                      key={player.id}
                      className={
                        isWinner
                          ? "flex items-center justify-between rounded-lg bg-primary px-4 py-3 text-primary-foreground shadow-md"
                          : "flex items-center justify-between rounded-lg border bg-secondary px-4 py-3 text-secondary-foreground"
                      }
                    >
                      <span className="flex items-center gap-3">
                        <span
                          aria-hidden="true"
                          className={
                            isWinner
                              ? "text-lg font-black"
                              : "text-sm font-semibold text-muted-foreground"
                          }
                        >
                          #{index + 1}
                        </span>
                        <span className="font-semibold">{player.name}</span>
                      </span>
                      <span
                        className={
                          isWinner
                            ? "text-2xl font-black"
                            : "text-xl font-bold text-primary"
                        }
                      >
                        {player.score}
                      </span>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="rounded-lg border bg-muted px-4 py-3 text-center text-sm text-muted-foreground">
                No players were registered for this round.
              </p>
            )}
          </CardContent>

          <CardFooter>
            <Button className="w-full" onClick={onRestart}>
              Play again
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
